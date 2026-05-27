import { stt, tts } from "@/lib/elevenlabs";
import { analyzeWithGemini } from "@/lib/reasoning";
import type { AnalyzeResponse } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_AUDIO_BYTES = 15 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const audio = form.get("audio");
    const audioFile = audio instanceof File && audio.size > 0 ? audio : null;
    const descriptionText = String(form.get("descriptionText") ?? "").trim();
    const when = String(form.get("when") ?? "").trim();
    const where = String(form.get("where") ?? "").trim();
    const soundType = String(form.get("soundType") ?? "").trim();

    if (!when || !where || !soundType) {
      return Response.json({ error: "Missing required symptom fields." }, { status: 400 });
    }
    if (!audioFile && !descriptionText) {
      return Response.json({ error: "Provide a recording or a description." }, { status: 400 });
    }
    if (audioFile && audioFile.size > MAX_AUDIO_BYTES) {
      return Response.json({ error: "Audio file too large (max 15MB)." }, { status: 413 });
    }

    let transcript: string | undefined;
    if (audioFile) transcript = await stt(audioFile);

    const finalText = transcript || descriptionText;
    if (!finalText) {
      return Response.json(
        { error: "Couldn't hear anything in the recording. Try again or type a description." },
        { status: 400 },
      );
    }

    const analysis = await analyzeWithGemini({ descriptionText: finalText, when, where, soundType });

    let explanationAudioBase64: string | undefined;
    try {
      const audioBuf = await tts(analysis.customerExplanation);
      explanationAudioBase64 = Buffer.from(audioBuf).toString("base64");
    } catch {
      // ElevenLabs quota exhausted — client will fall back to browser speech
    }

    const payload = { ...analysis } as AnalyzeResponse;
    if (transcript !== undefined) payload.transcript = transcript;
    if (explanationAudioBase64 !== undefined) payload.explanationAudioBase64 = explanationAudioBase64;
    return Response.json(payload);
  } catch (err) {
    console.error("[/api/analyze] error:", err);
    return Response.json(
      { error: "Something went wrong analyzing the noise. Please try again." },
      { status: 500 },
    );
  }
}

const ELEVEN_BASE = "https://api.elevenlabs.io/v1";

function apiKey() {
  const k = process.env.ELEVENLABS_API_KEY;
  if (!k) throw new Error("ELEVENLABS_API_KEY is not set");
  return k;
}

export async function stt(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("model_id", "scribe_v1");

  const res = await fetch(`${ELEVEN_BASE}/speech-to-text`, {
    method: "POST",
    headers: { "xi-api-key": apiKey() },
    body: form,
  });
  if (!res.ok) {
    throw new Error(`ElevenLabs STT failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { text?: string };
  return (json.text ?? "").trim();
}

export async function tts(text: string): Promise<ArrayBuffer> {
  const voiceId = process.env.ELEVENLABS_VOICE_ID ?? "21m00Tcm4TlvDq8ikWAM"; // Rachel
  const res = await fetch(`${ELEVEN_BASE}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey(),
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_turbo_v2_5",
      output_format: "mp3_44100_128",
    }),
  });
  if (!res.ok) {
    throw new Error(`ElevenLabs TTS failed: ${res.status} ${await res.text()}`);
  }
  return await res.arrayBuffer();
}

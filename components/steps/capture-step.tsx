"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Square, RotateCcw } from "lucide-react";

interface Props {
  descriptionText: string;
  setDescriptionText: (v: string) => void;
  audioBlob: Blob | null;
  setAudioBlob: (b: Blob | null) => void;
  onNext: () => void;
}

export function CaptureStep({
  descriptionText,
  setDescriptionText,
  audioBlob,
  setAudioBlob,
  onNext,
}: Props) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      recorderRef.current?.stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function startRecording() {
    setPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
      setElapsed(0);
      timerRef.current = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    } catch {
      setPermissionError("Microphone access denied. Use the text option instead.");
    }
  }

  function stopRecording() {
    recorderRef.current?.stop();
    if (timerRef.current) window.clearInterval(timerRef.current);
    setRecording(false);
  }

  const canContinue = !!audioBlob || descriptionText.trim().length > 0;
  const audioUrl = audioBlob ? URL.createObjectURL(audioBlob) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Describe the noise</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="record">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="record">Record</TabsTrigger>
            <TabsTrigger value="type">Type</TabsTrigger>
          </TabsList>

          <TabsContent value="record" className="space-y-4 pt-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Say what you&apos;re hearing — and when. e.g. <em>&ldquo;2013 Civic Si, 200k km, clicking
              on the front left when I go over bumps.&rdquo;</em>
            </p>
            <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-zinc-300 p-6 dark:border-zinc-700">
              {!recording ? (
                <Button
                  size="lg"
                  onClick={startRecording}
                  variant={audioBlob ? "outline" : "default"}
                >
                  {audioBlob ? (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4" /> Re-record
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-4 w-4" /> Start recording
                    </>
                  )}
                </Button>
              ) : (
                <Button size="lg" variant="destructive" onClick={stopRecording}>
                  <Square className="mr-2 h-4 w-4" /> Stop ({elapsed}s)
                </Button>
              )}
              {recording && (
                <div className="flex items-center gap-2 text-xs text-red-600">
                  <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-600" />
                  Recording…
                </div>
              )}
              {audioUrl && !recording && (
                <audio src={audioUrl} controls className="w-full" />
              )}
              {permissionError && (
                <p className="text-xs text-red-600">{permissionError}</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="type" className="space-y-2 pt-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Type a short description of the noise and when it happens.
            </p>
            <Textarea
              value={descriptionText}
              onChange={(e) => setDescriptionText(e.target.value)}
              placeholder="e.g. 2013 Civic Si, 200,000km, hearing a click on the front left when going over bumps."
              rows={5}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button disabled={!canContinue} onClick={onNext}>
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

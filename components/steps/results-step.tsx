"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Play, Pause, ExternalLink } from "lucide-react";
import type { AnalyzeResponse, Confidence } from "@/lib/types";

const confidenceVariant: Record<Confidence, "default" | "secondary" | "outline"> = {
  High: "default",
  Medium: "secondary",
  Low: "outline",
};

export function ResultsStep({ result }: { result: AnalyzeResponse }) {
  const [copied, setCopied] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!result.explanationAudioBase64) return;
    const bin = atob(result.explanationAudioBase64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const url = URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
    const el = new Audio(url);
    el.onended = () => setPlaying(false);
    audioRef.current = el;
    return () => { el.pause(); URL.revokeObjectURL(url); audioRef.current = null; };
  }, [result.explanationAudioBase64]);

  function toggle() {
    if (result.explanationAudioBase64) {
      const el = audioRef.current;
      if (!el) return;
      if (playing) { el.pause(); setPlaying(false); }
      else { void el.play(); setPlaying(true); }
    } else {
      if (playing) { window.speechSynthesis.cancel(); setPlaying(false); }
      else {
        const utt = new SpeechSynthesisUtterance(result.customerExplanation);
        utt.onend = () => setPlaying(false);
        window.speechSynthesis.speak(utt);
        setPlaying(true);
      }
    }
  }

  async function copySummary() {
    await navigator.clipboard.writeText(result.mechanicSummary);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-6">
      {result.transcript && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">What we heard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm italic text-zinc-600 dark:text-zinc-400">“{result.transcript}”</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Likely issues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.likelyIssues.map((issue, i) => (
            <div
              key={i}
              className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100">{issue.name}</h3>
                <Badge variant={confidenceVariant[issue.confidence]}>{issue.confidence}</Badge>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{issue.rationale}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plain-language explanation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200">
            {result.customerExplanation}
          </p>
          <Button variant="outline" size="sm" onClick={toggle}>
            {playing ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {playing ? "Pause" : "Play explanation"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mechanic summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <pre className="whitespace-pre-wrap rounded-md bg-zinc-100 p-3 font-mono text-xs text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
{result.mechanicSummary}
          </pre>
          <Button variant="outline" size="sm" onClick={copySummary}>
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? "Copied" : "Copy summary"}
          </Button>
        </CardContent>
      </Card>

      {result.resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Read what others say</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.resources.map((r, i) => (
                <li key={i}>
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-start gap-2 text-sm text-zinc-800 hover:text-zinc-950 dark:text-zinc-200 dark:hover:text-white"
                  >
                    <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 opacity-60 group-hover:opacity-100" />
                    <span>
                      <span className="font-medium underline-offset-2 group-hover:underline">{r.title}</span>
                      <span className="ml-2 text-xs text-zinc-500">{r.source}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

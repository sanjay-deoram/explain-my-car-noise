"use client";

import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CaptureStep } from "./steps/capture-step";
import { QuestionsStep, type SymptomAnswers } from "./steps/questions-step";
import { ResultsStep } from "./steps/results-step";
import type { AnalyzeResponse } from "@/lib/types";

type Step = "capture" | "questions" | "loading" | "results";

export function NoiseFlow() {
  const [step, setStep] = useState<Step>("capture");
  const [descriptionText, setDescriptionText] = useState("");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [answers, setAnswers] = useState<SymptomAnswers | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const progress =
    step === "capture" ? 33 : step === "questions" ? 66 : step === "loading" ? 90 : 100;

  async function submit(a: SymptomAnswers) {
    setAnswers(a);
    setError(null);
    setStep("loading");
    try {
      const form = new FormData();
      if (audioBlob) form.append("audio", new File([audioBlob], "noise.webm", { type: audioBlob.type || "audio/webm" }));
      form.append("descriptionText", descriptionText);
      form.append("when", a.when);
      form.append("where", a.where);
      form.append("soundType", a.soundType);
      const res = await fetch("/api/analyze", { method: "POST", body: form });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || `Request failed (${res.status})`);
      }
      const data = (await res.json()) as AnalyzeResponse;
      setResult(data);
      setStep("results");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setStep("questions");
    }
  }

  function reset() {
    setStep("capture");
    setDescriptionText("");
    setAudioBlob(null);
    setAnswers(null);
    setResult(null);
    setError(null);
  }

  return (
    <div className="space-y-6">
      <Progress value={progress} className="h-1" />

      {step === "capture" && (
        <CaptureStep
          descriptionText={descriptionText}
          setDescriptionText={setDescriptionText}
          audioBlob={audioBlob}
          setAudioBlob={setAudioBlob}
          onNext={() => setStep("questions")}
        />
      )}

      {step === "questions" && (
        <QuestionsStep
          initial={answers ?? undefined}
          error={error}
          onBack={() => setStep("capture")}
          onSubmit={submit}
        />
      )}

      {step === "loading" && (
        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Listening, looking things up, and writing it up… give it 20–40 seconds.
          </p>
        </div>
      )}

      {step === "results" && result && (
        <>
          <ResultsStep result={result} />
          <div className="flex justify-center">
            <Button variant="outline" onClick={reset}>Start over</Button>
          </div>
        </>
      )}
    </div>
  );
}

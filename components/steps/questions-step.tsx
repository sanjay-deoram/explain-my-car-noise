"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export interface SymptomAnswers {
  when: string;
  where: string;
  soundType: string;
}

const WHEN = ["Braking", "Accelerating", "Idling", "Turning", "Over bumps", "Cold start", "Highway speeds"];
const WHERE = ["Front left", "Front right", "Rear left", "Rear right", "Engine bay", "Under car", "Hard to tell"];
const SOUNDS = ["Squeal", "Click/Clunk", "Grinding", "Humming/Whine", "Rattle", "Thump"];

interface Props {
  initial?: SymptomAnswers;
  error?: string | null;
  onBack: () => void;
  onSubmit: (a: SymptomAnswers) => void;
}

function QuestionBlock({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const isOther = value !== "" && !options.includes(value);
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{title}</Label>
      <RadioGroup
        value={isOther ? "__other__" : value}
        onValueChange={(v) => onChange(v === "__other__" ? " " : v)}
        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
      >
        {options.map((opt) => (
          <div key={opt} className="flex items-center gap-2 rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
            <RadioGroupItem value={opt} id={`${title}-${opt}`} />
            <Label htmlFor={`${title}-${opt}`} className="cursor-pointer text-sm font-normal">
              {opt}
            </Label>
          </div>
        ))}
        <div className="flex items-center gap-2 rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
          <RadioGroupItem value="__other__" id={`${title}-other`} />
          <Label htmlFor={`${title}-other`} className="cursor-pointer text-sm font-normal">
            Other
          </Label>
        </div>
      </RadioGroup>
      {isOther && (
        <Input
          autoFocus
          value={value.trim()}
          onChange={(e) => onChange(e.target.value || " ")}
          placeholder="Describe it…"
        />
      )}
    </div>
  );
}

export function QuestionsStep({ initial, error, onBack, onSubmit }: Props) {
  const [when, setWhen] = useState(initial?.when ?? "");
  const [where, setWhere] = useState(initial?.where ?? "");
  const [soundType, setSoundType] = useState(initial?.soundType ?? "");

  const canSubmit = when.trim() && where.trim() && soundType.trim();

  return (
    <Card>
      <CardHeader>
        <CardTitle>A few details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <QuestionBlock title="When does it happen?" options={WHEN} value={when} onChange={setWhen} />
        <QuestionBlock title="Where does it seem to come from?" options={WHERE} value={where} onChange={setWhere} />
        <QuestionBlock title="What does it sound like?" options={SOUNDS} value={soundType} onChange={setSoundType} />

        {error && (
          <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button
            disabled={!canSubmit}
            onClick={() => onSubmit({ when: when.trim(), where: where.trim(), soundType: soundType.trim() })}
          >
            Analyze my car noise
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

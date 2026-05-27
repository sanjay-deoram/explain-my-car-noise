import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { SYSTEM_PROMPT } from "./prompts";
import type { AnalysisResult, SymptomInput } from "./types";

const ConfidenceSchema = z.enum(["High", "Medium", "Low"]);

const AnalysisSchema = z.object({
  likelyIssues: z
    .array(
      z.object({
        name: z.string(),
        confidence: ConfidenceSchema,
        rationale: z.string(),
      }),
    )
    .min(1)
    .max(5),
  customerExplanation: z.string(),
  mechanicSummary: z.string(),
  resources: z
    .array(
      z.object({
        title: z.string(),
        url: z.string().url(),
        source: z.string(),
      }),
    )
    .max(6),
});

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object in model output");
  return text.slice(start, end + 1);
}

export async function analyzeWithGemini(input: SymptomInput): Promise<AnalysisResult> {
  const userMsg = `Symptom report:
- Description: ${input.descriptionText || "(none provided)"}
- When it happens: ${input.when}
- Where it seems to come from: ${input.where}
- Closest sound type: ${input.soundType}

Return the JSON object exactly as specified.`;

  const result = await generateText({
    model: google("gemini-3.1-flash-lite"),
    system: SYSTEM_PROMPT,
    prompt: userMsg,
  });

  const raw = extractJson(result.text);
  const parsed = AnalysisSchema.parse(JSON.parse(raw));
  return parsed;
}

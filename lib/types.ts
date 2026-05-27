export type Confidence = "High" | "Medium" | "Low";

export interface LikelyIssue {
  name: string;
  confidence: Confidence;
  rationale: string;
}

export interface Resource {
  title: string;
  url: string;
  source: string;
}

export interface SymptomInput {
  descriptionText: string;
  when: string;
  where: string;
  soundType: string;
}

export interface AnalysisResult {
  likelyIssues: LikelyIssue[];
  customerExplanation: string;
  mechanicSummary: string;
  resources: Resource[];
}

export interface AnalyzeResponse extends AnalysisResult {
  transcript?: string;
  explanationAudioBase64?: string;
}

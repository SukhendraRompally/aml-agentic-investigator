export interface CompletedTransaction {
  nameOrig: string;
  amount: number;
  type: string;
  ai_decision: string;
  risk_level: string;
  pattern_type: string;
  behavioral_reasoning: string;
  actual_fraud: number;
  verdict: "TP" | "FP" | "FN" | "TN";
  has_sar: boolean;
  sar_report_id?: string;
}

export interface CumulativeData {
  true_positives: number;
  false_positives: number;
  false_negatives: number;
  true_negatives: number;
  precision: number | null;
  recall: number | null;
  sars_generated: number;
  completed_transactions: CompletedTransaction[];
}

export type PipelineRunStatus = "idle" | "running" | "done" | "error";

export interface PipelineStatusResponse {
  status: string;
  step: number;
  step_label: string;
  progress: number;
  progress_total: number;
  cumulative: CumulativeData;
}

export interface SAR {
  report_id: string;
  subject_id: string;
  narrative_of_suspicion: string;
  risk_level: string;
  suspicious_activity_type: string;
  recommended_action: string;
  generated_at: string;
}

export interface PipelineResults {
  triage_summary: {
    total_sampled: number;
    flagged_count: number;
    flag_rate_pct: number;
    by_type: Record<string, number>;
  };
  flagged_transactions: CompletedTransaction[];
  sars: SAR[];
  validation: {
    precision: number;
    recall: number;
    f1: number;
    true_positives: number;
    false_positives: number;
    false_negatives: number;
    true_negatives: number;
    sars_generated: number;
    false_positive_details: Array<{ nameOrig: string; behavioral_reasoning: string }>;
    false_negative_details: Array<{ nameOrig: string; behavioral_reasoning: string }>;
  };
}

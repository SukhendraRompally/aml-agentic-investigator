import type { AlertDetail } from "@workspace/api-client-react/src/generated/api.schemas";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Brain, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";

interface LLMReasoningStepProps {
  detail: AlertDetail | null | undefined;
  isLoading: boolean;
}

const decisionConfig = {
  SUSPICIOUS: {
    label: "SUSPICIOUS",
    icon: AlertCircle,
    className: "bg-destructive text-destructive-foreground",
    iconClass: "text-destructive",
    barColor: "bg-destructive",
  },
  BENIGN: {
    label: "BENIGN",
    icon: CheckCircle2,
    className: "bg-green-600 text-white",
    iconClass: "text-green-600",
    barColor: "bg-green-600",
  },
  REVIEW_NEEDED: {
    label: "REVIEW NEEDED",
    icon: HelpCircle,
    className: "bg-amber-500 text-white",
    iconClass: "text-amber-500",
    barColor: "bg-amber-500",
  },
};

export function LLMReasoningStep({ detail, isLoading }: LLMReasoningStepProps) {
  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="llm-loading">
        <div className="rounded-lg border border-border p-4">
          <Skeleton className="h-4 w-48 mb-3" />
          <Skeleton className="h-2 w-full mb-1" />
          <Skeleton className="h-2 w-32 mb-4" />
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!detail?.llmReasoning) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        LLM analysis not available for this alert
      </div>
    );
  }

  const r = detail.llmReasoning;
  const config =
    decisionConfig[r.aiDecision as keyof typeof decisionConfig] ??
    decisionConfig.REVIEW_NEEDED;
  const Icon = config.icon;
  const confPct = Math.round(r.confidenceScore * 100);

  const confColor =
    confPct >= 80
      ? "bg-destructive"
      : confPct >= 60
        ? "bg-amber-500"
        : "bg-green-600";

  return (
    <div className="space-y-4" data-testid="llm-step">
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">AI Decision</span>
            <span className="text-xs text-muted-foreground font-mono">
              ({r.modelUsed})
            </span>
          </div>
          <Badge className={`${config.className} text-xs px-3 py-1`} data-testid="ai-decision-badge">
            <Icon className="h-3 w-3 mr-1.5" />
            {config.label}
          </Badge>
        </div>

        <div className="mb-4" data-testid="confidence-score">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-muted-foreground font-medium">Confidence Score</span>
            <span
              className={`text-sm font-bold font-mono ${
                confPct >= 80
                  ? "text-destructive"
                  : confPct >= 60
                    ? "text-amber-500"
                    : "text-green-600"
              }`}
            >
              {confPct}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${confColor}`}
              style={{ width: `${confPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Forensic Analysis
        </p>
        <p
          className="text-sm text-foreground leading-relaxed whitespace-pre-wrap"
          data-testid="forensic-analysis"
        >
          {r.forensicAnalysis}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
          Key Risk Factors
        </p>
        <ul className="space-y-1.5" data-testid="risk-factors">
          {r.riskFactors.map((factor, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground">
              <span className="text-destructive font-bold mt-0.5 flex-shrink-0">›</span>
              {factor}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

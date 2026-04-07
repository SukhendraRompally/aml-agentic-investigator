import { CheckCircle2, XCircle, AlertTriangle, FileText, Target } from "lucide-react";
import type { CumulativeData } from "@/types/pipeline";

interface LiveScoreboardProps {
  cumulative: CumulativeData;
  isLive?: boolean;
}

function MetricBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  const pct = Math.round(value * 100);
  const color =
    pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-amber-500" : "bg-destructive";
  const textColor =
    pct >= 80
      ? "text-green-600"
      : pct >= 60
        ? "text-amber-500"
        : "text-destructive";

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={`text-sm font-bold font-mono ${textColor}`}>{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function LiveScoreboard({ cumulative, isLive = false }: LiveScoreboardProps) {
  const {
    true_positives,
    false_positives,
    false_negatives,
    true_negatives,
    sars_generated,
  } = cumulative;

  const precision = cumulative.precision ?? 0;
  const recall = cumulative.recall ?? 0;
  const f1 =
    precision + recall > 0
      ? (2 * precision * recall) / (precision + recall)
      : 0;

  const tiles = [
    {
      label: "True Positives",
      value: true_positives,
      sub: "Fraud caught",
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-500/10 border-green-500/20",
      testId: "score-tp",
    },
    {
      label: "False Positives",
      value: false_positives,
      sub: "Clean flagged",
      icon: XCircle,
      color: "text-destructive",
      bg: "bg-destructive/10 border-destructive/20",
      testId: "score-fp",
    },
    {
      label: "False Negatives",
      value: false_negatives,
      sub: "Fraud missed",
      icon: AlertTriangle,
      color: "text-amber-500",
      bg: "bg-amber-500/10 border-amber-500/20",
      testId: "score-fn",
    },
    {
      label: "True Negatives",
      value: true_negatives,
      sub: "Clean cleared",
      icon: CheckCircle2,
      color: "text-blue-500",
      bg: "bg-blue-500/10 border-blue-500/20",
      testId: "score-tn",
    },
    {
      label: "SARs Filed",
      value: sars_generated,
      sub: "Reports generated",
      icon: FileText,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
      testId: "score-sars",
    },
  ];

  return (
    <div className="space-y-4" data-testid="live-scoreboard">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Live Scoreboard</span>
        {isLive && (
          <span className="flex items-center gap-1 text-[10px] text-green-500 font-medium ml-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
            </span>
            LIVE
          </span>
        )}
      </div>

      <div className="grid grid-cols-5 gap-2">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <div
              key={t.label}
              className={`rounded-lg border px-3 py-2.5 text-center ${t.bg}`}
              data-testid={t.testId}
            >
              <Icon className={`h-4 w-4 mx-auto mb-1 ${t.color}`} />
              <p className={`text-2xl font-bold font-mono ${t.color}`}>{t.value}</p>
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                {t.label}
              </p>
              <p className="text-[9px] text-muted-foreground/70">{t.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-border bg-card px-4 py-3 space-y-2.5">
        <MetricBar label="Precision" value={precision} />
        <MetricBar label="Recall" value={recall} />
        <MetricBar label="F1 Score" value={f1} />
      </div>
    </div>
  );
}

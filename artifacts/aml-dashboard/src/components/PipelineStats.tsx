import { Zap, CheckCircle2, XCircle, AlertTriangle, FileText, Target, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PipelineState } from "@/hooks/usePipeline";

interface PipelineStatsProps {
  pipelineState: PipelineState;
  onRunPipeline: () => void;
  onOpenPanel: () => void;
  isPipelineOpen?: boolean;
}

function Stat({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </span>
      <span className={`text-2xl font-bold font-mono mt-0.5 ${color ?? "text-foreground"}`}>
        {value}
      </span>
      {sub && <span className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</span>}
    </div>
  );
}

function Divider() {
  return <div className="w-px bg-border self-stretch mx-2" />;
}

export function PipelineStats({ pipelineState, onRunPipeline, onOpenPanel, isPipelineOpen }: PipelineStatsProps) {
  const { status, cumulative, results } = pipelineState;

  if (status === "idle") {
    return (
      <div className="flex items-center gap-6 px-6 py-4 border-b border-border bg-background">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            <Zap className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">No pipeline run yet</p>
            <p className="text-xs text-muted-foreground">
              Run the batch pipeline to surface flagged transactions and begin AML investigation.
            </p>
          </div>
        </div>
        {!isPipelineOpen && (
          <Button
            size="sm"
            onClick={() => {
              onOpenPanel();
              onRunPipeline();
            }}
            className="flex-shrink-0"
            data-testid="quick-run-btn"
          >
            <Play className="h-3.5 w-3.5 mr-1.5" />
            Run Pipeline
          </Button>
        )}
      </div>
    );
  }

  if (status === "running") {
    const { true_positives, false_positives, false_negatives, true_negatives, sars_generated } =
      cumulative;
    const total = true_positives + false_positives + false_negatives + true_negatives;

    return (
      <div className="flex items-center gap-6 px-6 py-4 border-b border-border bg-background">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
            Pipeline Running
          </span>
        </div>
        <Divider />
        <div className="flex items-center gap-6 flex-1 min-w-0 overflow-x-auto">
          <Stat label="Processed" value={total} sub="transactions" />
          <Divider />
          <Stat label="True Positives" value={true_positives} color="text-green-600" sub="Fraud caught" />
          <Stat label="False Positives" value={false_positives} color="text-destructive" sub="Clean flagged" />
          <Stat label="False Negatives" value={false_negatives} color="text-amber-500" sub="Fraud missed" />
          <Stat label="True Negatives" value={true_negatives} color="text-blue-500" sub="Clean cleared" />
          <Divider />
          <Stat label="SARs Generated" value={sars_generated} color="text-primary" />
        </div>
      </div>
    );
  }

  if (status === "done" && results) {
    const v = results.validation;
    const t = results.triage_summary;
    const pct = (n: number) => `${Math.round(n * 100)}%`;

    return (
      <div className="flex items-center gap-6 px-6 py-4 border-b border-border bg-background">
        <div className="flex items-center gap-2 flex-shrink-0">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">
            Run Complete
          </span>
        </div>
        <Divider />
        <div className="flex items-center gap-6 flex-1 min-w-0 overflow-x-auto">
          <Stat
            label="Flagged"
            value={`${t.flagged_count} / ${t.total_sampled}`}
            sub={`${t.flag_rate_pct.toFixed(1)}% flag rate`}
          />
          <Divider />
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
            <Stat label="True Positives" value={v.true_positives} color="text-green-600" sub="Fraud caught" />
          </div>
          <div className="flex items-center gap-1.5">
            <XCircle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
            <Stat label="False Positives" value={v.false_positives} color="text-destructive" sub="Clean flagged" />
          </div>
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
            <Stat label="False Negatives" value={v.false_negatives} color="text-amber-500" sub="Fraud missed" />
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-primary flex-shrink-0" />
            <Stat label="SARs Filed" value={v.sars_generated} color="text-primary" />
          </div>
          <Divider />
          <div className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <div className="flex gap-4">
              <Stat label="Precision" value={pct(v.precision)} />
              <Stat label="Recall" value={pct(v.recall)} />
              <Stat label="F1" value={pct(v.f1)} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border bg-background">
        <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
        <p className="text-sm text-destructive">
          Pipeline error — check the pipeline panel for details.
        </p>
        <Button size="sm" variant="outline" onClick={onRunPipeline} className="ml-auto flex-shrink-0">
          Retry
        </Button>
      </div>
    );
  }

  return null;
}

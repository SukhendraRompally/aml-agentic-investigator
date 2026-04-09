import { Play, RotateCcw, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { PipelineState } from "@/hooks/usePipeline";

interface PipelineControlProps {
  state: PipelineState;
  onRun: () => void;
  onReset: () => void;
}

const STEP_LABELS = [
  "Behavioral Triage",
  "LLM Investigation + SAR Drafting",
  "Ground Truth Validation",
];

export function PipelineControl({ state, onRun, onReset }: PipelineControlProps) {
  const { status, step, stepLabel, progress, progressTotal } = state;
  const isRunning = status === "running";
  const isDone = status === "done";
  const isError = status === "error";
  const pct =
    progressTotal > 0 ? Math.round((progress / progressTotal) * 100) : 0;

  return (
    <div
      className="flex flex-col gap-3 border-b border-border px-6 py-4 bg-card"
      data-testid="pipeline-control"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isRunning && (
            <Loader2 className="h-4 w-4 text-primary animate-spin flex-shrink-0" />
          )}
          {isDone && (
            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
          )}
          {isError && (
            <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
          )}

          <div>
            {isRunning && (
              <>
                <p className="text-xs font-semibold text-foreground">
                  Step {step} of {STEP_LABELS.length} — {stepLabel || STEP_LABELS[step - 1] || "Processing…"}
                </p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  {progress} / {progressTotal} transactions
                </p>
              </>
            )}
            {isDone && (
              <p className="text-xs font-semibold text-green-600">
                Pipeline complete — full results loaded
              </p>
            )}
            {isError && (
              <p className="text-xs font-semibold text-destructive">
                {state.error || "Pipeline error"}
              </p>
            )}
            {status === "idle" && (
              <p className="text-xs text-muted-foreground">
                Run the AI pipeline on a 100-transaction PaySim sample
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          {(isDone || isError) && (
            <Button
              size="sm"
              variant="outline"
              onClick={onReset}
              data-testid="reset-pipeline-btn"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Reset
            </Button>
          )}
          <Button
            size="sm"
            onClick={onRun}
            disabled={isRunning}
            className="bg-primary text-white hover:bg-primary/90"
            data-testid="run-pipeline-btn"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Running…
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 mr-1.5" />
                Run Pipeline
              </>
            )}
          </Button>
        </div>
      </div>

      {isRunning && progressTotal > 0 && (
        <div className="space-y-1">
          <Progress value={pct} className="h-2" />
          <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
            <span>Step {step}: {stepLabel}</span>
            <span>{pct}%</span>
          </div>
        </div>
      )}

      {isRunning && (
        <div className="flex gap-2">
          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1;
            const active = stepNum === step;
            const done = stepNum < step;
            return (
              <div
                key={label}
                className={`flex-1 rounded px-2 py-1.5 text-[10px] font-medium text-center transition-all ${
                  active
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : done
                      ? "bg-green-500/10 text-green-600 border border-green-500/20"
                      : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {stepNum}. {label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

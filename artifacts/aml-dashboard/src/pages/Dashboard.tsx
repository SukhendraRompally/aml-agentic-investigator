import { Database, Activity } from "lucide-react";
import { usePipeline } from "@/hooks/usePipeline";
import { DEMO_MODE, PIPELINE_BASE_URL } from "@/config";
import { PipelineControl } from "@/components/PipelineControl";
import { LiveScoreboard } from "@/components/LiveScoreboard";
import { TransactionFeed } from "@/components/TransactionFeed";
import { FullResults } from "@/components/FullResults";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export function Dashboard() {
  const { state, runPipeline, reset } = usePipeline();
  const { status, cumulative, results } = state;
  const isRunning = status === "running";
  const isDone = status === "done";
  const hasActivity = isRunning || isDone || status === "error";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header
        className="flex-shrink-0 border-b border-border/50 px-6 py-3"
        style={{ backgroundColor: "hsl(var(--secondary))" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-primary" />
            <span className="text-white font-bold text-lg tracking-tight">SCHWAB AI.x</span>
            <span className="text-white/50 font-light">—</span>
            <span className="text-white/80 font-medium text-sm tracking-wide">
              AML Agentic Investigator
            </span>
          </div>

          <div className="flex items-center gap-4">
            {DEMO_MODE && (
              <Badge className="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Demo Mode
              </Badge>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span className="text-white/40">Backend:</span>
              <span className="text-white/60">{PIPELINE_BASE_URL}</span>
            </div>
            <div className="flex items-center gap-2" data-testid="system-status">
              <Activity className="h-4 w-4 text-green-400" />
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              <span className="text-green-400 text-xs font-medium">System Ready</span>
            </div>
          </div>
        </div>
      </header>

      <PipelineControl state={state} onRun={runPipeline} onReset={reset} />

      <ScrollArea className="flex-1">
        <div className="px-6 py-5 space-y-6 max-w-7xl mx-auto">
          {!hasActivity && (
            <div
              className="flex flex-col items-center justify-center py-24 text-center"
              data-testid="idle-state"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                <Database className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Ready to Investigate
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mb-6">
                Click <strong>Run Pipeline</strong> above to launch the 3-step AI pipeline on
                a 100-transaction PaySim sample. The system will triage transactions,
                apply LLM investigation, generate SAR reports, and validate against ground truth.
              </p>
              <div className="grid grid-cols-3 gap-4 text-xs text-center w-full max-w-sm">
                {[
                  { n: "1", label: "Behavioral Triage", desc: "Rule-based flagging" },
                  { n: "2", label: "LLM Investigation", desc: "AI forensic analysis + SAR drafting" },
                  { n: "3", label: "Ground Truth", desc: "Precision / Recall validation" },
                ].map((s) => (
                  <div
                    key={s.n}
                    className="rounded-lg border border-border bg-card p-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/15 text-primary font-bold text-xs flex items-center justify-center mx-auto mb-2">
                      {s.n}
                    </div>
                    <p className="font-semibold text-foreground text-[11px]">{s.label}</p>
                    <p className="text-muted-foreground text-[10px] mt-0.5">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isRunning && (
            <>
              <LiveScoreboard cumulative={cumulative} isLive />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Live Transaction Feed
                </h3>
                <TransactionFeed
                  transactions={cumulative.completed_transactions}
                  isLive
                />
              </div>
            </>
          )}

          {isDone && results && <FullResults results={results} />}

          {status === "error" && (
            <div
              className="rounded-lg border border-destructive/30 bg-destructive/5 px-5 py-6 text-center"
              data-testid="error-state"
            >
              <p className="text-sm font-semibold text-destructive mb-1">Pipeline Error</p>
              <p className="text-xs text-muted-foreground">{state.error}</p>
              <p className="text-[11px] text-muted-foreground mt-2">
                Make sure the backend is reachable at{" "}
                <code className="font-mono bg-muted px-1 rounded">{PIPELINE_BASE_URL}</code>
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

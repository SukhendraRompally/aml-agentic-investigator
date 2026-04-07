import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LiveScoreboard } from "@/components/LiveScoreboard";
import { TransactionFeed } from "@/components/TransactionFeed";
import {
  FileText,
  BarChart2,
  List,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { PipelineResults } from "@/types/pipeline";

interface FullResultsProps {
  results: PipelineResults;
}

const RISK_COLORS: Record<string, string> = {
  CRITICAL: "bg-destructive text-destructive-foreground",
  HIGH: "bg-orange-500 text-white",
  MEDIUM: "bg-amber-500 text-white",
  LOW: "bg-green-600 text-white",
};

function SARCard({ sar }: { sar: PipelineResults["sars"][0] }) {
  const [expanded, setExpanded] = useState(false);
  const badgeClass = RISK_COLORS[sar.risk_level] ?? "bg-muted text-muted-foreground";

  return (
    <div
      className="rounded-lg border border-border bg-card p-4"
      data-testid={`sar-card-${sar.report_id}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="text-xs font-mono font-bold text-foreground">{sar.report_id}</p>
          <p className="text-xs text-muted-foreground">Subject: {sar.subject_id}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge className={`text-[10px] px-2 h-5 ${badgeClass}`}>
            {sar.risk_level}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-2 h-5">
            {sar.suspicious_activity_type}
          </Badge>
        </div>
      </div>

      <div
        className={`text-xs text-foreground leading-relaxed ${expanded ? "" : "line-clamp-2"}`}
      >
        {sar.narrative_of_suspicion}
      </div>

      {sar.narrative_of_suspicion.length > 120 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[10px] text-primary mt-1 flex items-center gap-0.5 hover:underline"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" /> Collapse
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" /> Read more
            </>
          )}
        </button>
      )}

      <div className="mt-2 pt-2 border-t border-border text-[10px] text-muted-foreground">
        <span className="font-semibold text-foreground">Recommended: </span>
        {sar.recommended_action}
      </div>
    </div>
  );
}

type Tab = "validation" | "transactions" | "sars";

export function FullResults({ results }: FullResultsProps) {
  const [tab, setTab] = useState<Tab>("validation");
  const { triage_summary, flagged_transactions, sars, validation } = results;

  const tabs: { id: Tab; label: string; icon: typeof BarChart2; count?: number }[] = [
    { id: "validation", label: "Validation", icon: BarChart2 },
    { id: "transactions", label: "Flagged Transactions", icon: List, count: flagged_transactions.length },
    { id: "sars", label: "SAR Reports", icon: FileText, count: sars.length },
  ];

  return (
    <div className="space-y-4" data-testid="full-results">
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-border bg-card px-4 py-3 text-center">
          <p className="text-2xl font-bold font-mono text-foreground">
            {triage_summary.total_sampled}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
            Transactions Sampled
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3 text-center">
          <p className="text-2xl font-bold font-mono text-destructive">
            {triage_summary.flagged_count}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
            Flagged ({triage_summary.flag_rate_pct.toFixed(1)}%)
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3 text-center">
          <p className="text-2xl font-bold font-mono text-primary">
            {validation.sars_generated}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
            SARs Filed
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3 text-center">
          {Object.entries(triage_summary.by_type).map(([type, count]) => (
            <div key={type} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{type}</span>
              <span className="font-mono font-bold text-foreground">{count}</span>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
            By Tx Type
          </p>
        </div>
      </div>

      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`results-tab-${t.id}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
              {t.count !== undefined && (
                <span className="ml-0.5 rounded bg-muted px-1.5 text-[9px] font-mono">
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tab === "validation" && (
        <div className="space-y-4" data-testid="results-validation">
          <LiveScoreboard
            cumulative={{
              true_positives: validation.true_positives,
              false_positives: validation.false_positives,
              false_negatives: validation.false_negatives,
              true_negatives: validation.true_negatives,
              precision: validation.precision,
              recall: validation.recall,
              sars_generated: validation.sars_generated,
              completed_transactions: [],
            }}
          />

          {validation.false_positive_details?.length > 0 && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-xs font-semibold text-destructive">
                  False Positives — Clean accounts incorrectly flagged ({validation.false_positive_details.length})
                </span>
              </div>
              <div className="space-y-2">
                {validation.false_positive_details.slice(0, 3).map((fp, i) => (
                  <div key={i} className="text-xs border-l-2 border-destructive/30 pl-2">
                    <span className="font-mono font-semibold text-foreground">{fp.nameOrig}</span>
                    <span className="text-muted-foreground ml-2">{fp.behavioral_reasoning?.slice(0, 80)}…</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {validation.false_negative_details?.length > 0 && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-semibold text-amber-600">
                  False Negatives — Fraud missed by AI ({validation.false_negative_details.length})
                </span>
              </div>
              <div className="space-y-2">
                {validation.false_negative_details.slice(0, 3).map((fn, i) => (
                  <div key={i} className="text-xs border-l-2 border-amber-500/30 pl-2">
                    <span className="font-mono font-semibold text-foreground">{fn.nameOrig}</span>
                    <span className="text-muted-foreground ml-2">{fn.behavioral_reasoning?.slice(0, 80)}…</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "transactions" && (
        <TransactionFeed transactions={flagged_transactions} maxHeight="420px" />
      )}

      {tab === "sars" && (
        <ScrollArea style={{ maxHeight: "420px" }}>
          <div className="space-y-3 pr-1">
            {sars.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No SARs generated</p>
            ) : (
              sars.map((sar) => <SARCard key={sar.report_id} sar={sar} />)
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

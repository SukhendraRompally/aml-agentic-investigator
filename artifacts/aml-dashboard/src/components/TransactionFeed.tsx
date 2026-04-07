import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { CompletedTransaction } from "@/types/pipeline";

interface TransactionFeedProps {
  transactions: CompletedTransaction[];
  isLive?: boolean;
  maxHeight?: string;
}

const VERDICT_CONFIG = {
  TP: {
    label: "TP",
    tip: "True Positive — Fraud correctly flagged",
    badgeClass: "bg-green-500/15 text-green-600 border border-green-500/30",
    rowClass: "border-l-2 border-l-green-500/50",
    icon: CheckCircle2,
    iconClass: "text-green-600",
  },
  FP: {
    label: "FP",
    tip: "False Positive — Clean account flagged",
    badgeClass: "bg-destructive/15 text-destructive border border-destructive/30",
    rowClass: "border-l-2 border-l-destructive/50",
    icon: XCircle,
    iconClass: "text-destructive",
  },
  FN: {
    label: "FN",
    tip: "False Negative — Fraud missed by AI",
    badgeClass: "bg-amber-500/15 text-amber-600 border border-amber-500/30",
    rowClass: "border-l-2 border-l-amber-500/50",
    icon: AlertTriangle,
    iconClass: "text-amber-500",
  },
  TN: {
    label: "TN",
    tip: "True Negative — Clean correctly cleared",
    badgeClass: "bg-blue-500/15 text-blue-600 border border-blue-500/30",
    rowClass: "border-l-2 border-l-blue-500/30",
    icon: CheckCircle2,
    iconClass: "text-blue-500",
  },
};

const RISK_COLORS: Record<string, string> = {
  CRITICAL: "text-destructive",
  HIGH: "text-orange-500",
  MEDIUM: "text-amber-500",
  LOW: "text-green-500",
  LOW_RISK: "text-green-500",
};

export function TransactionFeed({
  transactions,
  isLive = false,
  maxHeight = "360px",
}: TransactionFeedProps) {
  if (transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-20 text-muted-foreground text-xs border border-dashed border-border rounded-lg">
        Waiting for transactions…
      </div>
    );
  }

  return (
    <div data-testid="transaction-feed">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground font-medium">
          {transactions.length} transaction{transactions.length !== 1 ? "s" : ""} processed
        </span>
        {isLive && (
          <span className="text-[10px] text-green-500 font-mono">updating…</span>
        )}
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <div className="grid grid-cols-[80px_1fr_90px_90px_70px_36px] text-[10px] font-semibold text-muted-foreground uppercase tracking-wide bg-muted px-3 py-2 border-b border-border">
          <span>Account</span>
          <span>Pattern</span>
          <span>Amount</span>
          <span>AI Decision</span>
          <span>Risk</span>
          <span className="text-center">SAR</span>
        </div>

        <ScrollArea style={{ maxHeight }}>
          <div>
            {[...transactions].reverse().map((tx, i) => {
              const verdict = VERDICT_CONFIG[tx.verdict] ?? VERDICT_CONFIG.TN;
              const Icon = verdict.icon;
              const riskColor = RISK_COLORS[tx.risk_level] ?? "text-muted-foreground";
              const isNew = i === 0 && isLive;

              return (
                <div
                  key={`${tx.nameOrig}-${i}`}
                  className={`grid grid-cols-[80px_1fr_90px_90px_70px_36px] items-start px-3 py-2 border-b border-border last:border-0 text-xs transition-all duration-300 ${verdict.rowClass} ${isNew ? "animate-in fade-in-0 slide-in-from-top-1 duration-300" : ""}`}
                  data-testid={`tx-row-${tx.nameOrig}`}
                >
                  <div className="font-mono text-[10px] text-foreground truncate pr-1">
                    {tx.nameOrig}
                  </div>

                  <div className="min-w-0 pr-2">
                    <div className="text-foreground truncate text-[11px] font-medium">
                      {tx.pattern_type}
                    </div>
                    <div className="text-muted-foreground text-[10px] truncate leading-tight mt-0.5">
                      {tx.behavioral_reasoning?.slice(0, 60)}
                      {(tx.behavioral_reasoning?.length ?? 0) > 60 ? "…" : ""}
                    </div>
                  </div>

                  <div className="font-mono text-[11px] text-foreground">
                    ${tx.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>

                  <div>
                    <Badge
                      className={`text-[9px] px-1.5 h-4 ${verdict.badgeClass}`}
                    >
                      <Icon className={`h-2.5 w-2.5 mr-0.5 ${verdict.iconClass}`} />
                      {verdict.label}
                    </Badge>
                    <div className="text-[9px] text-muted-foreground mt-0.5 font-mono">
                      {tx.ai_decision}
                    </div>
                  </div>

                  <div className={`text-[11px] font-semibold font-mono ${riskColor}`}>
                    {tx.risk_level}
                  </div>

                  <div className="flex items-center justify-center">
                    {tx.has_sar ? (
                      <FileText
                        className="h-3.5 w-3.5 text-primary"
                        title={tx.sar_report_id}
                      />
                    ) : (
                      <span className="text-muted-foreground/30 text-xs">—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

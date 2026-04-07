import type { AlertDetail } from "@workspace/api-client-react/src/generated/api.schemas";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Info, TrendingDown, ArrowUpDown } from "lucide-react";

interface TriageStepProps {
  detail: AlertDetail | null | undefined;
  isLoading: boolean;
}

const severityConfig = {
  CRITICAL: {
    badge: "bg-destructive text-destructive-foreground",
    icon: AlertCircle,
    iconClass: "text-destructive",
  },
  HIGH: {
    badge: "bg-orange-500 text-white",
    icon: AlertTriangle,
    iconClass: "text-orange-500",
  },
  MEDIUM: {
    badge: "bg-amber-500 text-white",
    icon: AlertTriangle,
    iconClass: "text-amber-500",
  },
  LOW: {
    badge: "bg-blue-500 text-white",
    icon: Info,
    iconClass: "text-blue-500",
  },
};

export function TriageStep({ detail, isLoading }: TriageStepProps) {
  if (isLoading) {
    return (
      <div className="space-y-3" data-testid="triage-loading">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-lg border border-border p-4">
            <div className="flex items-start justify-between mb-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="h-8 rounded" />
              <Skeleton className="h-8 rounded" />
              <Skeleton className="h-8 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        Select an alert from the work queue to view triage analysis
      </div>
    );
  }

  const flags = detail.triageFlags ?? [];

  return (
    <div className="space-y-3" data-testid="triage-step">
      {flags.length === 0 ? (
        <p className="text-sm text-muted-foreground">No triage flags found for this alert.</p>
      ) : (
        <>
          <div className="text-xs text-muted-foreground mb-2">
            {flags.length} behavioral flag{flags.length !== 1 ? "s" : ""} detected
          </div>
          {flags.map((flag) => {
            const config =
              severityConfig[flag.severity as keyof typeof severityConfig] ?? severityConfig.LOW;
            const Icon = config.icon;
            return (
              <div
                key={flag.flagId}
                className="rounded-lg border border-border bg-card p-4"
                data-testid={`triage-flag-${flag.flagId}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 flex-shrink-0 ${config.iconClass}`} />
                    <span className="font-mono text-xs font-semibold text-foreground">
                      {flag.flagType.replace(/_/g, " ")}
                    </span>
                  </div>
                  <Badge
                    className={`text-[10px] h-5 px-2 flex-shrink-0 ${config.badge}`}
                  >
                    {flag.severity}
                  </Badge>
                </div>

                <p className="text-sm text-foreground mb-3">{flag.description}</p>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded bg-muted px-2 py-1.5 text-center">
                    <p className="text-muted-foreground mb-0.5">Amount</p>
                    <p className="font-mono font-semibold text-foreground">
                      ${flag.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                  {flag.percentage != null && (
                    <div className="rounded bg-muted px-2 py-1.5 text-center">
                      <p className="text-muted-foreground mb-0.5">Balance %</p>
                      <p className="font-mono font-semibold text-foreground flex items-center justify-center gap-1">
                        <TrendingDown className="h-3 w-3 text-destructive" />
                        {flag.percentage.toFixed(1)}%
                      </p>
                    </div>
                  )}
                  <div className="rounded bg-muted px-2 py-1.5 text-center">
                    <p className="text-muted-foreground mb-0.5">Transactions</p>
                    <p className="font-mono font-semibold text-foreground flex items-center justify-center gap-1">
                      <ArrowUpDown className="h-3 w-3" />
                      {flag.transactionCount}
                    </p>
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-muted-foreground font-mono">
                  Flagged:{" "}
                  {new Date(flag.timestamp).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

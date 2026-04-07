import {
  useGetMetricsSummary,
  getGetMetricsSummaryQueryKey,
} from "@workspace/api-client-react";
import { DEMO_MODE } from "@/config";
import { mockMetrics } from "@/mockData";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldAlert, ShieldCheck, Clock } from "lucide-react";

export function MetricCards() {
  const { data, isLoading, isError } = useGetMetricsSummary({
    query: {
      enabled: !DEMO_MODE,
      queryKey: getGetMetricsSummaryQueryKey(),
    },
  });

  const metrics = DEMO_MODE || isError ? mockMetrics : data;

  if (!DEMO_MODE && isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4" data-testid="metrics-loading">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4">
            <Skeleton className="h-4 w-32 mb-3" />
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total Alerts",
      value: metrics?.totalAlerts ?? 0,
      icon: Clock,
      iconClass: "text-primary",
      bgClass: "bg-primary/10",
      subLabel: `${metrics?.pendingReview ?? 0} pending review`,
      testId: "metric-total-alerts",
    },
    {
      label: "AI-Confirmed Risks",
      value: metrics?.aiConfirmedRisks ?? 0,
      icon: ShieldAlert,
      iconClass: "text-destructive",
      bgClass: "bg-destructive/10",
      subLabel: "High & critical severity",
      testId: "metric-confirmed-risks",
    },
    {
      label: "Potential False Positives",
      value: metrics?.potentialFalsePositives ?? 0,
      icon: ShieldCheck,
      iconClass: "text-amber-500",
      bgClass: "bg-amber-500/10",
      subLabel: "Low & medium severity",
      testId: "metric-false-positives",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-lg border border-border bg-card p-4 flex items-start gap-4"
            data-testid={card.testId}
          >
            <div className={`rounded-lg p-2 ${card.bgClass} flex-shrink-0`}>
              <Icon className={`h-5 w-5 ${card.iconClass}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {card.label}
              </p>
              <p className="text-3xl font-bold text-foreground mt-0.5">
                {card.value.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{card.subLabel}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

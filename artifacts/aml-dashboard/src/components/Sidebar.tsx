import type { Alert } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Clock,
  ChevronRight,
  Zap,
  PlayCircle,
} from "lucide-react";

interface SidebarProps {
  selectedAlertId: string | null;
  onSelectAlert: (id: string) => void;
  pipelineAlerts?: Alert[];
  pipelineStatus: "idle" | "running" | "done" | "error";
}

export function Sidebar({
  selectedAlertId,
  onSelectAlert,
  pipelineAlerts,
  pipelineStatus,
}: SidebarProps) {
  const alerts: Alert[] = pipelineAlerts ?? [];
  const pendingCount = alerts.filter((a) => a.status === "PENDING").length;

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "HIGH":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "MEDIUM":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 90) return "text-destructive";
    if (score >= 70) return "text-orange-500";
    if (score >= 50) return "text-yellow-500";
    return "text-green-500";
  };

  const isEmpty = pipelineStatus !== "done" || alerts.length === 0;

  return (
    <div className="w-72 border-r border-border bg-card flex flex-col h-full">
      <div className="p-4 border-b border-border bg-muted/30">
        <h2 className="font-semibold text-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Work Queue
          {pipelineStatus === "done" && alerts.length > 0 && (
            <Badge className="text-[10px] px-1.5 h-4 bg-primary/20 text-primary border border-primary/30 ml-auto">
              <Zap className="h-2.5 w-2.5 mr-0.5" />
              Pipeline
            </Badge>
          )}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {pipelineStatus === "idle" && "Awaiting pipeline run"}
          {pipelineStatus === "running" && "Pipeline processing…"}
          {pipelineStatus === "done" &&
            (alerts.length > 0
              ? `${alerts.length} flagged — ${pendingCount} pending review`
              : "No transactions flagged")}
          {pipelineStatus === "error" && "Pipeline error"}
        </p>
      </div>

      <ScrollArea className="flex-1">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-64 px-6 text-center gap-4">
            {pipelineStatus === "running" ? (
              <>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-primary animate-pulse" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Pipeline running…</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Flagged transactions will appear here once the run completes.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <PlayCircle className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Queue is empty</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Run the batch pipeline to surface flagged transactions for review.
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {alerts.map((alert: Alert) => (
              <button
                key={alert.alertId}
                onClick={() => onSelectAlert(alert.alertId)}
                className={`w-full text-left p-3 rounded-md border transition-all duration-200 hover-elevate ${
                  selectedAlertId === alert.alertId
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:border-border/80"
                }`}
                data-testid={`alert-item-${alert.alertId}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-semibold">
                    {getSeverityIcon(alert.severity)}
                    <span className="truncate max-w-[120px]">{alert.alertId}</span>
                  </div>
                  <span className={`text-xs font-bold flex-shrink-0 ${getRiskColor(alert.riskScore)}`}>
                    {alert.riskScore}
                  </span>
                </div>

                <div className="font-medium text-sm text-foreground truncate mb-1">
                  {alert.accountName}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="truncate mr-2 max-w-[100px]">
                    {(alert.primaryFlag ?? "").replace(/_/g, " ")}
                  </span>
                  <span className="font-mono flex-shrink-0">
                    ${alert.totalAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={`text-[10px] h-5 px-1.5 ${
                      alert.status === "PENDING"
                        ? "border-amber-500/50 text-amber-600"
                        : ""
                    }`}
                  >
                    {alert.status}
                  </Badge>
                  <ChevronRight className="h-3 w-3 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

import type { AlertDetail } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Building2 } from "lucide-react";

interface SARDraftStepProps {
  detail: AlertDetail | null | undefined;
  isLoading: boolean;
}

function formatDate(d: Date | string | undefined): string {
  if (!d) return "N/A";
  try {
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "N/A";
  }
}

export function SARDraftStep({ detail, isLoading }: SARDraftStepProps) {
  if (isLoading) {
    return (
      <div className="space-y-3" data-testid="sar-loading">
        <div className="rounded-lg border-2 border-dashed border-border p-6">
          <Skeleton className="h-6 w-64 mx-auto mb-4" />
          <div className="grid grid-cols-2 gap-3 mb-4">
            <Skeleton className="h-12 rounded" />
            <Skeleton className="h-12 rounded" />
            <Skeleton className="h-12 rounded" />
            <Skeleton className="h-12 rounded" />
          </div>
          <Skeleton className="h-32 w-full rounded" />
        </div>
      </div>
    );
  }

  if (!detail?.sarDraft) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        SAR draft not available — alert may still be under analysis
      </div>
    );
  }

  const s = detail.sarDraft;

  return (
    <div className="space-y-3" data-testid="sar-step">
      <div
        className="rounded-lg border-2 border-border bg-card overflow-hidden"
        style={{ fontFamily: "'Times New Roman', Times, serif" }}
      >
        <div
          className="px-6 py-4 text-center border-b border-border"
          style={{ backgroundColor: "hsl(var(--secondary))", color: "white" }}
        >
          <div className="flex items-center justify-center gap-3 mb-1">
            <Building2 className="h-5 w-5 opacity-80" />
            <span className="text-sm font-bold tracking-widest uppercase opacity-90">
              {s.filingInstitution}
            </span>
          </div>
          <h2 className="text-lg font-bold uppercase tracking-wide">
            SUSPICIOUS ACTIVITY REPORT
          </h2>
          <p className="text-xs opacity-70 mt-0.5">
            FinCEN Form 111 — CONFIDENTIAL — LAW ENFORCEMENT SENSITIVE
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm border-b border-dashed border-border pb-4">
            <div>
              <p className="text-xs text-muted-foreground font-sans uppercase tracking-wide mb-0.5">
                Report Number
              </p>
              <p className="font-mono font-semibold" data-testid="sar-report-number">
                {s.reportNumber}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-sans uppercase tracking-wide mb-0.5">
                Filing Date
              </p>
              <p data-testid="sar-filing-date">{formatDate(s.filingDate)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-sans uppercase tracking-wide mb-0.5">
                Activity Period
              </p>
              <p className="text-xs">
                {formatDate(s.dateRangeStart)} — {formatDate(s.dateRangeEnd)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-sans uppercase tracking-wide mb-0.5">
                Filing Officer
              </p>
              <p className="text-xs">{s.filingOfficer}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm border-b border-dashed border-border pb-4">
            <div>
              <p className="text-xs text-muted-foreground font-sans uppercase tracking-wide mb-0.5">
                Subject Name
              </p>
              <p className="font-semibold" data-testid="sar-subject-name">
                {s.subjectName}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-sans uppercase tracking-wide mb-0.5">
                Account Number
              </p>
              <p className="font-mono">{s.subjectAccountNumber}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-sans uppercase tracking-wide mb-0.5">
                Activity Type
              </p>
              <p className="text-sm">{s.suspiciousActivityType}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-sans uppercase tracking-wide mb-0.5">
                Total Amount
              </p>
              <p className="font-semibold" data-testid="sar-total-amount">
                ${s.totalAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-sans text-muted-foreground uppercase tracking-wide">
                Part V — Narrative Description of Suspicious Activity
              </p>
            </div>
            <p
              className="text-sm leading-relaxed text-foreground"
              data-testid="sar-narrative"
            >
              {s.narrative}
            </p>
          </div>

          <div className="border-t border-dashed border-border pt-4 grid grid-cols-2 gap-8 text-xs text-muted-foreground font-sans">
            <div>
              <p className="uppercase tracking-wide mb-3">Filing Institution Signature</p>
              <div className="border-b border-foreground/30 mb-1 h-6" />
              <p>{s.filingOfficer}</p>
            </div>
            <div>
              <p className="uppercase tracking-wide mb-3">Date</p>
              <div className="border-b border-foreground/30 mb-1 h-6" />
              <p>{formatDate(new Date())}</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground text-center font-sans">
        AI-GENERATED DRAFT — REQUIRES COMPLIANCE OFFICER REVIEW BEFORE SUBMISSION
      </p>
    </div>
  );
}

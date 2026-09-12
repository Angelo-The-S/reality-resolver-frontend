import type { CallDecision } from "@/types/realityResolver";
import { cn } from "@/lib/utils";
import { SectionShell } from "./SectionShell";

export function CallDecisionPanel({ decision }: { decision: CallDecision }) {
  const required = decision === "CALL_JUSTIFIED";

  return (
    <SectionShell index="03" title="Call decision">
      <div
        className={cn(
          "rounded-sm border px-4 py-5",
          required ? "border-action/50 bg-action/10" : "border-border-strong bg-surface-raised",
        )}
      >
        <p className="label-tech">Gate</p>
        <p
          className={cn(
            "mt-1 text-2xl font-semibold uppercase tracking-[0.06em]",
            required ? "text-action" : "text-muted-foreground",
          )}
        >
          {required ? "Call justified" : "No call needed"}
        </p>
      </div>
    </SectionShell>
  );
}

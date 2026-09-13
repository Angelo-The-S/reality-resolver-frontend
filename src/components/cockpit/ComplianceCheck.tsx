import type { ComplianceCheckData } from "@/types/realityResolver";
import { cn } from "@/lib/utils";

export function ComplianceCheck({
  check,
  exempted,
  allowed,
}: {
  check: ComplianceCheckData;
  exempted: boolean;
  allowed: boolean;
}) {
  const state = check.passed
    ? "passed"
    : exempted
      ? "exempted"
      : allowed
        ? "not-triggered"
        : "blocked";

  const label =
    state === "passed"
      ? "Passed"
      : state === "exempted"
        ? "Not applicable"
        : state === "not-triggered"
          ? "Not triggered"
          : "Blocked";

  return (
    <li className="flex items-start justify-between gap-3 py-2">
      <span className="flex items-start gap-2">
        <span
          className={cn(
            "mt-px font-mono text-xs",
            state === "passed" && "text-success",
            state === "exempted" && "text-muted-foreground",
            state === "not-triggered" && "text-muted-foreground",
            state === "blocked" && "text-critical",
          )}
          aria-hidden
        >
          {state === "passed" ? "✓" : state === "blocked" ? "✕" : "—"}
        </span>
        <span className="text-sm text-foreground">{check.name}</span>
      </span>
      <span
        className={cn(
          "shrink-0 font-mono text-[10px] uppercase tracking-[0.16em]",
          state === "passed" && "text-success",
          state === "exempted" && "text-muted-foreground",
          state === "not-triggered" && "text-muted-foreground",
          state === "blocked" && "text-critical",
        )}
      >
        {label}
      </span>
    </li>
  );
}

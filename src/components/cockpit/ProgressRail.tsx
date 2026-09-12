import { cn } from "@/lib/utils";

export type RailState = "pending" | "active" | "done" | "skipped";

const STEPS = ["Case", "Decision", "Call", "Verdict"] as const;

export type RailStates = [RailState, RailState, RailState, RailState];

export function ProgressRail({ states }: { states: RailStates }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {STEPS.map((step, i) => {
        const state = states[i] ?? "pending";
        return (
          <div key={step} className="flex items-center gap-3">
            <span className="flex items-baseline gap-1.5">
              <span
                className={cn(
                  "font-mono text-[10px] uppercase tracking-[0.24em] transition-colors",
                  state === "done" && "text-foreground",
                  state === "active" && "text-action",
                  state === "pending" && "text-muted-foreground/50",
                  state === "skipped" && "text-muted-foreground/50 line-through",
                )}
              >
                {step}
              </span>
              {state === "skipped" && (
                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground/60">
                  not executed
                </span>
              )}
            </span>
            {i < STEPS.length - 1 && (
              <span
                className={cn(
                  "h-px w-8 transition-colors",
                  state === "done" ? "bg-border-strong" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

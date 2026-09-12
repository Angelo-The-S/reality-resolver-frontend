import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { ResolutionState } from "@/types/realityResolver";

// These lines are presentation-only. The headline state comes from the
// backend lifecycle reported by runResolution().
const LINES = [
  "Analyzing evidence...",
  "Evaluating decision...",
  "Checking call eligibility...",
  "Executing CALL-E...",
  "Reconciling result...",
];

export function ResolvingOverlay({
  state,
}: {
  state: Extract<ResolutionState, "queued" | "running">;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => Math.min(s + 1, LINES.length - 1));
    }, 420);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="animate-rise rounded-md border border-border bg-surface/60 px-6 py-10">
      <p className="label-tech">Processing</p>
      <p className="mt-2 text-xl font-semibold uppercase tracking-[0.08em] text-foreground">
        {state === "queued"
          ? "Resolution queued"
          : "Reality Resolver is evaluating evidence and CALL-E…"}
      </p>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-action">
        {state}
      </p>
      <ul className="mt-6 space-y-2">
        {LINES.map((line, i) => (
          <li
            key={line}
            className={cn(
              "flex items-center gap-3 font-mono text-xs tracking-[0.1em] transition-colors",
              i < step ? "text-muted-foreground" : i === step ? "text-action" : "text-muted-foreground/35",
            )}
          >
            <span
              className={cn(
                "inline-block size-1.5 rounded-full",
                i < step ? "bg-muted-foreground" : i === step ? "bg-action animate-pulse-soft" : "bg-border-strong",
              )}
            />
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

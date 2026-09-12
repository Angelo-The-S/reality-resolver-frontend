import type { DemoScenarioId } from "@/types/realityResolver";
import { cn } from "@/lib/utils";

const SCENARIOS: { id: DemoScenarioId; label: string }[] = [
  { id: "confirmed", label: "Confirmed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "voicemail", label: "Voicemail" },
  { id: "blocked", label: "Blocked" },
  { id: "no-call-needed", label: "No call needed" },
];

export function ScenarioSelector({
  value,
  onChange,
  onRun,
  running,
}: {
  value: DemoScenarioId;
  onChange: (id: DemoScenarioId) => void;
  onRun: () => void;
  running: boolean;
}) {
  return (
    <div className="rounded-md border border-dashed border-border-strong bg-surface/40 px-4 py-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="label-tech mr-1">Demo scenario</span>
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              type="button"
              disabled={running}
              onClick={() => onChange(s.id)}
              className={cn(
                "rounded-sm border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors disabled:opacity-50",
                value === s.id
                  ? "border-action/60 bg-action/15 text-action"
                  : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onRun}
          disabled={running}
          className="shrink-0 rounded-sm bg-action px-5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-action-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {running ? "Resolving…" : "Run resolution"}
        </button>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Demonstration control only — not a business configuration. It selects which resolution
        branch the engine returns.
      </p>
    </div>
  );
}

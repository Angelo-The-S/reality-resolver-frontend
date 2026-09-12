import type { CaseId, CaseSummary } from "@/types/realityResolver";
import { cn } from "@/lib/utils";

export function CaseSelector({
  cases,
  value,
  onChange,
  disabled,
  compact,
}: {
  cases: CaseSummary[];
  value: CaseId;
  onChange: (id: CaseId) => void;
  disabled?: boolean;
  compact?: boolean;
}) {
  if (compact) {
    const active = cases.find((c) => c.id === value);
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border border-border bg-surface/40 px-4 py-2">
        <p className="label-tech">Case</p>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-foreground">
          {active?.name}
          <span className="text-muted-foreground/70"> · {active?.use_case}</span>
        </p>
        <div className="ml-auto flex flex-wrap gap-1.5">
          {cases.map((c) => (
            <button
              key={c.id}
              type="button"
              disabled={disabled}
              aria-pressed={c.id === value}
              onClick={() => onChange(c.id)}
              className={cn(
                "rounded-sm border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors disabled:opacity-50",
                c.id === value
                  ? "border-action/60 bg-action/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-border-strong",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-surface/60 px-4 py-2.5">
      <p className="label-tech">Case</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {cases.map((c) => {
          const active = c.id === value;
          return (
            <button
              key={c.id}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() => onChange(c.id)}
              className={cn(
                "flex items-center gap-2.5 rounded-sm border px-3 py-2 text-left transition-colors disabled:opacity-50",
                active
                  ? "border-action/60 bg-action/10"
                  : "border-border hover:border-border-strong",
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full border",
                  active ? "border-action bg-action" : "border-border-strong",
                )}
              />
              <span className="min-w-0">
                <span
                  className={cn(
                    "block truncate font-mono text-[11px] uppercase tracking-[0.18em]",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {c.name}
                </span>
                <span className="mt-0.5 block truncate font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70">
                  {c.use_case}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

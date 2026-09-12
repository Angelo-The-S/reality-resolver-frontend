import type { Verdict } from "@/types/realityResolver";
import { cn } from "@/lib/utils";
import type { Tone } from "./StatusPill";

function humanize(value: string) {
  return value.replace(/_/g, " ");
}

function verdictTone(status: string): Tone {
  switch (status) {
    case "RESOLVED":
      return "success";
    case "RESOLVED_ALT":
      return "warning";
    case "UNRESOLVED_AMBIGUOUS":
      return "critical";
    case "UNRESOLVED_CALL_BLOCKED":
      return "critical";
    default:
      return "neutral";
  }
}

export function VerdictPanel({ verdict }: { verdict: Verdict | null }) {
  if (!verdict) return null;
  const tone = verdictTone(verdict.status);

  return (
    <section
      className={cn(
        "animate-rise overflow-hidden rounded-md border-2",
        tone === "success" && "border-success/55 bg-success/10",
        tone === "warning" && "border-warning/55 bg-warning/10",
        tone === "critical" && "border-critical/55 bg-critical/10",
        tone === "neutral" && "border-border-strong bg-surface-raised",
      )}
    >
      <header className="flex items-center gap-3 border-b border-border/60 px-6 py-2.5">
        <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">07</span>
        <h2 className="font-mono text-[11px] uppercase tracking-[0.22em] text-foreground">
          Verdict
        </h2>
      </header>

      <div className="grid gap-6 px-6 py-8 md:grid-cols-[1.2fr_1fr] md:items-center">
        <div>
          <p className="label-tech">Status</p>
          <p
            className={cn(
              "mt-2 text-4xl font-semibold uppercase leading-none tracking-[0.02em] md:text-5xl",
              tone === "success" && "text-success",
              tone === "warning" && "text-warning",
              tone === "critical" && "text-critical",
              tone === "neutral" && "text-foreground",
            )}
          >
            {humanize(verdict.status)}
          </p>
        </div>
        <div className="border-t border-border/60 pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0">
          <p className="label-tech">Action</p>
          <p
            className={cn(
              "mt-2 inline-block rounded-sm border-l-2 bg-background/40 px-3 py-2 text-2xl font-semibold uppercase tracking-[0.04em] text-foreground md:text-3xl",
              tone === "success" && "border-success",
              tone === "warning" && "border-warning",
              tone === "critical" && "border-critical",
              tone === "neutral" && "border-border-strong",
            )}
          >
            {humanize(verdict.action)}
          </p>
          {verdict.summary && (
            <p className="mt-3 text-sm text-muted-foreground">{verdict.summary}</p>
          )}
        </div>
      </div>
    </section>
  );
}

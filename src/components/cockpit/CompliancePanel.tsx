import type { Compliance } from "@/types/realityResolver";
import { cn } from "@/lib/utils";
import { SectionShell } from "./SectionShell";
import { StatusPill } from "./StatusPill";
import { ComplianceCheck } from "./ComplianceCheck";

function formatLegalWindow(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
  return `${day} · ${time} UTC`;
}


export function CompliancePanel({ compliance }: { compliance: Compliance | null }) {
  if (!compliance) {
    return (
      <SectionShell
        index="04"
        title="Compliance"
        dimmed
        status={<StatusPill>Not evaluated — no call justified</StatusPill>}
      >
        <p className="text-sm text-muted-foreground">
          No call is justified for this case, so no calling permission had to be evaluated.
        </p>
      </SectionShell>
    );
  }

  const allowed = compliance.allowed;

  return (
    <SectionShell
      index="04"
      title="Compliance"
      status={
        <StatusPill tone={allowed ? "success" : "critical"}>
          {allowed ? "✓ Call allowed" : "✕ Call blocked"}
        </StatusPill>
      }
    >
      <div
        className={cn(
          "rounded-sm border px-4 py-3",
          allowed ? "border-success/40 bg-success/10" : "border-critical/45 bg-critical/10",
        )}
      >
        <p className="label-tech">Jurisdiction</p>
        <p className="mt-1 font-mono text-sm uppercase tracking-[0.14em] text-foreground">
          {compliance.jurisdiction_chain.join(" → ")}
        </p>
      </div>

      <p className="label-tech mt-4">Checks</p>
      <ul className="mt-1 divide-y divide-border">
        {compliance.checks.map((check) => (
          <ComplianceCheck
            key={check.id}
            check={check}
            exempted={compliance.exempted_for_use_case.includes(check.id)}
          />
        ))}
      </ul>

      <div className="mt-4 border-t border-border pt-3">
        <p className="label-tech">Next legal window</p>
        <p className="mt-1 font-mono text-xs tracking-[0.1em] text-foreground">
          {formatLegalWindow(compliance.next_legal_window)}
        </p>
      </div>

    </SectionShell>
  );
}

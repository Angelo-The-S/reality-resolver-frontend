import type { Reasoning } from "@/types/realityResolver";
import { cn } from "@/lib/utils";
import { SectionShell } from "./SectionShell";
import { RuleIndicator } from "./RuleIndicator";

export function ReasoningPanel({ reasoning }: { reasoning: Reasoning }) {
  const critical = reasoning.decision_critical;

  return (
    <SectionShell index="02" title="Reasoning">
      <ul className="divide-y divide-border">
        {reasoning.rules.map((rule) => (
          <RuleIndicator key={rule.id} rule={rule} />
        ))}
      </ul>

      <div
        className={cn(
          "mt-4 rounded-sm border px-4 py-3",
          critical ? "border-warning/45 bg-warning/10" : "border-border-strong bg-surface-raised",
        )}
      >
        <p className="label-tech">Uncertainty assessment</p>
        <p
          className={cn(
            "mt-1 text-base font-semibold uppercase tracking-[0.08em]",
            critical ? "text-warning" : "text-muted-foreground",
          )}
        >
          {critical ? "Decision-critical uncertainty" : "No decision-critical uncertainty"}
        </p>
      </div>
    </SectionShell>
  );
}

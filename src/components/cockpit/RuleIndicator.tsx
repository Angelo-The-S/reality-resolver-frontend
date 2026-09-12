import type { ReasoningRule } from "@/types/realityResolver";
import { cn } from "@/lib/utils";

export function RuleIndicator({ rule }: { rule: ReasoningRule }) {
  return (
    <li className="flex items-start gap-3 py-2.5">
      <span
        className={cn(
          "mt-px w-6 shrink-0 font-mono text-[11px] tracking-[0.1em]",
          rule.triggered ? "text-warning" : "text-muted-foreground/60",
        )}
      >
        {rule.id}
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "font-mono text-[11px] uppercase tracking-[0.18em]",
            rule.triggered ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {rule.name}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{rule.reason}</p>
      </div>
      <span
        className={cn(
          "shrink-0 font-mono text-[10px] uppercase tracking-[0.16em]",
          rule.triggered ? "text-warning" : "text-muted-foreground/60",
        )}
      >
        {rule.triggered ? "✓ Triggered" : "— Not triggered"}
      </span>
    </li>
  );
}

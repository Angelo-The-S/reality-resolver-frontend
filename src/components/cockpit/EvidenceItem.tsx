import type { EvidenceItemData } from "@/types/realityResolver";
import { cn } from "@/lib/utils";
import { StatusPill, type Tone } from "./StatusPill";

function ambiguityTone(ambiguity: string): Tone {
  const value = ambiguity.toUpperCase();
  if (value === "LOW") return "success";
  if (value === "HIGH") return "warning";
  return "neutral";
}

function glyph(ambiguity: string, type: string) {
  const value = ambiguity.toUpperCase();
  if (type.toUpperCase() === "ABSENCE") return "○";
  return value === "LOW" ? "✓" : "⚠";
}

export function EvidenceItem({ item }: { item: EvidenceItemData }) {
  const tone = ambiguityTone(item.ambiguity);

  return (
    <li
      className={cn(
        "flex gap-3 border-l-2 py-3 pl-3",
        tone === "success" && "border-success/60",
        tone === "warning" && "border-warning/60",
        tone === "neutral" && "border-border-strong",
      )}
    >
      <span
        className={cn(
          "mt-0.5 font-mono text-sm leading-none",
          tone === "success" && "text-success",
          tone === "warning" && "text-warning",
          tone === "neutral" && "text-muted-foreground",
        )}
        aria-hidden
      >
        {glyph(item.ambiguity, item.type)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{item.source}</p>
        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {item.type} · {item.freshness_hours}h
        </p>
        <p className="mt-2 font-mono text-xs uppercase tracking-[0.12em] text-foreground/90">
          {item.claim}
        </p>
      </div>
      <StatusPill tone={tone} className="h-fit shrink-0">
        Amb {item.ambiguity}
      </StatusPill>
    </li>
  );
}

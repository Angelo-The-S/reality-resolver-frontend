import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Tone = "neutral" | "success" | "warning" | "critical" | "action";

const toneClasses: Record<Tone, string> = {
  neutral: "border-border-strong text-muted-foreground",
  success: "border-success/40 text-success bg-success/10",
  warning: "border-warning/40 text-warning bg-warning/10",
  critical: "border-critical/45 text-critical bg-critical/10",
  action: "border-action/45 text-action bg-action/10",
};

export function StatusPill({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em]",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Dot({ tone = "neutral", pulse }: { tone?: Tone; pulse?: boolean }) {
  const color: Record<Tone, string> = {
    neutral: "bg-neutral-signal",
    success: "bg-success",
    warning: "bg-warning",
    critical: "bg-critical",
    action: "bg-action",
  };
  return (
    <span
      className={cn(
        "inline-block size-1.5 rounded-full",
        color[tone],
        pulse && "animate-pulse-soft",
      )}
    />
  );
}

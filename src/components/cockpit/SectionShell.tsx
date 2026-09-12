import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionShellProps {
  index: string;
  title: string;
  status?: ReactNode;
  children: ReactNode;
  className?: string;
  dimmed?: boolean;
}

export function SectionShell({
  index,
  title,
  status,
  children,
  className,
  dimmed,
}: SectionShellProps) {
  return (
    <section
      className={cn(
        "animate-rise rounded-md border border-border bg-surface/60 backdrop-blur-[1px]",
        dimmed && "opacity-55",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground">
            {index}
          </span>
          <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-foreground">
            {title}
          </h2>
        </div>
        {status}
      </header>
      <div className="px-4 py-4">{children}</div>
    </section>
  );
}

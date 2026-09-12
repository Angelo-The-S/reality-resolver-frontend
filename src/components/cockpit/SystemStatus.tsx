import { Dot } from "./StatusPill";

export function SystemStatus({ resolved }: { resolved: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Dot tone={resolved ? "neutral" : "action"} pulse={!resolved} />
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        {resolved ? "Resolution complete" : "System ready"}
      </span>
    </div>
  );
}

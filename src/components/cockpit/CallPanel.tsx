import type { CallInfo } from "@/types/realityResolver";
import { SectionShell } from "./SectionShell";
import { StatusPill } from "./StatusPill";

export function CallPanel({ call }: { call: CallInfo }) {
  const placed = call.placed;

  return (
    <SectionShell
      index="05"
      title="CALL-E"
      dimmed={!placed}
      status={
        <StatusPill tone={placed ? "success" : "neutral"}>
          {placed ? "Completed" : "Not executed"}
        </StatusPill>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="label-tech">Call placed</p>
          <p className="mt-1 font-mono text-sm uppercase tracking-[0.14em] text-foreground">
            {placed ? "Yes" : "No"}
          </p>
        </div>
        <div>
          <p className="label-tech">Provider status</p>
          <p className="mt-1 font-mono text-sm uppercase tracking-[0.14em] text-foreground">
            {call.provider_status ?? "—"}
          </p>
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        CALL-E is the execution step only. The decision to call, and the permission to call, are
        resolved before this stage.
      </p>
    </SectionShell>
  );
}

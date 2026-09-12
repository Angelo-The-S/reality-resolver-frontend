import type { CallInfo, ResolutionResult } from "@/types/realityResolver";
import { cn } from "@/lib/utils";
import { SectionShell } from "./SectionShell";
import { StatusPill, type Tone } from "./StatusPill";

function intentTone(intent?: string): Tone {
  switch (intent?.toLowerCase()) {
    case "confirmed":
      return "success";
    case "cancelled":
      return "warning";
    case "unknown":
      return "critical";
    default:
      return "neutral";
  }
}

export function ResultPanel({
  call,
  result,
}: {
  call: CallInfo;
  result?: ResolutionResult | null | undefined;
}) {
  if (!call.placed) {
    return (
      <SectionShell index="06" title="Result" dimmed>
        <p className="font-mono text-sm uppercase tracking-[0.18em] text-muted-foreground">
          No call executed
        </p>
      </SectionShell>
    );
  }

  const intent = result?.subject_intent;
  const tone = intentTone(intent);

  return (
    <SectionShell
      index="06"
      title="Result"
      status={
        result?.manipulation_attempt_detected ? (
          <StatusPill tone="critical">Manipulation detected</StatusPill>
        ) : undefined
      }
    >
      <p
        className={cn(
          "text-2xl font-semibold uppercase tracking-[0.06em]",
          tone === "success" && "text-success",
          tone === "warning" && "text-warning",
          tone === "critical" && "text-critical",
          tone === "neutral" && "text-foreground",
        )}
      >
        {intent && intent !== "unknown" ? intent : "No intent captured"}
      </p>

      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        {result?.answered_by && (
          <div>
            <dt className="label-tech">Answered by</dt>
            <dd className="mt-1 font-mono text-sm uppercase tracking-[0.14em] text-foreground">
              {result.answered_by}
            </dd>
          </div>
        )}
        {result?.confidence_note && (
          <div>
            <dt className="label-tech">Confidence</dt>
            <dd className="mt-1 text-sm text-foreground">{result.confidence_note}</dd>
          </div>
        )}
      </dl>
    </SectionShell>
  );
}

import type { CaseSummary } from "@/types/realityResolver";

const PIPELINE = [
  "Evidence",
  "Decision-critical uncertainty",
  "Call justified",
  "Call allowed",
  "CALL-E",
  "Result",
  "Verdict",
  "Action",
];

export function IdleContext({ caseInfo }: { caseInfo?: CaseSummary | undefined }) {
  return (
    <div className="animate-rise rounded-md border border-border bg-surface/60 px-6 py-10">
      <p className="label-tech">Ready for resolution</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
        {caseInfo?.name ?? "Critical Service Escalation"}
      </h2>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {caseInfo?.use_case ?? "Medical Equipment"}
      </p>
      <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Evidence requires resolution. Determine whether a call is necessary, whether it is
        permitted, and what action should follow.

      </p>

      <ul className="mt-8 flex flex-wrap items-center gap-x-1 gap-y-2 lg:flex-nowrap">
        {PIPELINE.map((step, i) => (
          <li key={step} className="flex shrink-0 items-center gap-1">
            {i > 0 && (
              <span aria-hidden className="font-mono text-[10px] text-muted-foreground/50">
                →
              </span>
            )}
            <span className="whitespace-nowrap rounded-sm border border-border px-1.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground lg:tracking-[0.08em]">
              {step}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

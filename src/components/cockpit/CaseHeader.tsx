import type { CaseInfo } from "@/types/realityResolver";

export function CaseHeader({ caseInfo }: { caseInfo: CaseInfo }) {
  return (
    <div className="mb-4 border-l-2 border-border-strong pl-3">
      <p className="label-tech">Case</p>
      <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">
        {caseInfo.name}
      </h3>
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {caseInfo.use_case}
      </p>
    </div>
  );
}

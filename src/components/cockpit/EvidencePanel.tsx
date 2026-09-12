import type { CaseInfo, EvidenceItemData } from "@/types/realityResolver";
import { SectionShell } from "./SectionShell";
import { CaseHeader } from "./CaseHeader";
import { EvidenceItem } from "./EvidenceItem";
import { StatusPill } from "./StatusPill";

export function EvidencePanel({
  caseInfo,
  evidence,
}: {
  caseInfo: CaseInfo;
  evidence: EvidenceItemData[];
}) {
  return (
    <SectionShell
      index="01"
      title="Evidence"
      status={<StatusPill>{evidence.length} signals</StatusPill>}
    >
      <CaseHeader caseInfo={caseInfo} />
      <ul className="divide-y divide-border">
        {evidence.map((item, i) => (
          <EvidenceItem key={`${item.source}-${i}`} item={item} />
        ))}
      </ul>
    </SectionShell>
  );
}

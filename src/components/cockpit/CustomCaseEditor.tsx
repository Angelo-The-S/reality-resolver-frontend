import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type {
  CustomAmbiguity,
  CustomCaseInput,
  CustomEvidenceInput,
  CustomEvidenceType,
  DemoScenarioId,
  ExecutionMode,
} from "@/types/realityResolver";

export type CustomIndustry =
  | "field-service"
  | "healthcare"
  | "logistics"
  | "hospitality"
  | "recruiting"
  | "property-maintenance"
  | "customer-support"
  | "equipment-maintenance";

export interface CustomCaseDraft {
  industry: CustomIndustry;
  caseInput: CustomCaseInput;
  executionMode: ExecutionMode;
  fakeScenario: DemoScenarioId;
  apiKey: string;
  destination: string;
  liveAuthorized: boolean;
}

const INDUSTRIES: { id: CustomIndustry; label: string }[] = [
  { id: "field-service", label: "Field Service" },
  { id: "healthcare", label: "Healthcare" },
  { id: "logistics", label: "Logistics" },
  { id: "hospitality", label: "Hospitality" },
  { id: "recruiting", label: "Recruiting" },
  { id: "property-maintenance", label: "Property Maintenance" },
  { id: "customer-support", label: "Customer Support" },
  { id: "equipment-maintenance", label: "Equipment Maintenance" },
];

const SCENARIOS: { id: DemoScenarioId; label: string }[] = [
  { id: "confirmed", label: "Confirmed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "voicemail", label: "Voicemail / ambiguous" },
  { id: "blocked", label: "Blocked" },
  { id: "no-call-needed", label: "No call needed" },
];

const TYPES: CustomEvidenceType[] = ["structured", "human", "absence"];
const AMBIGUITIES: CustomAmbiguity[] = ["low", "medium", "high"];

type Template = {
  industry: CustomIndustry;
  subject: string;
  organization: string;
  structured: string;
  diverging: string;
  confirming: string;
  task: string;
  confirmedAction: string;
  cancelledAction: string;
};

const TEMPLATES: Template[] = [
  {
    industry: "field-service",
    subject: "Technician",
    organization: "Northstar Service Group",
    structured: "technician assigned, intervention confirmed for the scheduled window",
    diverging: "I might not be able to make the intervention today",
    confirming: "I am still attending as planned",
    task: "Ask the assigned technician to confirm whether the scheduled intervention remains feasible.",
    confirmedAction: "CONTINUE_SERVICE_PLAN",
    cancelledAction: "ASSIGN_BACKUP_TECHNICIAN",
  },
  {
    industry: "healthcare",
    subject: "Patient appointment",
    organization: "Harbor Clinic",
    structured: "appointment confirmed for the scheduled time",
    diverging: "I may need to cancel the appointment",
    confirming: "I will be there as planned",
    task: "Ask the recipient to confirm whether the scheduled appointment remains feasible.",
    confirmedAction: "KEEP_APPOINTMENT",
    cancelledAction: "RELEASE_APPOINTMENT_SLOT",
  },
  {
    industry: "logistics",
    subject: "Delivery",
    organization: "Parcel North",
    structured: "driver assigned and delivery confirmed for the scheduled window",
    diverging: "A vehicle issue means I might not complete the delivery",
    confirming: "The delivery is still on track",
    task: "Ask the assigned driver to confirm whether the delivery plan remains feasible.",
    confirmedAction: "KEEP_DELIVERY_PLAN",
    cancelledAction: "ASSIGN_BACKUP_DRIVER",
  },
  {
    industry: "hospitality",
    subject: "Reservation",
    organization: "Cedar House",
    structured: "reservation confirmed for the scheduled arrival",
    diverging: "I may need to cancel the reservation",
    confirming: "I am still arriving as planned",
    task: "Ask the guest to confirm whether the scheduled reservation remains active.",
    confirmedAction: "KEEP_RESERVATION",
    cancelledAction: "RELEASE_RESERVATION",
  },
  {
    industry: "recruiting",
    subject: "Interview",
    organization: "Brightline Labs",
    structured: "candidate interview confirmed for the scheduled time",
    diverging: "I might not be able to attend the interview",
    confirming: "I am still attending as planned",
    task: "Ask the candidate to confirm whether the scheduled interview remains feasible.",
    confirmedAction: "KEEP_INTERVIEW_SLOT",
    cancelledAction: "OFFER_ALTERNATE_SLOT",
  },
  {
    industry: "property-maintenance",
    subject: "Contractor visit",
    organization: "Civic Oak Property Care",
    structured: "contractor visit confirmed for the scheduled window",
    diverging: "I may need to reschedule the visit",
    confirming: "I will be there as planned",
    task: "Ask the contractor to confirm whether the scheduled visit remains feasible.",
    confirmedAction: "KEEP_VISIT_PLAN",
    cancelledAction: "ASSIGN_ALTERNATE_CONTRACTOR",
  },
  {
    industry: "customer-support",
    subject: "Scheduled callback",
    organization: "Mosaic Support",
    structured: "customer callback confirmed for the scheduled window",
    diverging: "I might not be available for the callback",
    confirming: "I am still available as planned",
    task: "Ask the customer to confirm whether the scheduled callback remains feasible.",
    confirmedAction: "KEEP_CALLBACK_PLAN",
    cancelledAction: "OFFER_CALLBACK_WINDOW",
  },
  {
    industry: "equipment-maintenance",
    subject: "Maintenance intervention",
    organization: "Atlas Equipment",
    structured: "maintenance intervention confirmed for the scheduled window",
    diverging: "I may no longer be able to complete the intervention",
    confirming: "The intervention is still on track",
    task: "Ask the assigned technician to confirm whether the maintenance intervention remains feasible.",
    confirmedAction: "KEEP_MAINTENANCE_PLAN",
    cancelledAction: "ASSIGN_BACKUP_CREW",
  },
];

const isoHoursFromNow = (hours: number) => new Date(Date.now() + hours * 3600000).toISOString();

function templateFor(industry: CustomIndustry): Template {
  return TEMPLATES.find((template) => template.industry === industry) ?? TEMPLATES[0]!;
}

export function initialCustomDraft(): CustomCaseDraft {
  return generateCustomDraft("logistics");
}

export function generateCustomDraft(industry?: CustomIndustry): CustomCaseDraft {
  const selected = industry ?? INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)]!.id;
  const template = templateFor(selected);
  const suffix = Math.floor(100 + Math.random() * 900);
  const family = Math.floor(Math.random() * 3);
  const contradiction = family !== 1;
  const deadlineHours = family === 2 ? 72 : 3;
  const evidence: CustomEvidenceInput[] = [
    {
      source: `${template.organization.toLowerCase().replaceAll(" ", "-")}-system`,
      type: "structured",
      freshness_hours: 2,
      claim: `${template.subject.toLowerCase()} ${template.structured}`,
      ambiguity: "low",
    },
    {
      source: "recent-human-message",
      type: "human",
      freshness_hours: 1,
      claim: contradiction ? template.diverging : template.confirming,
      ambiguity: contradiction ? "high" : "low",
    },
  ];
  if (contradiction) {
    evidence.push({
      source: "follow-up-check",
      type: "absence",
      freshness_hours: 0.5,
      claim: "no later resolving confirmation received",
      ambiguity: "high",
    });
  }
  return {
    industry: selected,
    executionMode: "fake",
    fakeScenario: "confirmed",
    apiKey: "",
    destination: "",
    liveAuthorized: false,
    caseInput: {
      name: `${template.subject} check ${suffix}`,
      use_case: "factual_state_confirmation",
      deadline: isoHoursFromNow(deadlineHours),
      decision_deadline_threshold_hours: 24,
      decision_options: {
        if_confirmed: template.confirmedAction,
        if_cancelled: template.cancelledAction,
      },
      call_task_hint: template.task,
      evidence,
      industry: selected,
    },
  };
}

function fieldClass() {
  return "w-full rounded-sm border border-border bg-background/70 px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-action";
}

function updateEvidence(
  draft: CustomCaseDraft,
  index: number,
  patch: Partial<CustomEvidenceInput>,
): CustomCaseDraft {
  const evidence = draft.caseInput.evidence.map((item, itemIndex) =>
    itemIndex === index ? { ...item, ...patch } : item,
  );
  return { ...draft, caseInput: { ...draft.caseInput, evidence } };
}

export function CustomCaseEditor({
  draft,
  onChange,
  onSubmit,
  running,
}: {
  draft: CustomCaseDraft;
  onChange: (draft: CustomCaseDraft) => void;
  onSubmit: () => void;
  running: boolean;
}) {
  const industryLabel = useMemo(
    () => INDUSTRIES.find((industry) => industry.id === draft.industry)?.label ?? draft.industry,
    [draft.industry],
  );
  const canRun =
    !running &&
    (draft.executionMode === "fake" ||
      (draft.apiKey.trim().length > 0 && draft.destination.trim().length > 0 && draft.liveAuthorized));

  function patchCase(patch: Partial<CustomCaseInput>) {
    onChange({ ...draft, caseInput: { ...draft.caseInput, ...patch } });
  }

  function generate() {
    onChange(generateCustomDraft(draft.industry));
  }

  return (
    <section className="space-y-4 rounded-md border border-border bg-surface/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label-tech">Custom case</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Manual ingestion — equivalent to data supplied by a CRM, ERP, ticketing system, calendar,
            messaging system, or API integration.
          </p>
        </div>
        <span className="rounded-sm border border-action/40 bg-action/10 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-action">
          Synthetic test data — generated locally
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="space-y-1 text-[11px] text-muted-foreground">
          <span className="label-tech">Industry</span>
          <select
            className={fieldClass()}
            disabled={running}
            value={draft.industry}
            onChange={(event) => onChange({ ...draft, industry: event.target.value as CustomIndustry })}
          >
            {INDUSTRIES.map((industry) => (
              <option key={industry.id} value={industry.id}>{industry.label}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-[11px] text-muted-foreground md:col-span-2">
          <span className="label-tech">Case name</span>
          <input className={fieldClass()} disabled={running} value={draft.caseInput.name} onChange={(event) => patchCase({ name: event.target.value })} />
        </label>
      </div>

      <label className="block space-y-1 text-[11px] text-muted-foreground">
        <span className="label-tech">Use case</span>
        <select
          className={fieldClass()}
          disabled={running}
          value={draft.caseInput.use_case}
          onChange={(event) => onChange({ ...draft, caseInput: { ...draft.caseInput, use_case: event.target.value as CustomCaseInput["use_case"] } })}
        >
          <option value="factual_state_confirmation">Factual state confirmation</option>
          <option value="appointment_confirmation">Appointment confirmation</option>
          <option value="critical_service_escalation">Critical service escalation</option>
        </select>
      </label>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-[11px] text-muted-foreground">
          <span className="label-tech">Deadline (UTC ISO 8601)</span>
          <input className={fieldClass()} disabled={running} value={draft.caseInput.deadline} onChange={(event) => patchCase({ deadline: event.target.value })} />
        </label>
        <label className="space-y-1 text-[11px] text-muted-foreground">
          <span className="label-tech">Decision threshold (hours)</span>
          <input className={fieldClass()} disabled={running} type="number" min="0.01" max="720" step="0.5" value={draft.caseInput.decision_deadline_threshold_hours} onChange={(event) => patchCase({ decision_deadline_threshold_hours: Number(event.target.value) })} />
        </label>
      </div>

      <label className="block space-y-1 text-[11px] text-muted-foreground">
        <span className="label-tech">Call task hint</span>
        <textarea className={`${fieldClass()} min-h-20`} disabled={running} value={draft.caseInput.call_task_hint} onChange={(event) => patchCase({ call_task_hint: event.target.value })} />
      </label>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="label-tech">Evidence</span>
          <button type="button" disabled={running || draft.caseInput.evidence.length >= 20} onClick={() => patchCase({ evidence: [...draft.caseInput.evidence, { source: "new-source", type: "human", freshness_hours: 1, claim: "", ambiguity: "medium" }] })} className="font-mono text-[10px] uppercase tracking-[0.14em] text-action disabled:opacity-50">+ Add evidence</button>
        </div>
        {draft.caseInput.evidence.map((item, index) => (
          <div key={`${index}-${item.source}`} className="grid gap-2 rounded-sm border border-border/70 bg-background/30 p-3 md:grid-cols-5">
            <input className={fieldClass()} disabled={running} value={item.source} placeholder="Source" onChange={(event) => onChange(updateEvidence(draft, index, { source: event.target.value }))} />
            <select className={fieldClass()} disabled={running} value={item.type} onChange={(event) => onChange(updateEvidence(draft, index, { type: event.target.value as CustomEvidenceType }))}>{TYPES.map((type) => <option key={type}>{type}</option>)}</select>
            <input className={fieldClass()} disabled={running} type="number" min="0" max="8760" step="0.5" value={item.freshness_hours} onChange={(event) => onChange(updateEvidence(draft, index, { freshness_hours: Number(event.target.value) }))} />
            <select className={fieldClass()} disabled={running} value={item.ambiguity} onChange={(event) => onChange(updateEvidence(draft, index, { ambiguity: event.target.value as CustomAmbiguity }))}>{AMBIGUITIES.map((ambiguity) => <option key={ambiguity}>{ambiguity}</option>)}</select>
            <div className="flex gap-2 md:col-span-1">
              <input className={fieldClass()} disabled={running} value={item.claim} placeholder="Statement / claim" onChange={(event) => onChange(updateEvidence(draft, index, { claim: event.target.value }))} />
              <button type="button" disabled={running || draft.caseInput.evidence.length <= 1} onClick={() => patchCase({ evidence: draft.caseInput.evidence.filter((_, itemIndex) => itemIndex !== index) })} className="px-2 font-mono text-[10px] text-muted-foreground hover:text-foreground disabled:opacity-40" aria-label="Remove evidence">×</button>
            </div>
          </div>
        ))}
        <p className="text-[10px] text-muted-foreground">Columns: source · type · freshness hours · ambiguity · claim</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-[11px] text-muted-foreground"><span className="label-tech">Confirmed action</span><input className={fieldClass()} disabled={running} value={draft.caseInput.decision_options.if_confirmed} onChange={(event) => patchCase({ decision_options: { ...draft.caseInput.decision_options, if_confirmed: event.target.value } })} /></label>
        <label className="space-y-1 text-[11px] text-muted-foreground"><span className="label-tech">Cancelled action</span><input className={fieldClass()} disabled={running} value={draft.caseInput.decision_options.if_cancelled} onChange={(event) => patchCase({ decision_options: { ...draft.caseInput.decision_options, if_cancelled: event.target.value } })} /></label>
      </div>

      <div className="space-y-3 border-t border-border pt-3">
        <span className="label-tech">Execution mode</span>
        <div className="flex flex-wrap gap-2">
          {(["fake", "live"] as ExecutionMode[]).map((mode) => (
            <button key={mode} type="button" disabled={running} onClick={() => onChange({ ...draft, executionMode: mode })} className={cn("rounded-sm border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em]", draft.executionMode === mode ? "border-action/60 bg-action/15 text-action" : "border-border text-muted-foreground")}>{mode === "fake" ? "Demo / Fake" : "Live CALL-E"}</button>
          ))}
        </div>
        {draft.executionMode === "fake" ? (
          <div className="flex flex-wrap gap-2">
            {SCENARIOS.map((scenario) => <button key={scenario.id} type="button" disabled={running} onClick={() => onChange({ ...draft, fakeScenario: scenario.id })} className={cn("rounded-sm border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em]", draft.fakeScenario === scenario.id ? "border-action/60 bg-action/15 text-action" : "border-border text-muted-foreground")}>{scenario.label}</button>)}
          </div>
        ) : (
          <div className="space-y-3 rounded-sm border border-red-500/40 bg-red-500/5 p-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-red-300">LIVE CALL — This will place a real phone call through CALL-E.</p>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-[11px] text-muted-foreground"><span className="label-tech">CALL-E API key (BYOK)</span><input className={fieldClass()} disabled={running} type="password" autoComplete="off" value={draft.apiKey} onChange={(event) => onChange({ ...draft, apiKey: event.target.value })} /></label>
              <label className="space-y-1 text-[11px] text-muted-foreground"><span className="label-tech">Destination phone (strict E.164)</span><input className={fieldClass()} disabled={running} type="tel" autoComplete="off" value={draft.destination} onChange={(event) => onChange({ ...draft, destination: event.target.value })} placeholder="Enter manually" /></label>
            </div>
            <label className="flex items-start gap-2 text-xs text-muted-foreground"><input type="checkbox" disabled={running} checked={draft.liveAuthorized} onChange={(event) => onChange({ ...draft, liveAuthorized: event.target.checked })} className="mt-0.5" /><span>I confirm that I am authorized to call this number and to use CALL-E for this test.</span></label>
            <p className="text-[10px] text-muted-foreground">Your CALL-E API key is used only for this request and is not stored by Reality Resolver.</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <button type="button" disabled={running} onClick={generate} className="rounded-sm border border-border-strong px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground disabled:opacity-50">Generate {industryLabel} test case</button>
          <button type="button" disabled={running} onClick={() => onChange(generateCustomDraft())} className="rounded-sm border border-border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground disabled:opacity-50">Generate another</button>
        </div>
        <button type="button" disabled={!canRun} onClick={onSubmit} className="rounded-sm bg-action px-5 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-action-foreground transition-opacity hover:opacity-90 disabled:opacity-50">{running ? "Resolving…" : draft.executionMode === "live" ? "Place live call" : "Analyze & resolve"}</button>
      </div>
      <p className="text-[10px] text-muted-foreground">The generator creates inputs only. The backend engine evaluates evidence, R1–R4, compliance, reconciliation, verdict, and action.</p>
    </section>
  );
}

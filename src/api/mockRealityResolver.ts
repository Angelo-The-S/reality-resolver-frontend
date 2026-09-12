import type {
  CaseId,
  CaseSummary,
  DemoScenarioId,
  HealthResponse,
  Resolution,
} from "@/types/realityResolver";

/* ------------------------------------------------------------------ */
/* CASE 1 — Critical Service Escalation                                */
/* ------------------------------------------------------------------ */

const CASE_INFO = {
  id: "critical-service-escalation",
  name: "Critical Service Escalation",
  use_case: "Medical Equipment",
};

const EVIDENCE = [
  {
    source: "Maintenance system",
    type: "STRUCTURED",
    freshness_hours: 72,
    claim: "CONFIRMED",
    ambiguity: "LOW",
  },
  {
    source: "Technician message",
    type: "HUMAN",
    freshness_hours: 6,
    claim: "MAY CANCEL",
    ambiguity: "HIGH",
  },
  {
    source: "No later resolution",
    type: "ABSENCE",
    freshness_hours: 4,
    claim: "UNRESOLVED",
    ambiguity: "HIGH",
  },
];

const EVIDENCE_CONSISTENT = [
  {
    source: "Maintenance system",
    type: "STRUCTURED",
    freshness_hours: 72,
    claim: "CONFIRMED",
    ambiguity: "LOW",
  },
  {
    source: "Technician message",
    type: "HUMAN",
    freshness_hours: 6,
    claim: "ON SITE AS SCHEDULED",
    ambiguity: "LOW",
  },
  {
    source: "Dispatch acknowledgement",
    type: "STRUCTURED",
    freshness_hours: 2,
    claim: "RESOLVED",
    ambiguity: "LOW",
  },
];

const RULES_TRIGGERED = [
  {
    id: "R1",
    name: "STRUCTURED STATE",
    triggered: true,
    reason: "Maintenance system asserts a confirmed technician dispatch.",
  },
  {
    id: "R2",
    name: "HUMAN QUALIFICATION",
    triggered: true,
    reason: "Recent human message qualifies the structured state as uncertain.",
  },
  {
    id: "R3",
    name: "UNRESOLVED EVIDENCE",
    triggered: true,
    reason: "No later evidence resolves the contradiction.",
  },
  {
    id: "R4",
    name: "DECISION DEADLINE",
    triggered: true,
    reason: "The dispatch decision window closes within the operating horizon.",
  },
];

const RULES_NOT_CRITICAL = [
  {
    id: "R1",
    name: "STRUCTURED STATE",
    triggered: true,
    reason: "Maintenance system asserts a confirmed technician dispatch.",
  },
  {
    id: "R2",
    name: "HUMAN QUALIFICATION",
    triggered: false,
    reason: "No human message contradicts the structured state.",
  },
  {
    id: "R3",
    name: "UNRESOLVED EVIDENCE",
    triggered: false,
    reason: "Latest evidence resolves prior ambiguity.",
  },
  {
    id: "R4",
    name: "DECISION DEADLINE",
    triggered: false,
    reason: "Decision window is not imminent.",
  },
];

const COMPLIANCE_ALLOWED = {
  jurisdiction_chain: ["US FEDERAL"],
  checks: [
    { id: "ai_disclosure", name: "AI disclosure", passed: true },
    { id: "solicitation_restriction", name: "Solicitation restriction", passed: false },
    { id: "calling_window", name: "Calling window", passed: false },
  ],
  exempted_for_use_case: ["solicitation_restriction", "calling_window"],
  allowed: true,
  next_legal_window: null,
};

const COMPLIANCE_BLOCKED = {
  jurisdiction_chain: ["US FEDERAL", "US-CA"],
  checks: [
    { id: "ai_disclosure", name: "AI disclosure", passed: true },
    { id: "solicitation_restriction", name: "Solicitation restriction", passed: false },
    { id: "calling_window", name: "Calling window", passed: false },
  ],
  exempted_for_use_case: ["solicitation_restriction"],
  allowed: false,
  next_legal_window: "2026-09-11T15:00:00Z",
};

const base = {
  state: "completed",
  mode: "fake",
  case: CASE_INFO,
  evidence: EVIDENCE,
  error: null,
} as const;

const ESCALATION_FIXTURES: Record<DemoScenarioId, Resolution> = {
  "no-call-needed": {
    ...base,
    id: "res_mock_escalation_no_call",
    evidence: EVIDENCE_CONSISTENT,
    reasoning: { rules: RULES_NOT_CRITICAL, decision_critical: false },
    call_decision: "NO_CALL_NEEDED",
    compliance: null,
    call: { placed: false, provider_status: null },
    result: null,
    verdict: { status: "NO_CALL_NEEDED", action: "NO_ACTION_REQUIRED" },
  },
  blocked: {
    ...base,
    id: "res_mock_escalation_blocked",
    reasoning: { rules: RULES_TRIGGERED, decision_critical: true },
    call_decision: "CALL_JUSTIFIED",
    compliance: COMPLIANCE_BLOCKED,
    call: { placed: false, provider_status: null },
    result: null,
    verdict: { status: "UNRESOLVED_CALL_BLOCKED", action: "RETRY_WHEN_PERMITTED" },
  },
  confirmed: {
    ...base,
    id: "res_mock_escalation_confirmed",
    reasoning: { rules: RULES_TRIGGERED, decision_critical: true },
    call_decision: "CALL_JUSTIFIED",
    compliance: COMPLIANCE_ALLOWED,
    call: { placed: true, provider_status: "completed" },
    result: {
      subject_intent: "confirmed",
      answered_by: "human",
      confidence_note: "High confidence",
      manipulation_attempt_detected: false,
    },
    verdict: { status: "RESOLVED", action: "CONTINUE_DISPATCH" },
  },
  cancelled: {
    ...base,
    id: "res_mock_escalation_cancelled",
    reasoning: { rules: RULES_TRIGGERED, decision_critical: true },
    call_decision: "CALL_JUSTIFIED",
    compliance: COMPLIANCE_ALLOWED,
    call: { placed: true, provider_status: "completed" },
    result: {
      subject_intent: "cancelled",
      answered_by: "human",
      confidence_note: "High confidence",
      manipulation_attempt_detected: false,
    },
    verdict: { status: "RESOLVED_ALT", action: "REASSIGN_TECHNICIAN" },
  },
  voicemail: {
    ...base,
    id: "res_mock_escalation_voicemail",
    reasoning: { rules: RULES_TRIGGERED, decision_critical: true },
    call_decision: "CALL_JUSTIFIED",
    compliance: COMPLIANCE_ALLOWED,
    call: { placed: true, provider_status: "completed" },
    result: {
      subject_intent: "unknown",
      answered_by: "voicemail",
      confidence_note: "No human response captured",
    },
    verdict: { status: "UNRESOLVED_AMBIGUOUS", action: "HUMAN_REVIEW" },
  },
};

/* ------------------------------------------------------------------ */
/* CASE 2 — Ghost Appointment                                          */
/* ------------------------------------------------------------------ */

const GHOST_CASE_INFO = {
  id: "ghost-appointment",
  name: "Ghost Appointment",
  use_case: "Appointment",
};

const GHOST_EVIDENCE = [
  {
    source: "Booking system",
    type: "STRUCTURED",
    freshness_hours: 96,
    claim: "APPOINTMENT BOOKED",
    ambiguity: "LOW",
  },
  {
    source: "Client message",
    type: "HUMAN",
    freshness_hours: 9,
    claim: "MIGHT NOT MAKE IT",
    ambiguity: "HIGH",
  },
  {
    source: "No reminder reply",
    type: "ABSENCE",
    freshness_hours: 5,
    claim: "UNCONFIRMED",
    ambiguity: "HIGH",
  },
];

const GHOST_EVIDENCE_CONSISTENT = [
  {
    source: "Booking system",
    type: "STRUCTURED",
    freshness_hours: 96,
    claim: "APPOINTMENT BOOKED",
    ambiguity: "LOW",
  },
  {
    source: "Client message",
    type: "HUMAN",
    freshness_hours: 9,
    claim: "SEE YOU TOMORROW",
    ambiguity: "LOW",
  },
  {
    source: "Reminder reply",
    type: "STRUCTURED",
    freshness_hours: 3,
    claim: "CONFIRMED BY CLIENT",
    ambiguity: "LOW",
  },
];

const GHOST_RULES_TRIGGERED = [
  {
    id: "R1",
    name: "STRUCTURED STATE",
    triggered: true,
    reason: "Booking system asserts a confirmed appointment slot.",
  },
  {
    id: "R2",
    name: "HUMAN QUALIFICATION",
    triggered: true,
    reason: "A recent client message casts doubt on attendance.",
  },
  {
    id: "R3",
    name: "UNRESOLVED EVIDENCE",
    triggered: true,
    reason: "The reminder went unanswered, so the doubt is still open.",
  },
  {
    id: "R4",
    name: "DECISION DEADLINE",
    triggered: true,
    reason: "The slot must be kept or released before the next working day.",
  },
];

const GHOST_RULES_NOT_CRITICAL = [
  {
    id: "R1",
    name: "STRUCTURED STATE",
    triggered: true,
    reason: "Booking system asserts a confirmed appointment slot.",
  },
  {
    id: "R2",
    name: "HUMAN QUALIFICATION",
    triggered: false,
    reason: "The client message agrees with the booked slot.",
  },
  {
    id: "R3",
    name: "UNRESOLVED EVIDENCE",
    triggered: false,
    reason: "The reminder reply confirms attendance.",
  },
  {
    id: "R4",
    name: "DECISION DEADLINE",
    triggered: false,
    reason: "No slot decision is pending.",
  },
];

const GHOST_COMPLIANCE_ALLOWED = {
  jurisdiction_chain: ["US FEDERAL", "US-NY"],
  checks: [
    { id: "ai_disclosure", name: "AI disclosure", passed: true },
    { id: "solicitation_restriction", name: "Solicitation restriction", passed: false },
    { id: "calling_window", name: "Calling window", passed: true },
  ],
  exempted_for_use_case: ["solicitation_restriction"],
  allowed: true,
  next_legal_window: null,
};

const GHOST_COMPLIANCE_BLOCKED = {
  jurisdiction_chain: ["US FEDERAL", "US-NY"],
  checks: [
    { id: "ai_disclosure", name: "AI disclosure", passed: true },
    { id: "solicitation_restriction", name: "Solicitation restriction", passed: false },
    { id: "calling_window", name: "Calling window", passed: false },
  ],
  exempted_for_use_case: ["solicitation_restriction"],
  allowed: false,
  next_legal_window: "2026-09-10T13:00:00Z",
};

const ghostBase = {
  state: "completed",
  mode: "fake",
  case: GHOST_CASE_INFO,
  evidence: GHOST_EVIDENCE,
  error: null,
} as const;

const GHOST_FIXTURES: Record<DemoScenarioId, Resolution> = {
  "no-call-needed": {
    ...ghostBase,
    id: "res_mock_ghost_no_call",
    evidence: GHOST_EVIDENCE_CONSISTENT,
    reasoning: { rules: GHOST_RULES_NOT_CRITICAL, decision_critical: false },
    call_decision: "NO_CALL_NEEDED",
    compliance: null,
    call: { placed: false, provider_status: null },
    result: null,
    verdict: { status: "NO_CALL_NEEDED", action: "NO_ACTION_REQUIRED" },
  },
  blocked: {
    ...ghostBase,
    id: "res_mock_ghost_blocked",
    reasoning: { rules: GHOST_RULES_TRIGGERED, decision_critical: true },
    call_decision: "CALL_JUSTIFIED",
    compliance: GHOST_COMPLIANCE_BLOCKED,
    call: { placed: false, provider_status: null },
    result: null,
    verdict: { status: "UNRESOLVED_CALL_BLOCKED", action: "RETRY_WHEN_PERMITTED" },
  },
  confirmed: {
    ...ghostBase,
    id: "res_mock_ghost_confirmed",
    reasoning: { rules: GHOST_RULES_TRIGGERED, decision_critical: true },
    call_decision: "CALL_JUSTIFIED",
    compliance: GHOST_COMPLIANCE_ALLOWED,
    call: { placed: true, provider_status: "completed" },
    result: {
      subject_intent: "confirmed",
      answered_by: "human",
      confidence_note: "Client will attend the booked slot",
      manipulation_attempt_detected: false,
    },
    verdict: { status: "RESOLVED", action: "KEEP_APPOINTMENT" },
  },
  cancelled: {
    ...ghostBase,
    id: "res_mock_ghost_cancelled",
    reasoning: { rules: GHOST_RULES_TRIGGERED, decision_critical: true },
    call_decision: "CALL_JUSTIFIED",
    compliance: GHOST_COMPLIANCE_ALLOWED,
    call: { placed: true, provider_status: "completed" },
    result: {
      subject_intent: "cancelled",
      answered_by: "human",
      confidence_note: "Client will not attend the booked slot",
      manipulation_attempt_detected: false,
    },
    verdict: { status: "RESOLVED_ALT", action: "RELEASE_SLOT" },
  },
  voicemail: {
    ...ghostBase,
    id: "res_mock_ghost_voicemail",
    reasoning: { rules: GHOST_RULES_TRIGGERED, decision_critical: true },
    call_decision: "CALL_JUSTIFIED",
    compliance: GHOST_COMPLIANCE_ALLOWED,
    call: { placed: true, provider_status: "completed" },
    result: {
      subject_intent: "unknown",
      answered_by: "voicemail",
      confidence_note: "No human response captured",
    },
    verdict: { status: "UNRESOLVED_AMBIGUOUS", action: "HUMAN_REVIEW" },
  },
};

/* ------------------------------------------------------------------ */

const FIXTURES_BY_CASE: Record<CaseId, Record<DemoScenarioId, Resolution>> = {
  "critical-service-escalation": ESCALATION_FIXTURES,
  "ghost-appointment": GHOST_FIXTURES,
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function mockResolve(
  scenario: DemoScenarioId,
  caseId: CaseId = "critical-service-escalation",
): Promise<Resolution> {
  await delay(2200);
  const table = FIXTURES_BY_CASE[caseId] ?? ESCALATION_FIXTURES;
  return structuredClone(table[scenario]);
}

export async function mockGetResolution(id: string): Promise<Resolution> {
  await delay(200);
  const all = Object.values(FIXTURES_BY_CASE).flatMap((table) => Object.values(table));
  const found = all.find((r) => r.id === id);
  return structuredClone(found ?? ESCALATION_FIXTURES.confirmed);
}

export async function mockHealth(): Promise<HealthResponse> {
  await delay(80);
  return { status: "ok", mode: "fake", engine_version: "0.0.0" };
}

export async function mockCases(): Promise<CaseSummary[]> {
  await delay(80);
  return [
    {
      id: "critical-service-escalation",
      name: "Critical Service Escalation",
      use_case: "Medical Equipment",
    },
    { id: "ghost-appointment", name: "Ghost Appointment", use_case: "Appointment" },
  ];
}

export const mockCaseInfo = CASE_INFO;
export const mockEvidence = EVIDENCE;

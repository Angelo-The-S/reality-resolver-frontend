// Public, "safe" contract types for the Reality Resolver API.
// Sensitive backend fields (transcript, provider_call_id, metadata, attempts,
// call_task, evidence_cited, phone numbers, credentials) are intentionally
// absent — the frontend never expects nor renders them.

export type CaseId = "critical-service-escalation" | "ghost-appointment";

export type ScenarioId = "confirmed" | "cancelled" | "voicemail" | "blocked";

/** Demo-only selector values, including the "no call needed" branch. */
export type DemoScenarioId = ScenarioId | "no-call-needed";

export type ExecutionMode = "fake" | "live";

export type CustomEvidenceType = "structured" | "human" | "absence";
export type CustomAmbiguity = "low" | "medium" | "high";

export interface CustomEvidenceInput {
  source: string;
  type: CustomEvidenceType;
  freshness_hours: number;
  claim: string;
  ambiguity: CustomAmbiguity;
}

export interface CustomCaseInput {
  name: string;
  use_case: "appointment_confirmation" | "critical_service_escalation" | "factual_state_confirmation";
  deadline: string;
  decision_deadline_threshold_hours: number;
  decision_options: {
    if_confirmed: string;
    if_cancelled: string;
  };
  call_task_hint: string;
  evidence: CustomEvidenceInput[];
  call_phone?: string;
  industry?: string;
}

export interface CaseInfo {
  id?: string;
  name: string;
  use_case: string;
}

export interface EvidenceItemData {
  source: string;
  type: string;
  freshness_hours: number;
  claim: string;
  ambiguity: string;
}

export interface ReasoningRule {
  id: string;
  name: string;
  triggered: boolean;
  reason: string;
}

export interface Reasoning {
  rules: ReasoningRule[];
  decision_critical: boolean;
}

export type CallDecision = "CALL_JUSTIFIED" | "NO_CALL_NEEDED";

export interface ComplianceCheckData {
  id: string;
  name: string;
  passed: boolean;
  detail?: string;
}

export interface Compliance {
  jurisdiction_chain: string[];
  checks: ComplianceCheckData[];
  exempted_for_use_case: string[];
  allowed: boolean;
  next_legal_window: string | null;
}

export interface CallInfo {
  placed: boolean;
  provider_status?: string | null;
  /** The engine nests the CALL-E outcome here. */
  result?: ResolutionResult | null;
}

export interface ResolutionResult {
  subject_intent?: string;
  answered_by?: string;
  confidence_note?: string;
  manipulation_attempt_detected?: boolean;
}

export interface Verdict {
  status: string;
  action: string;
  summary?: string;
}

/** Engine lifecycle state, as reported by the backend. */
export type ResolutionState = "queued" | "running" | "completed" | "failed";

export interface Resolution {
  id: string;
  state: ResolutionState | string;
  mode: string;
  case: CaseInfo;
  evidence: EvidenceItemData[];
  reasoning: Reasoning;
  call_decision: CallDecision;
  compliance: Compliance | null;
  call: CallInfo;
  result?: ResolutionResult | null;
  verdict: Verdict | null;
  error?: ApiErrorPayload | null;
}

/**
 * Exact HTTP shape returned by the async engine. The POST answers 202 with
 * every section still null, so all payload fields are optional here.
 */
export interface RawResolution {
  id: string;
  state: ResolutionState | string;
  mode?: string;
  case?: (CaseInfo & { decision_options?: unknown }) | null;
  evidence?: EvidenceItemData[] | null;
  reasoning?: Reasoning | null;
  call_decision?: CallDecision | null;
  compliance?: Compliance | null;
  call?: CallInfo | null;
  result?: ResolutionResult | null;
  verdict?: Verdict | null;
  error?: ApiErrorPayload | string | null;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
}

export class ApiError extends Error {
  code: string;
  status: number;

  constructor(payload: ApiErrorPayload, status: number) {
    super(payload.message);
    this.name = "ApiError";
    this.code = payload.code;
    this.status = status;
  }
}

/** Scenario ids accepted on the wire by the engine. */
export type WireScenarioId = ScenarioId | "no-call";

export interface ResolveRequest {
  case: CaseId;
  execution_mode: "fake";
  scenario: WireScenarioId;
  now_utc?: string;
}

export interface HealthResponse {
  status: string;
  mode: string;
  engine_version: string;
}

export interface CaseSummary {
  id: CaseId;
  name: string;
  use_case: string;
}

/** Safe catalog entry returned by the backend's /api/cases endpoint. */
export interface RawCaseCatalogEntry {
  name: string;
  use_case: string;
  deadline: string;
  decision_deadline_threshold_hours: number;
  decision_options: Record<string, string>;
  evidence: EvidenceItemData[];
  call_phone_masked: string;
}

export interface RawCaseCatalogResponse {
  cases: RawCaseCatalogEntry[];
}

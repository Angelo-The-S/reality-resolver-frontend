import {
  ApiError,
  type CaseId,
  type CaseInfo,
  type CaseSummary,
  type DemoScenarioId,
  type HealthResponse,
  type RawResolution,
  type RawCaseCatalogResponse,
  type Resolution,
  type ResolveRequest,
  type WireScenarioId,
} from "@/types/realityResolver";
import {
  mockCases,
  mockGetResolution,
  mockHealth,
  mockResolve,
} from "./mockRealityResolver";

const env = import.meta.env as Record<string, string | undefined>;

/** Mock is the default: the local engine has no CORS and must not be assumed reachable. */
export const USE_MOCK = env["VITE_USE_MOCK"] !== "false";
const API_BASE_URL = env["VITE_API_BASE_URL"] ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError(
      { code: "network_error", message: "the resolution engine could not be reached" },
      0,
    );
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const err = (payload as { error?: { code?: string; message?: string } } | null)?.error;
    throw new ApiError(
      {
        code: err?.code ?? "unexpected_error",
        message: err?.message ?? "the resolution could not be completed",
      },
      response.status,
    );
  }

  return payload as T;
}

/** UI scenario ids map onto the wire ids the engine accepts. */
function toWireScenario(scenario: DemoScenarioId): WireScenarioId {
  return scenario === "no-call-needed" ? "no-call" : scenario;
}

function normalizeCase(rawCase: RawResolution["case"]): CaseInfo {
  if (!rawCase) return { name: "", use_case: "" };
  const presentation = CASE_PRESENTATIONS[rawCase.name as CaseId];
  return presentation
    ? { ...presentation, id: rawCase.name as CaseId }
    : { name: rawCase.name, use_case: rawCase.use_case };
}

/**
 * Shape translation only — no business logic. The engine nests the CALL-E
 * outcome under `call.result`; the panels read `result`.
 */
function normalize(raw: RawResolution): Resolution {
  const call = raw.call ?? { placed: false };
  const rawError = raw.error;
  return {
    id: raw.id,
    state: raw.state,
    mode: raw.mode ?? "",
    case: normalizeCase(raw.case),
    evidence: raw.evidence ?? [],
    reasoning: raw.reasoning ?? { rules: [], decision_critical: false },
    call_decision: raw.call_decision ?? "NO_CALL_NEEDED",
    compliance: raw.compliance ?? null,
    call,
    result: raw.result ?? call.result ?? null,
    verdict: raw.verdict ?? null,
    error:
      typeof rawError === "string"
        ? { code: "resolution_failed", message: rawError }
        : (rawError ?? null),
  };
}

export async function resolveCase(
  scenario: DemoScenarioId,
  options?: { case?: CaseId; nowUtc?: string },
): Promise<Resolution> {
  if (USE_MOCK) return mockResolve(scenario, options?.case);

  const body: ResolveRequest = {
    case: options?.case ?? "critical-service-escalation",
    execution_mode: "fake",
    scenario: toWireScenario(scenario),
    ...(options?.nowUtc ? { now_utc: options.nowUtc } : {}),
  };

  const raw = await request<RawResolution>("/api/resolutions", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return normalize(raw);
}

export async function getResolution(id: string): Promise<Resolution> {
  if (USE_MOCK) return mockGetResolution(id);
  const raw = await request<RawResolution>(
    `/api/resolutions/${encodeURIComponent(id)}`,
  );
  return normalize(raw);
}

const POLL_INTERVAL_MS = 1200;
/** ~4 minutes at 1.2s — generous enough for a real engine run. */
const POLL_MAX_ATTEMPTS = 200;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Full async round-trip: POST, then poll until the engine reports a terminal
 * state. A failed run is surfaced as an error, never as a verdict.
 */
export async function runResolution(
  scenario: DemoScenarioId,
  options?: {
    case?: CaseId;
    nowUtc?: string;
    onState?: (resolution: Resolution) => void;
  },
): Promise<Resolution> {
  const first = await resolveCase(scenario, options);
  options?.onState?.(first);

  if (USE_MOCK) return first;

  let current = first;
  for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt += 1) {
    if (current.state === "failed") {
      throw new ApiError(
        {
          code: current.error?.code ?? "resolution_failed",
          message: current.error?.message ?? "the resolution could not be completed",
        },
        200,
      );
    }
    if (current.state === "completed") return current;

    await wait(POLL_INTERVAL_MS);
    current = await getResolution(current.id);
    options?.onState?.(current);
  }

  throw new ApiError(
    { code: "resolution_timeout", message: "the resolution is taking longer than expected" },
    0,
  );
}

export async function getHealth(): Promise<HealthResponse> {
  if (USE_MOCK) return mockHealth();
  return request<HealthResponse>("/api/health");
}

export async function getCases(): Promise<CaseSummary[]> {
  if (USE_MOCK) return mockCases();
  const payload = await request<RawCaseCatalogResponse>("/api/cases");
  return payload.cases.flatMap((entry) => {
    const presentation = CASE_PRESENTATIONS[entry.name as CaseId];
    return presentation ? [{ ...presentation, id: entry.name as CaseId }] : [];
  });
}

const CASE_PRESENTATIONS: Record<CaseId, Omit<CaseSummary, "id">> = {
  "critical-service-escalation": {
    name: "Critical Service Escalation",
    use_case: "Medical Equipment",
  },
  "ghost-appointment": {
    name: "Ghost Appointment",
    use_case: "Appointment",
  },
};

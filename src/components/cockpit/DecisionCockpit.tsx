import { useEffect, useRef, useState } from "react";
import { getCases, runResolution } from "@/api/realityResolver";
import {
  ApiError,
  type CaseId,
  type CaseSummary,
  type DemoScenarioId,
  type ExecutionMode,
  type Resolution,
  type ResolutionState,
} from "@/types/realityResolver";
import { CaseSelector } from "./CaseSelector";
import { IdleContext } from "./IdleContext";
import { SystemStatus } from "./SystemStatus";
import { ProgressRail, type RailStates } from "./ProgressRail";
import { ScenarioSelector } from "./ScenarioSelector";
import { EvidencePanel } from "./EvidencePanel";
import { ReasoningPanel } from "./ReasoningPanel";
import { CallDecisionPanel } from "./CallDecisionPanel";
import { CompliancePanel } from "./CompliancePanel";
import { CallPanel } from "./CallPanel";
import { ResultPanel } from "./ResultPanel";
import { VerdictPanel } from "./VerdictPanel";
import { ResolvingOverlay } from "./ResolvingOverlay";
import { ErrorState } from "./ErrorState";
import {
  CustomCaseEditor,
  initialCustomDraft,
  type CustomCaseDraft,
} from "./CustomCaseEditor";

type Phase = "idle" | "resolving" | "resolved" | "error";

const FALLBACK_CASES: CaseSummary[] = [
  {
    id: "critical-service-escalation",
    name: "Critical Service Escalation",
    use_case: "Medical Equipment",
  },
  { id: "ghost-appointment", name: "Ghost Appointment", use_case: "Appointment" },
];

export function DecisionCockpit() {
  const [cockpitMode, setCockpitMode] = useState<"demo" | "custom">("demo");
  const [scenario, setScenario] = useState<DemoScenarioId>("confirmed");
  const [caseId, setCaseId] = useState<CaseId>("critical-service-escalation");
  const [phase, setPhase] = useState<Phase>("idle");
  const [resolutionState, setResolutionState] = useState<ResolutionState | null>(null);
  const [resolution, setResolution] = useState<Resolution | null>(null);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [cases, setCases] = useState<CaseSummary[]>(FALLBACK_CASES);
  const [customDraft, setCustomDraft] = useState<CustomCaseDraft>(initialCustomDraft);

  useEffect(() => {
    let active = true;
    getCases()
      .then((list) => {
        if (active) setCases(list);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const runIdRef = useRef(0);
  const inFlightRef = useRef(false);

  async function run() {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    const runId = ++runIdRef.current;

    setPhase("resolving");
    setResolutionState(null);
    setError(null);
    setResolution(null);
    try {
      const custom = cockpitMode === "custom" ? customDraft : undefined;
      const runScenario = custom?.fakeScenario ?? scenario;
      const next = await runResolution(runScenario, {
        ...(custom
          ? {
              customCase: custom.caseInput,
              executionMode: custom.executionMode as ExecutionMode,
              ...(custom.executionMode === "live"
                ? {
                    destination: custom.destination,
                    authorizeDestination: custom.destination,
                    gdprBasisDocumented: custom.liveAuthorized,
                    apiKey: custom.apiKey,
                  }
                : {}),
            }
          : { case: caseId }),
        onState: (nextState) => {
          if (runId !== runIdRef.current) return;
          if (
            nextState.state === "queued" ||
            nextState.state === "running" ||
            nextState.state === "completed" ||
            nextState.state === "failed"
          ) {
            setResolutionState(nextState.state);
          }
        },
      });
      if (runId !== runIdRef.current) return;
      setResolution(next);
      setPhase("resolved");
    } catch (e) {
      if (runId !== runIdRef.current) return;
      const apiError =
        e instanceof ApiError
          ? { code: e.code, message: e.message }
          : { code: "resolution_failed", message: "the resolution could not be completed" };
      setError(apiError);
      setPhase("error");
    } finally {
      if (cockpitMode === "custom" && customDraft.executionMode === "live") {
        setCustomDraft((current) => ({
          ...current,
          apiKey: "",
          destination: "",
          liveAuthorized: false,
        }));
      }
      if (runId === runIdRef.current) inFlightRef.current = false;
    }
  }

  const activeCase = cases.find((c) => c.id === caseId) ?? cases[0];
  const resolvingState: Extract<ResolutionState, "queued" | "running"> =
    resolutionState === "running" ? "running" : "queued";

  // Presentation-only mapping: reads what the Resolution already reports,
  // never infers why a call did or did not happen.
  const railStates: RailStates =
    phase === "resolved" && resolution
      ? [
          "done",
          "done",
          resolution.call.placed ? "done" : "skipped",
          resolution.verdict ? "done" : "pending",
        ]
      : phase === "resolving"
        ? ["done", "active", "pending", "pending"]
        : ["active", "pending", "pending", "pending"];


  return (
    <div className="min-h-screen grid-backdrop">
      <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold uppercase tracking-[0.18em] text-foreground">
              Reality Resolver
            </h1>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Decision-gated calling
            </p>
          </div>
          <SystemStatus resolved={phase === "resolved"} />
        </div>
        <div className="mx-auto max-w-6xl border-t border-border px-5 py-2">
          <ProgressRail states={railStates} />
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 px-5 py-6">
        <CaseSelector
          cases={cases}
          value={caseId}
          onChange={setCaseId}
          disabled={phase === "resolving"}
          compact={phase === "resolved"}
        />

        <div className="flex gap-2 border-b border-border pb-2">
          {(["demo", "custom"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              disabled={phase === "resolving"}
              onClick={() => {
                setCockpitMode(mode);
                setPhase("idle");
                setResolution(null);
                setError(null);
              }}
              className={`rounded-sm border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] ${cockpitMode === mode ? "border-action/60 bg-action/15 text-action" : "border-border text-muted-foreground"}`}
            >
              {mode === "demo" ? "Demo cases" : "Custom case"}
            </button>
          ))}
        </div>

        {cockpitMode === "demo" ? (
          <ScenarioSelector
            value={scenario}
            onChange={setScenario}
            onRun={run}
            running={phase === "resolving"}
          />
        ) : (
          <CustomCaseEditor
            draft={customDraft}
            onChange={setCustomDraft}
            onSubmit={run}
            running={phase === "resolving"}
          />
        )}

        {phase === "idle" && <IdleContext caseInfo={activeCase} />}

        {phase === "resolving" && (
          <ResolvingOverlay state={resolvingState} />
        )}

        {phase === "error" && error && (
          <ErrorState code={error.code} message={error.message} onRetry={run} />
        )}

        {phase === "resolved" && resolution && (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-4">
                <EvidencePanel caseInfo={resolution.case} evidence={resolution.evidence} />
                <ReasoningPanel reasoning={resolution.reasoning} />
              </div>
              <div className="space-y-4">
                <CallDecisionPanel decision={resolution.call_decision} />
                <CompliancePanel compliance={resolution.compliance} />
                {resolution.call.placed ? (
                  <>
                    <CallPanel call={resolution.call} />
                    <ResultPanel call={resolution.call} result={resolution.result} />
                  </>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <CallPanel call={resolution.call} />
                    <ResultPanel call={resolution.call} result={resolution.result} />
                  </div>
                )}
              </div>

            </div>
            <VerdictPanel verdict={resolution.verdict} />
          </>
        )}
      </main>
    </div>
  );
}

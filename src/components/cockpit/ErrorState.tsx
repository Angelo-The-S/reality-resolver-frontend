export function ErrorState({
  code,
  message,
  onRetry,
}: {
  code: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="animate-rise rounded-md border border-critical/50 bg-critical/10 px-6 py-8">
      <p className="label-tech">Resolution failed</p>
      <p className="mt-2 font-mono text-lg uppercase tracking-[0.1em] text-critical">{code}</p>
      <p className="mt-2 max-w-xl text-sm text-foreground/80">{message}</p>
      <p className="mt-3 text-xs text-muted-foreground">
        No verdict is available for a technical failure. Nothing has been decided.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-sm border border-border-strong px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-surface-raised"
      >
        Retry
      </button>
    </div>
  );
}

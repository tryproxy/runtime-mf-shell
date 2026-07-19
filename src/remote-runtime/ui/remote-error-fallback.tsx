type RemoteErrorFallbackProps = {
  title?: string;
  message?: string | null;
  onRetry?: () => void;
};

export function RemoteErrorFallback({
  title = 'Remote module unavailable',
  message,
  onRetry,
}: RemoteErrorFallbackProps) {
  return (
    <div className="rounded-rmf-md border-rmf-border bg-rmf-surface shadow-rmf-sm border p-5">
      <p className="text-rmf-subtle text-sm font-medium">Error</p>
      <p className="text-rmf-fg mt-3 text-lg font-semibold">{title}</p>
      <p className="text-rmf-muted mt-2 text-sm">
        The shell stayed up. This slot failed to load or render the remote
        module.
      </p>
      {message ? (
        <pre className="text-rmf-muted mt-4 max-h-40 overflow-auto text-xs whitespace-pre-wrap">
          {message}
        </pre>
      ) : null}
      {onRetry ? (
        <button
          type="button"
          className="border-rmf-border text-rmf-fg rounded-rmf-md mt-4 border px-3 py-1.5 text-sm"
          onClick={onRetry}
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}

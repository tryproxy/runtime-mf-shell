import { useTranslation } from 'react-i18next';

type ShellErrorFallbackProps = {
  title?: string;
  message?: string | null;
  onRetry?: () => void;
};

export function ShellErrorFallback({
  title,
  message,
  onRetry,
}: ShellErrorFallbackProps) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-slate-900">
      <div className="rounded-rmf-md border-rmf-border bg-rmf-surface shadow-rmf-sm w-full max-w-lg border p-5">
        <p className="text-rmf-subtle text-sm font-medium">
          {t('shellError.label')}
        </p>
        <p className="text-rmf-fg mt-3 text-lg font-semibold">
          {title ?? t('shellError.title')}
        </p>
        <p className="text-rmf-muted mt-2 text-sm">
          {t('shellError.description')}
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
            {t('shellError.retry')}
          </button>
        ) : null}
      </div>
    </div>
  );
}

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
} from '@/shared/ui/shadcn';
import { AlertCircleIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type ShellErrorFallbackProps = {
  title?: string;
  message?: string | null;
  onRetry?: () => void;
};

/** Shared shell-level fallback presentation. */

export function ShellErrorFallback({
  title,
  message,
  onRetry,
}: ShellErrorFallbackProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-6">
      <Alert variant="destructive" className="max-w-lg">
        <AlertCircleIcon />
        <AlertTitle>{title ?? t('shellError.title')}</AlertTitle>
        <AlertDescription>
          <p>{t('shellError.description')}</p>
          {message ? (
            <pre className="mt-3 max-h-40 overflow-auto text-xs whitespace-pre-wrap">
              {message}
            </pre>
          ) : null}
          {onRetry ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={onRetry}
            >
              {t('shellError.retry')}
            </Button>
          ) : null}
        </AlertDescription>
      </Alert>
    </div>
  );
}

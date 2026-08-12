import type { AppLocale, ThemeMode } from '@platform/runtime-mf-contract';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  RemoteHostContext,
  RemoteSession,
  RemoteSessionSnapshot,
} from '../model/remote-runtime';
import { useRemoteRuntime } from '../model/use-remote-runtime';
import { RemoteErrorBoundary } from './remote-error-boundary';
import { RemoteErrorFallback } from './remote-error-fallback';

type RemoteSlotProps = {
  remoteId: string;
  basename: string;
  theme: ThemeMode;
  locale: AppLocale;
};

const LOADING_SNAPSHOT: RemoteSessionSnapshot = {
  status: 'loading',
  stage: 'load',
};

export function RemoteSlot({
  remoteId,
  basename,
  theme,
  locale,
}: RemoteSlotProps) {
  const { t } = useTranslation();
  const runtime = useRemoteRuntime();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sessionRef = useRef<RemoteSession | null>(null);
  const hostContextRef = useRef<RemoteHostContext>({ theme, locale });
  const [snapshot, setSnapshot] =
    useState<RemoteSessionSnapshot>(LOADING_SNAPSHOT);
  const [retryCount, setRetryCount] = useState(0);

  hostContextRef.current = { theme, locale };

  useEffect(() => {
    sessionRef.current?.updateHostContext({ theme, locale });
  }, [locale, theme]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    setSnapshot(LOADING_SNAPSHOT);

    const session = runtime.start({
      remoteId,
      basename,
      container,
      hostContext: hostContextRef.current,
    });
    sessionRef.current = session;
    setSnapshot(session.getSnapshot());

    const unsubscribe = session.subscribe(() => {
      setSnapshot(session.getSnapshot());
    });

    return () => {
      if (sessionRef.current === session) {
        sessionRef.current = null;
      }

      unsubscribe();
      session.dispose();
    };
  }, [basename, remoteId, retryCount, runtime]);

  const errorMessage =
    snapshot.status === 'error' ? snapshot.error.message : null;

  return (
    <RemoteErrorBoundary resetKey={`${remoteId}:${basename}:${retryCount}`}>
      <section className="min-h-0">
        {snapshot.status === 'loading' ? (
          <p className="text-muted-foreground text-sm">{t('remote.loading')}</p>
        ) : null}
        {snapshot.status === 'error' ? (
          <RemoteErrorFallback
            title={t('remote.failedTitle')}
            message={errorMessage}
            onRetry={() => setRetryCount((count) => count + 1)}
          />
        ) : null}
        <div ref={containerRef} className="min-h-0" />
      </section>
    </RemoteErrorBoundary>
  );
}

import { useEffect, useRef, useState } from 'react';
import type {
  AppLocale,
  HostBridge,
  RemoteAppInstance,
  ThemeMode,
} from 'demo_remote/mount';
import { useTranslation } from 'react-i18next';
import { createHostBridge } from '../lib/create-host-bridge';
import { RemoteErrorBoundary } from './remote-error-boundary';
import { RemoteErrorFallback } from './remote-error-fallback';

type RemoteModule = {
  mount(params: {
    container: HTMLElement;
    bridge: HostBridge;
    basename: string;
  }): RemoteAppInstance;
};

type RemoteModuleLoaderResult =
  | RemoteModule
  | {
      default: RemoteModule;
    };

type RemoteSlotProps = {
  basename: string;
  loader: () => Promise<RemoteModuleLoaderResult>;
  theme: ThemeMode;
  locale: AppLocale;
};

/** Dead remotes often hang on `import(remoteEntry)` instead of rejecting. */
const REMOTE_LOAD_TIMEOUT_MS = 8_000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(
        new Error(`Remote load timed out after ${timeoutMs}ms (is it running?)`)
      );
    }, timeoutMs);

    promise.then(
      (value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
}

export function RemoteSlot({
  basename,
  loader,
  theme,
  locale,
}: RemoteSlotProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hostBridgeRef = useRef(createHostBridge(theme, locale));
  const loaderRef = useRef(loader);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  loaderRef.current = loader;

  const hostBridge = hostBridgeRef.current;
  const bridge: HostBridge = hostBridge.bridge;

  useEffect(() => {
    hostBridge.setTheme(theme);
  }, [hostBridge, theme]);

  useEffect(() => {
    hostBridge.setLocale(locale);
  }, [hostBridge, locale]);

  // Mount once per basename (+ explicit retry). Not on theme/locale.
  useEffect(() => {
    let instance: RemoteAppInstance | null = null;
    let cancelled = false;

    async function run() {
      try {
        setStatus('loading');
        setErrorMessage(null);

        const remote = await withTimeout(
          loaderRef.current(),
          REMOTE_LOAD_TIMEOUT_MS
        );
        const resolvedRemote = 'default' in remote ? remote.default : remote;

        if (cancelled || !containerRef.current) {
          return;
        }

        instance = resolvedRemote.mount({
          container: containerRef.current,
          bridge,
          basename,
        });

        setStatus('ready');
      } catch (error) {
        if (cancelled) {
          return;
        }
        console.error('[RemoteSlot] Failed to load remote:', error);
        setStatus('error');
        setErrorMessage(
          error instanceof Error ? error.message : 'Unknown remote load error.'
        );
      }
    }

    void run();

    return () => {
      cancelled = true;
      instance?.unmount();
    };
  }, [basename, bridge, retryCount]);

  return (
    <RemoteErrorBoundary resetKey={`${basename}:${retryCount}`}>
      <section>
        {status === 'loading' ? (
          <p className="text-muted-foreground text-sm">{t('remote.loading')}</p>
        ) : null}
        {status === 'error' ? (
          <RemoteErrorFallback
            title={t('remote.failedTitle')}
            message={errorMessage}
            onRetry={() => setRetryCount((count) => count + 1)}
          />
        ) : null}
        <div ref={containerRef} />
      </section>
    </RemoteErrorBoundary>
  );
}

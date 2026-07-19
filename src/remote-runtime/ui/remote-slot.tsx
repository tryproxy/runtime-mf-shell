import { useEffect, useRef, useState } from 'react';
import type {
  HostBridge,
  RemoteAppInstance,
  ThemeMode,
} from 'demo_remote/mount';
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
};

export function RemoteSlot({ basename, loader, theme }: RemoteSlotProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hostBridgeRef = useRef(createHostBridge(theme));
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

  // Mount once per basename (+ explicit retry). Do not depend on loader/theme.
  useEffect(() => {
    let instance: RemoteAppInstance | null = null;
    let cancelled = false;

    async function run() {
      try {
        setStatus('loading');
        setErrorMessage(null);

        const remote = await loaderRef.current();
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
          <p className="text-rmf-muted text-sm">Loading remote...</p>
        ) : null}
        {status === 'error' ? (
          <RemoteErrorFallback
            title="Remote failed to load"
            message={errorMessage}
            onRetry={() => setRetryCount((count) => count + 1)}
          />
        ) : null}
        <div ref={containerRef} />
      </section>
    </RemoteErrorBoundary>
  );
}

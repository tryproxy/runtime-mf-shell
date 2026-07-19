import { useEffect, useRef, useState } from 'react';
import type {
  HostBridge,
  RemoteAppInstance,
  ThemeMode,
} from 'demo_remote/mount';
import { createHostBridge } from '../lib/create-host-bridge';

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
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hostBridge = hostBridgeRef.current;
  const bridge: HostBridge = hostBridge.bridge;

  useEffect(() => {
    hostBridge.setTheme(theme);
  }, [hostBridge, theme]);

  useEffect(() => {
    let instance: RemoteAppInstance | null = null;
    let cancelled = false;

    async function run() {
      try {
        setStatus('loading');
        setErrorMessage(null);

        const remote = await loader();
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
  }, [basename, bridge, loader]);

  return (
    <section>
      {status === 'loading' ? <p>Loading remote...</p> : null}
      {status === 'error' ? (
        <div className="space-y-2 text-sm text-red-600">
          <p>Remote failed to load.</p>
          {errorMessage ? (
            <pre className="whitespace-pre-wrap">{errorMessage}</pre>
          ) : null}
        </div>
      ) : null}
      <div ref={containerRef} />
    </section>
  );
}

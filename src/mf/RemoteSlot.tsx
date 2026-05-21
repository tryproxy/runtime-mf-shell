import { useEffect, useMemo, useRef, useState } from 'react';
import type { HostBridge, RemoteAppInstance } from 'demo_remote/mount';

type RemoteModule = {
  mount(params: {
    container: HTMLElement;
    bridge: HostBridge;
    basename: string;
  }): RemoteAppInstance;
};

type RemoteSlotProps = {
  basename: string;
  loader: () => Promise<RemoteModule>;
};

export function RemoteSlot({ basename, loader }: RemoteSlotProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );

  const bridge = useMemo<HostBridge>(
    () => ({
      theme: {
        getSnapshot: () => ({ mode: 'light' }),
      },
      auth: {
        getSession: () => ({
          userId: 'dev-user',
          displayName: 'Dev User',
          roles: ['admin'],
        }),
      },
      navigation: {
        getLocation: () => ({
          pathname: window.location.pathname,
          search: window.location.search,
          hash: window.location.hash,
        }),
        navigate: (path) => {
          window.history.pushState(null, '', path);
          window.dispatchEvent(new PopStateEvent('popstate'));
        },
        replace: (path) => {
          window.history.replaceState(null, '', path);
          window.dispatchEvent(new PopStateEvent('popstate'));
        },
      },
    }),
    []
  );

  useEffect(() => {
    let instance: RemoteAppInstance | null = null;
    let cancelled = false;

    async function run() {
      try {
        setStatus('loading');

        const remote = await loader();

        if (cancelled || !containerRef.current) {
          return;
        }

        instance = remote.mount({
          container: containerRef.current,
          bridge,
          basename,
        });

        setStatus('ready');
      } catch (error) {
        console.error('[RemoteSlot] Failed to load remote:', error);
        setStatus('error');
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
      {status === 'error' ? <p>Remote failed to load.</p> : null}
      <div ref={containerRef} />
    </section>
  );
}

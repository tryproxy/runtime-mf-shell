import { fetchNavManifest } from '@/app/remote-navigation/fetch-nav-manifest';
import {
  RemoteNavManifestsContext,
  type RemoteNavManifestsState,
} from '@/app/remote-navigation/remote-nav-manifests-context';
import { useEffect, useState, type PropsWithChildren } from 'react';

const DEFAULT_REMOTE_MANIFEST_URL = 'http://localhost:5001/mf-manifest.json';
const DEFAULT_ANGULAR_REMOTE_MANIFEST_URL =
  'http://localhost:5002/mf-manifest.json';

const REMOTE_SOURCES = [
  {
    moduleId: 'remote',
    federationEntryUrl:
      import.meta.env.VITE_REMOTE_MANIFEST_URL || DEFAULT_REMOTE_MANIFEST_URL,
  },
  {
    moduleId: 'remoteAngular',
    federationEntryUrl:
      import.meta.env.VITE_ANGULAR_REMOTE_MANIFEST_URL ||
      DEFAULT_ANGULAR_REMOTE_MANIFEST_URL,
  },
] as const;

/**
 * Loads remote `nav.json` manifests independently.
 * One soft-fail / hung remote must not clear or delay another remote's pages.
 */
export function RemoteNavManifestsProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<RemoteNavManifestsState>({
    status: 'loading',
    byModuleId: {},
  });

  useEffect(() => {
    const controller = new AbortController();
    let pending = REMOTE_SOURCES.length;

    for (const source of REMOTE_SOURCES) {
      void (async () => {
        const result = await fetchNavManifest({
          federationEntryUrl: source.federationEntryUrl,
          expectedModuleId: source.moduleId,
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        if (result.ok) {
          setState((prev) => ({
            ...prev,
            byModuleId: {
              ...prev.byModuleId,
              [source.moduleId]: result.manifest,
            },
          }));
        } else if (result.reason !== 'aborted') {
          console.warn(
            `[nav-manifest] ${source.moduleId} soft-fail (${result.url}): ${result.reason}`
          );
        }

        pending -= 1;
        if (pending === 0) {
          setState((prev) => ({ ...prev, status: 'ready' }));
        }
      })();
    }

    return () => controller.abort();
  }, []);

  return (
    <RemoteNavManifestsContext.Provider value={state}>
      {children}
    </RemoteNavManifestsContext.Provider>
  );
}

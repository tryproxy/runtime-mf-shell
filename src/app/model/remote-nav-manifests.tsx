import { fetchNavManifest } from '@/app/model/fetch-nav-manifest';
import {
  RemoteNavManifestsContext,
  type RemoteNavManifestsState,
} from '@/app/model/remote-nav-manifests-context';
import { useEffect, useState, type PropsWithChildren } from 'react';

const DEFAULT_REMOTE_ENTRY_URL = 'http://localhost:5001/assets/remoteEntry.js';
const DEFAULT_ANGULAR_REMOTE_ENTRY_URL =
  'http://localhost:5002/assets/remoteEntry.js';

const REMOTE_SOURCES = [
  {
    moduleId: 'remote',
    remoteEntryUrl:
      import.meta.env.VITE_REMOTE_ENTRY_URL || DEFAULT_REMOTE_ENTRY_URL,
  },
  {
    moduleId: 'remoteAngular',
    remoteEntryUrl:
      import.meta.env.VITE_ANGULAR_REMOTE_ENTRY_URL ||
      DEFAULT_ANGULAR_REMOTE_ENTRY_URL,
  },
] as const;

/**
 * Loads remote `nav.json` manifests at shell startup.
 * Chrome reads pages via `useNavModules` (soft-fail → empty pages).
 */
export function RemoteNavManifestsProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<RemoteNavManifestsState>({
    status: 'loading',
    byModuleId: {},
  });

  useEffect(() => {
    const controller = new AbortController();

    void (async () => {
      const results = await Promise.all(
        REMOTE_SOURCES.map(async (source) => {
          const result = await fetchNavManifest({
            remoteEntryUrl: source.remoteEntryUrl,
            expectedModuleId: source.moduleId,
            signal: controller.signal,
          });

          if (!result.ok) {
            console.warn(
              `[nav-manifest] ${source.moduleId} soft-fail (${result.url}): ${result.reason}`
            );
            return null;
          }

          return { moduleId: source.moduleId, manifest: result.manifest };
        })
      );

      if (controller.signal.aborted) {
        return;
      }

      const byModuleId: RemoteNavManifestsState['byModuleId'] = {};

      for (const entry of results) {
        if (entry) {
          byModuleId[entry.moduleId] = entry.manifest;
        }
      }

      setState({ status: 'ready', byModuleId });
    })();

    return () => controller.abort();
  }, []);

  return (
    <RemoteNavManifestsContext.Provider value={state}>
      {children}
    </RemoteNavManifestsContext.Provider>
  );
}

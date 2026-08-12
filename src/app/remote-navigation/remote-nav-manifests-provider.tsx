import {
  ensureAllRemoteNav,
  ensureNav,
  getRemoteNavContributionSnapshot,
  refreshNav,
  subscribeRemoteNavContribution,
} from '@/app/remote-navigation/remote-nav-contribution-store';
import { RemoteNavManifestsContext } from '@/app/remote-navigation/remote-nav-manifests-context';
import {
  useEffect,
  useMemo,
  useSyncExternalStore,
  type PropsWithChildren,
} from 'react';

/**
 * Shell-owned nav contribution lifecycle.
 * Boot-ensures remotes once; callers can ensure/retry per module without reload.
 */
export function RemoteNavManifestsProvider({ children }: PropsWithChildren) {
  const snapshot = useSyncExternalStore(
    subscribeRemoteNavContribution,
    getRemoteNavContributionSnapshot,
    getRemoteNavContributionSnapshot
  );

  useEffect(() => {
    void ensureAllRemoteNav();
  }, []);

  const value = useMemo(
    () => ({
      byModuleId: snapshot.byModuleId,
      moduleStatus: Object.fromEntries(
        Object.entries(snapshot.modules).map(([moduleId, entry]) => [
          moduleId,
          entry.status,
        ])
      ),
      ensureNav,
      refreshNav,
    }),
    [snapshot]
  );

  return (
    <RemoteNavManifestsContext.Provider value={value}>
      {children}
    </RemoteNavManifestsContext.Provider>
  );
}

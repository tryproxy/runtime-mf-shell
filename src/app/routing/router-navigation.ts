import type { HostBridge } from '@platform/runtime-mf-contract';
import type { createBrowserRouter } from 'react-router-dom';

type AppRouter = ReturnType<typeof createBrowserRouter>;

let historySyncInstalled = false;

function locationKey(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

/**
 * Keep the shell data router synchronized with embedded BrowserRouters that
 * update the shared window history directly.
 */
export function installHistorySync(router: AppRouter): void {
  if (historySyncInstalled || typeof window === 'undefined') {
    return;
  }

  historySyncInstalled = true;
  let syncing = false;

  const syncShellFromWindow = () => {
    if (syncing) {
      return;
    }

    const next = locationKey();
    const current = `${router.state.location.pathname}${router.state.location.search}${router.state.location.hash}`;

    if (next === current) {
      return;
    }

    syncing = true;
    void router.navigate(next, { replace: true }).finally(() => {
      syncing = false;
    });
  };

  const { pushState, replaceState } = window.history;

  window.history.pushState = function pushStateSynced(...args) {
    const before = locationKey();
    pushState.apply(this, args);
    if (locationKey() === before) {
      return;
    }
    syncShellFromWindow();
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  window.history.replaceState = function replaceStateSynced(...args) {
    const before = locationKey();
    replaceState.apply(this, args);
    if (locationKey() === before) {
      return;
    }
    syncShellFromWindow();
    window.dispatchEvent(new PopStateEvent('popstate'));
  };
}

export function createRouterNavigation(
  router: AppRouter
): HostBridge['navigation'] {
  return {
    getSnapshot: () => {
      const { pathname, search, hash } = router.state.location;
      return { pathname, search, hash };
    },
    subscribe: (listener) => router.subscribe(() => listener()),
    navigate: (path) => {
      void router.navigate(path);
    },
    replace: (path) => {
      void router.navigate(path, { replace: true });
    },
  };
}

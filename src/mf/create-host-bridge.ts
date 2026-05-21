import type { HostBridge } from 'demo_remote/mount';

export function createHostBridge(): HostBridge {
  return {
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

      navigate: (path: string) => {
        window.history.pushState(null, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
      },

      replace: (path: string) => {
        window.history.replaceState(null, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
      },
    },
  };
}

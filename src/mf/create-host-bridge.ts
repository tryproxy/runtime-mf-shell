import type { HostBridge, ThemeMode } from 'demo_remote/mount';

type ThemeListener = () => void;

export function createHostBridge(initialTheme: ThemeMode): {
  bridge: HostBridge;
  setTheme(theme: ThemeMode): void;
} {
  let currentTheme = initialTheme;
  const listeners = new Set<ThemeListener>();

  const bridge: HostBridge = {
    theme: {
      getSnapshot: () => ({ mode: currentTheme }),
      subscribe: (listener) => {
        listeners.add(listener);

        return () => {
          listeners.delete(listener);
        };
      },
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

  return {
    bridge,
    setTheme(theme) {
      currentTheme = theme;
      listeners.forEach((listener) => listener());
    },
  };
}

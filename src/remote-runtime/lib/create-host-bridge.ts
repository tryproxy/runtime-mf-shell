import type { AppLocale, HostBridge, ThemeMode } from 'demo_remote/mount';

type Listener = () => void;

export function createHostBridge(
  initialTheme: ThemeMode,
  initialLocale: AppLocale
): {
  bridge: HostBridge;
  setTheme(theme: ThemeMode): void;
  setLocale(locale: AppLocale): void;
} {
  let currentTheme = initialTheme;
  let currentLocale = initialLocale;
  const themeListeners = new Set<Listener>();
  const localeListeners = new Set<Listener>();

  const bridge: HostBridge = {
    theme: {
      getSnapshot: () => ({ mode: currentTheme }),
      subscribe: (listener) => {
        themeListeners.add(listener);

        return () => {
          themeListeners.delete(listener);
        };
      },
    },

    i18n: {
      getLocale: () => currentLocale,
      subscribe: (listener) => {
        localeListeners.add(listener);

        return () => {
          localeListeners.delete(listener);
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
      themeListeners.forEach((listener) => listener());
    },
    setLocale(locale) {
      currentLocale = locale;
      localeListeners.forEach((listener) => listener());
    },
  };
}

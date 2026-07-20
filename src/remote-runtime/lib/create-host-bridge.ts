import type {
  AppLocale,
  HostBridge,
  ThemeMode,
} from '@platform/runtime-mf-contract';
import { createNoopTelemetry } from './create-noop-telemetry';

type Listener = () => void;

function subscribe(set: Set<Listener>, listener: Listener): () => void {
  set.add(listener);
  return () => {
    set.delete(listener);
  };
}

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
  const authListeners = new Set<Listener>();
  const navigationListeners = new Set<Listener>();

  const notifyNavigation = () => {
    navigationListeners.forEach((listener) => listener());
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', notifyNavigation);
  }

  const bridge: HostBridge = {
    theme: {
      getSnapshot: () => ({ mode: currentTheme }),
      subscribe: (listener) => subscribe(themeListeners, listener),
    },

    i18n: {
      getSnapshot: () => ({ locale: currentLocale }),
      subscribe: (listener) => subscribe(localeListeners, listener),
    },

    auth: {
      getSnapshot: () => ({
        userId: 'dev-user',
        displayName: 'Dev User',
        roles: ['admin'],
      }),
      subscribe: (listener) => subscribe(authListeners, listener),
    },

    navigation: {
      getSnapshot: () => ({
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      }),
      subscribe: (listener) => subscribe(navigationListeners, listener),

      navigate: (path: string) => {
        window.history.pushState(null, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
      },

      replace: (path: string) => {
        window.history.replaceState(null, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
      },
    },

    telemetry: createNoopTelemetry(),
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

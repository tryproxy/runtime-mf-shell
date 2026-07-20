import type {
  AppLocale,
  HostBridge,
  ThemeMode,
} from '@platform/runtime-mf-contract';
import { createNoopTelemetry } from './create-noop-telemetry';

type Listener = () => void;

const ACCESS_TOKEN_KEY = 'rmf-access-token';
const AUTH_EMAIL_KEY = 'rmf-auth-email';

function subscribe(set: Set<Listener>, listener: Listener): () => void {
  set.add(listener);
  return () => {
    set.delete(listener);
  };
}

function readAccessToken(): string | null {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

function readAuthEmail(): string | null {
  return window.localStorage.getItem(AUTH_EMAIL_KEY);
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
      getSnapshot: () => {
        const token = readAccessToken();
        const email = readAuthEmail();

        if (!token) {
          return null;
        }

        return {
          userId: email ?? 'user',
          displayName: email ?? undefined,
          roles: [],
        };
      },
      subscribe: (listener) => subscribe(authListeners, listener),
      http: {
        mode: 'bearer',
        getAccessToken: async () => readAccessToken(),
      },
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

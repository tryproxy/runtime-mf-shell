import type {
  AppLocale,
  HostBridge,
  HostLocation,
  ThemeMode,
} from '@platform/runtime-mf-contract';
import { getAppRouter } from '@/app/model/app-router-ref';
import { createNoopTelemetry } from './create-noop-telemetry';

type Listener = () => void;

const ACCESS_TOKEN_KEY = 'rmf-access-token';
const AUTH_EMAIL_KEY = 'rmf-auth-email';

let historySyncInstalled = false;

/**
 * Shell data router + embedded remote BrowserRouter share window.history.
 * - External push/replace (remote) → sync shell router
 * - Any URL change → synthetic popstate so the other router updates
 */
export function installHistorySync(): void {
  if (historySyncInstalled || typeof window === 'undefined') {
    return;
  }

  historySyncInstalled = true;
  let syncing = false;

  const locationKey = () =>
    `${window.location.pathname}${window.location.search}${window.location.hash}`;

  const syncShellFromWindow = () => {
    if (syncing) {
      return;
    }

    const router = getAppRouter();
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

function readLocation(): HostLocation {
  const { pathname, search, hash } = getAppRouter().state.location;

  return { pathname, search, hash };
}

export function createHostBridge(
  initialTheme: ThemeMode,
  initialLocale: AppLocale
): {
  bridge: HostBridge;
  setTheme(theme: ThemeMode): void;
  setLocale(locale: AppLocale): void;
} {
  installHistorySync();

  let currentTheme = initialTheme;
  let currentLocale = initialLocale;
  const themeListeners = new Set<Listener>();
  const localeListeners = new Set<Listener>();
  const authListeners = new Set<Listener>();

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
      getSnapshot: () => readLocation(),
      subscribe: (listener) => getAppRouter().subscribe(() => listener()),
      navigate: (path) => {
        void getAppRouter().navigate(path);
      },
      replace: (path) => {
        void getAppRouter().navigate(path, { replace: true });
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

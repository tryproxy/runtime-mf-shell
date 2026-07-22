import type {
  AppLocale,
  HostBridge,
  ThemeMode,
} from '@platform/runtime-mf-contract';
import type { RemoteRuntimeAdapters } from '../model/remote-runtime-context';
import { createNoopTelemetry } from './create-noop-telemetry';

type Listener = () => void;

function subscribe(set: Set<Listener>, listener: Listener): () => void {
  set.add(listener);
  return () => {
    set.delete(listener);
  };
}

export function createHostBridge(options: {
  initialTheme: ThemeMode;
  initialLocale: AppLocale;
  adapters: RemoteRuntimeAdapters;
}): {
  bridge: HostBridge;
  setTheme(theme: ThemeMode): void;
  setLocale(locale: AppLocale): void;
} {
  let currentTheme = options.initialTheme;
  let currentLocale = options.initialLocale;
  const themeListeners = new Set<Listener>();
  const localeListeners = new Set<Listener>();

  const bridge: HostBridge = {
    theme: {
      getSnapshot: () => ({ mode: currentTheme }),
      subscribe: (listener) => subscribe(themeListeners, listener),
    },

    i18n: {
      getSnapshot: () => ({ locale: currentLocale }),
      subscribe: (listener) => subscribe(localeListeners, listener),
    },

    auth: options.adapters.auth,
    navigation: options.adapters.navigation,
    telemetry: options.adapters.telemetry ?? createNoopTelemetry(),
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

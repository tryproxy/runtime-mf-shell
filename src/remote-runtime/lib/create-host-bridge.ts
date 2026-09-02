import type {
  AppLocale,
  HostBridge,
  HostTelemetry,
  ThemeMode,
} from '@platform/runtime-mf-contract';
import type { RemoteHostContext } from '../model/remote-runtime';

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
  auth: HostBridge['auth'];
  navigation: HostBridge['navigation'];
  telemetry: HostTelemetry;
}): {
  bridge: HostBridge;
  updateHostContext(context: RemoteHostContext): void;
  dispose(): void;
} {
  let currentTheme = options.initialTheme;
  let currentLocale = options.initialLocale;
  let disposed = false;
  const themeListeners = new Set<Listener>();
  const localeListeners = new Set<Listener>();
  const telemetry = options.telemetry;

  function notify(listeners: Set<Listener>, facet: 'theme' | 'i18n'): void {
    listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        try {
          telemetry.captureException(error, {
            lifecycleStage: 'bridge_subscriber',
            bridgeFacet: facet,
          });
        } catch {
          // Remote subscribers and observability cannot break host updates.
        }
      }
    });
  }

  const bridge: HostBridge = {
    theme: {
      getSnapshot: () => ({ mode: currentTheme }),
      subscribe: (listener) =>
        disposed ? () => undefined : subscribe(themeListeners, listener),
    },

    i18n: {
      getSnapshot: () => ({ locale: currentLocale }),
      subscribe: (listener) =>
        disposed ? () => undefined : subscribe(localeListeners, listener),
    },

    auth: options.auth,
    navigation: options.navigation,
    telemetry,
  };

  return {
    bridge,
    updateHostContext(context) {
      if (disposed) {
        return;
      }

      if (context.theme !== currentTheme) {
        currentTheme = context.theme;
        notify(themeListeners, 'theme');
      }

      if (context.locale !== currentLocale) {
        currentLocale = context.locale;
        notify(localeListeners, 'i18n');
      }
    },
    dispose() {
      if (disposed) {
        return;
      }

      disposed = true;
      themeListeners.clear();
      localeListeners.clear();
    },
  };
}

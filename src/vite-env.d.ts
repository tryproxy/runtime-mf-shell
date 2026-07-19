type RmfThemeMode = 'light' | 'dark';
type RmfAppLocale = 'en' | 'ru';

type RmfTelemetryProps = Record<
  string,
  string | number | boolean | null | undefined
>;

type RmfHostTelemetry = {
  track(event: string, props?: RmfTelemetryProps): void;
  captureException(error: unknown, props?: RmfTelemetryProps): void;
  captureMessage(
    message: string,
    level?: 'info' | 'warning' | 'error',
    props?: RmfTelemetryProps
  ): void;
};

type RmfHostBridge = {
  theme: {
    getSnapshot(): { mode: RmfThemeMode };
    subscribe(listener: () => void): () => void;
  };
  i18n: {
    getLocale(): RmfAppLocale;
    subscribe(listener: () => void): () => void;
  };
  auth: {
    getSession(): {
      userId: string;
      displayName?: string;
      roles: string[];
    } | null;
  };
  navigation: {
    getLocation(): {
      pathname: string;
      search: string;
      hash: string;
    };
    navigate(path: string): void;
    replace(path: string): void;
  };
  telemetry: RmfHostTelemetry;
};

type RmfRemoteAppInstance = {
  unmount(): void;
};

type RmfMountRemoteApp = (params: {
  container: HTMLElement;
  bridge: RmfHostBridge;
  basename: string;
}) => RmfRemoteAppInstance;

declare module 'demo_remote/mount' {
  export type ThemeMode = RmfThemeMode;
  export type AppLocale = RmfAppLocale;
  export type TelemetryProps = RmfTelemetryProps;
  export type HostTelemetry = RmfHostTelemetry;
  export type HostBridge = RmfHostBridge;
  export type RemoteAppInstance = RmfRemoteAppInstance;
  export type MountRemoteApp = RmfMountRemoteApp;
  export const mount: MountRemoteApp;
}

declare module 'angular_remote/mount' {
  export type ThemeMode = RmfThemeMode;
  export type AppLocale = RmfAppLocale;
  export type TelemetryProps = RmfTelemetryProps;
  export type HostTelemetry = RmfHostTelemetry;
  export type HostBridge = RmfHostBridge;
  export type RemoteAppInstance = RmfRemoteAppInstance;
  export type MountRemoteApp = RmfMountRemoteApp;
  export const mount: MountRemoteApp;
}

declare module 'demo_remote/mount' {
  export type ThemeMode = 'light' | 'dark';
  export type AppLocale = 'en' | 'ru';

  export type HostBridge = {
    theme: {
      getSnapshot(): { mode: ThemeMode };
      subscribe(listener: () => void): () => void;
    };
    i18n: {
      getLocale(): AppLocale;
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
  };

  export type RemoteAppInstance = {
    unmount(): void;
  };

  export type MountRemoteApp = (params: {
    container: HTMLElement;
    bridge: HostBridge;
    basename: string;
  }) => RemoteAppInstance;

  export const mount: MountRemoteApp;
}

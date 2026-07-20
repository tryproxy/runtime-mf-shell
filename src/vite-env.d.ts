declare module 'demo_remote/mount' {
  export type ThemeMode = import('@platform/runtime-mf-contract').ThemeMode;
  export type AppLocale = import('@platform/runtime-mf-contract').AppLocale;
  export type TelemetryProps =
    import('@platform/runtime-mf-contract').TelemetryProps;
  export type HostTelemetry =
    import('@platform/runtime-mf-contract').HostTelemetry;
  export type HostBridge = import('@platform/runtime-mf-contract').HostBridge;
  export type RemoteAppInstance =
    import('@platform/runtime-mf-contract').RemoteAppInstance;
  export type MountRemoteApp =
    import('@platform/runtime-mf-contract').MountRemoteApp;
  export const mount: MountRemoteApp;
}

declare module 'angular_remote/mount' {
  export type ThemeMode = import('@platform/runtime-mf-contract').ThemeMode;
  export type AppLocale = import('@platform/runtime-mf-contract').AppLocale;
  export type TelemetryProps =
    import('@platform/runtime-mf-contract').TelemetryProps;
  export type HostTelemetry =
    import('@platform/runtime-mf-contract').HostTelemetry;
  export type HostBridge = import('@platform/runtime-mf-contract').HostBridge;
  export type RemoteAppInstance =
    import('@platform/runtime-mf-contract').RemoteAppInstance;
  export type MountRemoteApp =
    import('@platform/runtime-mf-contract').MountRemoteApp;
  export const mount: MountRemoteApp;
}

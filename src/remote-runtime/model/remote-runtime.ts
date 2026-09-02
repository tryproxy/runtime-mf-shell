import type {
  AppLocale,
  HostBridge,
  HostTelemetry,
  ThemeMode,
} from '@platform/runtime-mf-contract';

export type RemoteRuntimeClock = {
  schedule(callback: () => void, delayMs: number): () => void;
};

export type RemoteRuntimeAdapters = {
  loadRemote(remoteId: string): Promise<unknown>;
  createAuthForRemote(remoteId: string): HostBridge['auth'];
  navigation: HostBridge['navigation'];
  telemetry?: HostTelemetry;
  clock?: RemoteRuntimeClock;
};

export type RemoteHostContext = {
  theme: ThemeMode;
  locale: AppLocale;
};

export type RemoteLifecycleStage =
  | 'load'
  | 'validate'
  | 'bootstrap'
  | 'readiness'
  | 'running'
  | 'disposal';

export type RemoteFailureStage =
  | 'load'
  | 'validate'
  | 'bootstrap'
  | 'readiness'
  | 'cleanup';

export class RemoteRuntimeError extends Error {
  readonly stage: RemoteFailureStage;

  constructor(stage: RemoteFailureStage, message: string, cause?: unknown) {
    super(message, { cause });
    this.name = 'RemoteRuntimeError';
    this.stage = stage;
  }
}

export type RemoteSessionSnapshot =
  | {
      status: 'loading';
      stage: Extract<
        RemoteLifecycleStage,
        'load' | 'validate' | 'bootstrap' | 'readiness'
      >;
    }
  | { status: 'ready'; stage: 'running' }
  | { status: 'error'; error: RemoteRuntimeError };

export type RemoteSession = {
  getSnapshot(): RemoteSessionSnapshot;
  subscribe(listener: () => void): () => void;
  updateHostContext(context: RemoteHostContext): void;
  dispose(): void;
};

export type StartRemoteSessionOptions = {
  remoteId: string;
  basename: string;
  container: HTMLElement;
  hostContext: RemoteHostContext;
};

export type RemoteRuntime = {
  start(options: StartRemoteSessionOptions): RemoteSession;
};

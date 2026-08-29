import {
  parseRemoteAppInstance,
  parseRemoteModule,
  type RemoteAppInstance,
} from '@platform/runtime-mf-contract';
import {
  type RemoteFailureStage,
  type RemoteRuntime,
  type RemoteRuntimeAdapters,
  RemoteRuntimeError,
  type RemoteSession,
  type RemoteSessionSnapshot,
  type StartRemoteSessionOptions,
} from '../model/remote-runtime';
import { createHostBridge } from './create-host-bridge';
import { createNoopTelemetry } from './create-noop-telemetry';
import { recordRemoteSessionStart } from './e2e-observation';

const DEFAULT_LOAD_TIMEOUT_MS = 8_000;
const DEFAULT_READINESS_TIMEOUT_MS = 8_000;
const DISPOSED = Symbol('remote-session-disposed');

type CreateRemoteRuntimeOptions = {
  adapters: RemoteRuntimeAdapters;
  loadTimeoutMs?: number;
  readinessTimeoutMs?: number;
};

function createBrowserClock(): NonNullable<RemoteRuntimeAdapters['clock']> {
  return {
    schedule(callback, delayMs) {
      const timeoutId = window.setTimeout(callback, delayMs);
      return () => window.clearTimeout(timeoutId);
    },
  };
}

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Unknown remote runtime error.';
}

function cleanupInvalidRemoteInstance(value: unknown): void {
  if (typeof value !== 'object' || value === null) {
    return;
  }

  const unmount = Reflect.get(value, 'unmount');

  if (typeof unmount === 'function') {
    Reflect.apply(unmount, value, []);
  }
}

function createSession(options: {
  start: StartRemoteSessionOptions;
  adapters: RemoteRuntimeAdapters;
  loadTimeoutMs: number;
  readinessTimeoutMs: number;
}): RemoteSession {
  recordRemoteSessionStart(options.start.remoteId);

  const telemetry = options.adapters.telemetry ?? createNoopTelemetry();
  const clock = options.adapters.clock ?? createBrowserClock();
  const bridgeController = createHostBridge({
    initialTheme: options.start.hostContext.theme,
    initialLocale: options.start.hostContext.locale,
    adapters: options.adapters,
  });
  const listeners = new Set<() => void>();
  let snapshot: RemoteSessionSnapshot = { status: 'loading', stage: 'load' };
  let instance: RemoteAppInstance | null = null;
  let instanceDisposed = false;
  let disposed = false;
  let signalDisposed: () => void = () => undefined;
  const disposedSignal = new Promise<typeof DISPOSED>((resolve) => {
    signalDisposed = () => resolve(DISPOSED);
  });

  const context = {
    remoteId: options.start.remoteId,
    basename: options.start.basename,
  };

  function track(event: string): void {
    try {
      telemetry.track(event, context);
    } catch {
      // Observability must never change lifecycle behavior.
    }
  }

  function capture(error: unknown, stage: RemoteFailureStage): void {
    try {
      telemetry.captureException(error, {
        ...context,
        lifecycleStage: stage,
      });
    } catch {
      // Observability must never change lifecycle behavior.
    }
  }

  function publish(next: RemoteSessionSnapshot): void {
    if (disposed) {
      return;
    }

    snapshot = next;

    listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        try {
          telemetry.captureException(error, {
            ...context,
            lifecycleStage: 'subscriber',
          });
        } catch {
          // Presentation and observability failures cannot stop orchestration.
        }
      }
    });
  }

  function reportCleanupFailure(error: unknown): void {
    capture(error, 'cleanup');
  }

  function clearContainer(): void {
    try {
      options.start.container.replaceChildren();
    } catch (error) {
      reportCleanupFailure(error);
    }
  }

  function disposeInstance(): void {
    if (!instance || instanceDisposed) {
      return;
    }

    instanceDisposed = true;

    try {
      instance.unmount();
    } catch (error) {
      reportCleanupFailure(error);
    }
  }

  function fail(stage: RemoteFailureStage, error: unknown): void {
    disposeInstance();
    clearContainer();
    bridgeController.dispose();

    const runtimeError =
      error instanceof RemoteRuntimeError
        ? error
        : new RemoteRuntimeError(
            stage,
            `Remote ${options.start.remoteId} failed during ${stage}: ${errorMessage(error)}`,
            error
          );

    capture(runtimeError, stage);
    publish({ status: 'error', error: runtimeError });
  }

  async function waitFor<T>(
    promise: PromiseLike<T>,
    stage: 'load' | 'readiness',
    timeoutMs: number
  ): Promise<T | typeof DISPOSED> {
    let cancelTimeout: () => void = () => undefined;
    const timeout = new Promise<never>((_resolve, reject) => {
      cancelTimeout = clock.schedule(() => {
        reject(
          new RemoteRuntimeError(
            stage,
            `Remote ${options.start.remoteId} ${stage} timed out after ${timeoutMs}ms.`
          )
        );
      }, timeoutMs);
    });

    try {
      return await Promise.race([
        Promise.resolve(promise),
        timeout,
        disposedSignal,
      ]);
    } finally {
      cancelTimeout();
    }
  }

  async function run(): Promise<void> {
    track('runtime_mf.session_started');

    let loaded: unknown;

    try {
      loaded = await waitFor(
        options.adapters.loadRemote(options.start.remoteId),
        'load',
        options.loadTimeoutMs
      );
    } catch (error) {
      fail('load', error);
      return;
    }

    if (loaded === DISPOSED) {
      return;
    }

    publish({ status: 'loading', stage: 'validate' });

    let remoteModule;

    try {
      remoteModule = parseRemoteModule(loaded);
    } catch (error) {
      fail('validate', error);
      return;
    }

    if (disposed) {
      return;
    }

    let mounted: unknown;

    publish({ status: 'loading', stage: 'bootstrap' });

    try {
      mounted = remoteModule.mount({
        container: options.start.container,
        bridge: bridgeController.bridge,
        basename: options.start.basename,
      });
    } catch (error) {
      fail('bootstrap', error);
      return;
    }

    try {
      instance = parseRemoteAppInstance(mounted);
    } catch (error) {
      try {
        cleanupInvalidRemoteInstance(mounted);
      } catch (cleanupError) {
        reportCleanupFailure(cleanupError);
      }
      fail('validate', error);
      return;
    }

    if (disposed) {
      disposeInstance();
      return;
    }

    if (instance.ready) {
      publish({ status: 'loading', stage: 'readiness' });

      let readiness: unknown;

      try {
        readiness = await waitFor(
          instance.ready,
          'readiness',
          options.readinessTimeoutMs
        );
      } catch (error) {
        fail('readiness', error);
        return;
      }

      if (readiness === DISPOSED) {
        return;
      }
    }

    if (disposed) {
      return;
    }

    track('runtime_mf.session_ready');
    publish({ status: 'ready', stage: 'running' });
  }

  const session: RemoteSession = {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      if (disposed) {
        return () => undefined;
      }

      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    updateHostContext(hostContext) {
      if (!disposed) {
        bridgeController.updateHostContext(hostContext);
      }
    },
    dispose() {
      if (disposed) {
        return;
      }

      disposed = true;
      signalDisposed();
      disposeInstance();
      clearContainer();
      bridgeController.dispose();
      listeners.clear();
      track('runtime_mf.session_disposed');
    },
  };

  void run().catch((error: unknown) => {
    fail('bootstrap', error);
  });

  return session;
}

export function createRemoteRuntime(
  options: CreateRemoteRuntimeOptions
): RemoteRuntime {
  const loadTimeoutMs = options.loadTimeoutMs ?? DEFAULT_LOAD_TIMEOUT_MS;
  const readinessTimeoutMs =
    options.readinessTimeoutMs ?? DEFAULT_READINESS_TIMEOUT_MS;

  return {
    start: (start) =>
      createSession({
        start,
        adapters: options.adapters,
        loadTimeoutMs,
        readinessTimeoutMs,
      }),
  };
}

import type { HostTelemetry } from 'demo_remote/mount';

/** Stub sink — contract surface only until Sentry/analytics are wired. */
export function createNoopTelemetry(): HostTelemetry {
  return {
    track() {},
    captureException() {},
    captureMessage() {},
  };
}

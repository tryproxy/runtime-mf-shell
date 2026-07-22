import type { HostTelemetry } from '@platform/runtime-mf-contract';

/** Stub sink — contract surface only until Sentry/analytics are wired. */
export function createNoopTelemetry(): HostTelemetry {
  return {
    track() {},
    captureException() {},
    captureMessage() {},
  };
}

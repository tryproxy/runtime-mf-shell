import type { HostBridge, HostTelemetry } from '@platform/runtime-mf-contract';
import { createContext } from 'react';

export type RemoteRuntimeAdapters = {
  auth: HostBridge['auth'];
  navigation: HostBridge['navigation'];
  telemetry?: HostTelemetry;
};

export const RemoteRuntimeContext = createContext<RemoteRuntimeAdapters | null>(
  null
);

import type { NavManifest } from '@platform/runtime-mf-contract';
import { createContext } from 'react';

export type RemoteNavManifestStatus = 'idle' | 'loading' | 'ready';

export type RemoteNavManifestsState = {
  status: RemoteNavManifestStatus;
  /** Validated manifests keyed by shell module id (`remote`, `remoteAngular`). */
  byModuleId: Partial<Record<string, NavManifest>>;
};

export const RemoteNavManifestsContext = createContext<RemoteNavManifestsState>(
  {
    status: 'idle',
    byModuleId: {},
  }
);

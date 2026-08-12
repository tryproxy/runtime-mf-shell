import type { NavManifest } from '@platform/runtime-mf-contract';
import type { RemoteNavModuleStatus } from '@/app/remote-navigation/remote-nav-contribution-store';
import { createContext } from 'react';

export type RemoteNavManifestsState = {
  /** Validated manifests keyed by shell module id (`remote`, `remoteAngular`, `aso`). */
  byModuleId: Partial<Record<string, NavManifest>>;
  moduleStatus: Partial<Record<string, RemoteNavModuleStatus>>;
  ensureNav: (moduleId: string) => Promise<void>;
  refreshNav: (moduleId: string) => Promise<void>;
};

export const RemoteNavManifestsContext = createContext<RemoteNavManifestsState>(
  {
    byModuleId: {},
    moduleStatus: {},
    ensureNav: async () => undefined,
    refreshNav: async () => undefined,
  }
);

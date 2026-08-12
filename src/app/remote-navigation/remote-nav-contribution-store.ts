import { fetchNavManifest } from '@/app/remote-navigation/fetch-nav-manifest';
import {
  findRemoteNavSource,
  REMOTE_NAV_SOURCES,
} from '@/app/remote-navigation/remote-nav-sources';
import type { NavManifest } from '@platform/runtime-mf-contract';

export type RemoteNavModuleStatus = 'idle' | 'loading' | 'ready' | 'error';

export type RemoteNavModuleEntry = {
  status: RemoteNavModuleStatus;
  manifest?: NavManifest;
  reason?: string;
};

export type RemoteNavContributionSnapshot = {
  modules: Record<string, RemoteNavModuleEntry>;
  /** Validated manifests keyed by shell module id. */
  byModuleId: Partial<Record<string, NavManifest>>;
};

type Listener = () => void;

const listeners = new Set<Listener>();
const inFlight = new Map<string, Promise<void>>();

const modules: Record<string, RemoteNavModuleEntry> = Object.fromEntries(
  REMOTE_NAV_SOURCES.map((source) => [
    source.moduleId,
    { status: 'idle' as const },
  ])
);

function buildSnapshot(): RemoteNavContributionSnapshot {
  const byModuleId: Partial<Record<string, NavManifest>> = {};

  for (const [moduleId, entry] of Object.entries(modules)) {
    if (entry.status === 'ready' && entry.manifest) {
      byModuleId[moduleId] = entry.manifest;
    }
  }

  return { modules: { ...modules }, byModuleId };
}

let snapshot = buildSnapshot();

function emit(): void {
  snapshot = buildSnapshot();
  for (const listener of listeners) {
    listener();
  }
}

function setModuleEntry(moduleId: string, entry: RemoteNavModuleEntry): void {
  modules[moduleId] = entry;
  emit();
}

function startLoad(moduleId: string): Promise<void> {
  const source = findRemoteNavSource(moduleId);

  if (!source) {
    return Promise.resolve();
  }

  const run = (async () => {
    setModuleEntry(moduleId, { status: 'loading' });

    const result = await fetchNavManifest({
      federationEntryUrl: source.federationEntryUrl,
      expectedModuleId: source.moduleId,
    });

    if (result.ok) {
      setModuleEntry(moduleId, {
        status: 'ready',
        manifest: result.manifest,
      });
      return;
    }

    if (result.reason !== 'aborted') {
      console.warn(
        `[nav-manifest] ${source.moduleId} soft-fail (${result.url}): ${result.reason}`
      );
    }

    setModuleEntry(moduleId, {
      status: 'error',
      reason: result.reason,
    });
  })();

  inFlight.set(moduleId, run);

  return run.finally(() => {
    if (inFlight.get(moduleId) === run) {
      inFlight.delete(moduleId);
    }
  });
}

export function getRemoteNavContributionSnapshot(): RemoteNavContributionSnapshot {
  return snapshot;
}

export function subscribeRemoteNavContribution(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Fetch if idle/error, or join an in-flight load. No-op when already ready. */
export function ensureNav(moduleId: string): Promise<void> {
  const pending = inFlight.get(moduleId);
  if (pending) {
    return pending;
  }

  const current = modules[moduleId];
  if (current?.status === 'ready' && current.manifest) {
    return Promise.resolve();
  }

  return startLoad(moduleId);
}

/** Re-fetch even when ready (waits for any in-flight load first). */
export function refreshNav(moduleId: string): Promise<void> {
  const pending = inFlight.get(moduleId);
  if (pending) {
    return pending.then(() => startLoad(moduleId));
  }

  return startLoad(moduleId);
}

/** Boot: ensure every statically configured remote once. */
export function ensureAllRemoteNav(): Promise<void> {
  return Promise.all(
    REMOTE_NAV_SOURCES.map((source) => ensureNav(source.moduleId))
  ).then(() => undefined);
}

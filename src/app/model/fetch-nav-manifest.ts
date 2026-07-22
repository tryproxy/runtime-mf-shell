import type { NavManifest } from '@platform/runtime-mf-contract';
import { navManifestUrlFromRemoteEntry } from '@/app/model/nav-manifest-url';
import { validateNavManifest } from '@/app/model/validate-nav-manifest';

export type FetchNavManifestResult =
  | { ok: true; manifest: NavManifest; url: string }
  | { ok: false; url: string; reason: string };

const DEFAULT_TIMEOUT_MS = 3_000;

function mergeAbortSignals(
  signals: Array<AbortSignal | undefined>
): AbortSignal | undefined {
  const active = signals.filter((signal): signal is AbortSignal =>
    Boolean(signal)
  );

  if (active.length === 0) {
    return undefined;
  }

  if (active.length === 1) {
    return active[0];
  }

  if (typeof AbortSignal.any === 'function') {
    return AbortSignal.any(active);
  }

  const merged = new AbortController();
  for (const signal of active) {
    if (signal.aborted) {
      merged.abort();
      break;
    }
    signal.addEventListener('abort', () => merged.abort(), { once: true });
  }
  return merged.signal;
}

/**
 * Fetch + validate a remote `nav.json`. Soft-fails: never throws.
 * Independent per remote — a dead peer must not block others.
 */
export async function fetchNavManifest(options: {
  remoteEntryUrl: string;
  expectedModuleId: string;
  signal?: AbortSignal;
  /** Fail soft if the remote never answers (default 3s). */
  timeoutMs?: number;
}): Promise<FetchNavManifestResult> {
  let url: string;

  try {
    url = navManifestUrlFromRemoteEntry(options.remoteEntryUrl);
  } catch {
    return {
      ok: false,
      url: options.remoteEntryUrl,
      reason: 'invalid remoteEntry URL',
    };
  }

  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const timeoutController = new AbortController();
  const timeoutId = window.setTimeout(() => {
    timeoutController.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: mergeAbortSignals([options.signal, timeoutController.signal]),
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return {
        ok: false,
        url,
        reason: `HTTP ${response.status}`,
      };
    }

    const data: unknown = await response.json();
    const manifest = validateNavManifest(data, options.expectedModuleId);

    if (!manifest) {
      return {
        ok: false,
        url,
        reason: 'validation failed',
      };
    }

    return { ok: true, manifest, url };
  } catch (error) {
    if (options.signal?.aborted) {
      return { ok: false, url, reason: 'aborted' };
    }

    if (timeoutController.signal.aborted) {
      return { ok: false, url, reason: `timeout after ${timeoutMs}ms` };
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      return { ok: false, url, reason: 'aborted' };
    }

    return {
      ok: false,
      url,
      reason: error instanceof Error ? error.message : 'fetch failed',
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

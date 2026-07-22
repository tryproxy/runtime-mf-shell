import type { NavManifest } from '@platform/runtime-mf-contract';
import { navManifestUrlFromRemoteEntry } from '@/app/model/nav-manifest-url';
import { validateNavManifest } from '@/app/model/validate-nav-manifest';

export type FetchNavManifestResult =
  | { ok: true; manifest: NavManifest; url: string }
  | { ok: false; url: string; reason: string };

/**
 * Fetch + validate a remote `nav.json`. Soft-fails: never throws.
 */
export async function fetchNavManifest(options: {
  remoteEntryUrl: string;
  expectedModuleId: string;
  signal?: AbortSignal;
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

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: options.signal,
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
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { ok: false, url, reason: 'aborted' };
    }

    return {
      ok: false,
      url,
      reason: error instanceof Error ? error.message : 'fetch failed',
    };
  }
}

/**
 * PoC-only: derive `nav.json` from the remoteEntry URL origin.
 * Production must not rely on this — use an explicit manifest URL
 * (registry / Catalog / env) instead of string-deriving from `remoteEntry.js`.
 */
export function navManifestUrlFromRemoteEntry(remoteEntryUrl: string): string {
  const url = new URL(remoteEntryUrl);
  return `${url.origin}/nav.json`;
}

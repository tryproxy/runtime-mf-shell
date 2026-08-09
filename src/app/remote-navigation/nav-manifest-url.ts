/**
 * PoC-only: derive `nav.json` from the federation entry/manifest URL origin.
 * Production must not rely on this — use an explicit manifest URL
 * (registry / Catalog / env) instead of string-deriving from federation delivery.
 */
export function navManifestUrlFromFederationEntry(
  federationEntryUrl: string
): string {
  const url = new URL(federationEntryUrl);
  return `${url.origin}/nav.json`;
}

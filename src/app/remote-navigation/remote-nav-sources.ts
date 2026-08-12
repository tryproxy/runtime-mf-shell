/** Static remote sources for shell-owned nav.json contribution fetches. */

export type RemoteNavSource = {
  moduleId: string;
  federationEntryUrl: string;
};

const DEFAULT_REMOTE_MANIFEST_URL = 'http://localhost:5001/mf-manifest.json';
const DEFAULT_ANGULAR_REMOTE_MANIFEST_URL =
  'http://localhost:5002/mf-manifest.json';
const asoRemoteManifestUrl =
  import.meta.env.VITE_ASO_REMOTE_MANIFEST_URL ||
  'http://localhost:5003/mf-manifest.json';

export const REMOTE_NAV_SOURCES: readonly RemoteNavSource[] = [
  {
    moduleId: 'remote',
    federationEntryUrl:
      import.meta.env.VITE_REMOTE_MANIFEST_URL || DEFAULT_REMOTE_MANIFEST_URL,
  },
  {
    moduleId: 'remoteAngular',
    federationEntryUrl:
      import.meta.env.VITE_ANGULAR_REMOTE_MANIFEST_URL ||
      DEFAULT_ANGULAR_REMOTE_MANIFEST_URL,
  },
  ...(asoRemoteManifestUrl
    ? [
        {
          moduleId: 'aso',
          federationEntryUrl: asoRemoteManifestUrl,
        },
      ]
    : []),
];

export function findRemoteNavSource(
  moduleId: string
): RemoteNavSource | undefined {
  return REMOTE_NAV_SOURCES.find((source) => source.moduleId === moduleId);
}

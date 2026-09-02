import type { HostBridge } from '@platform/runtime-mf-contract';
import { createInstance } from '@module-federation/enhanced/runtime';
import type { RemoteRuntimeAdapters } from '@/remote-runtime';
import {
  getAccessToken,
  getAuthEmail,
  getAuthProvider,
  logoutSession,
  subscribeSession,
} from '@/shared/auth';
import { appRouter } from '@/app/routing/app-router';
import { createRouterNavigation } from '@/app/routing/router-navigation';
import { createRemoteAuthHttp } from './remote-auth-policy';

type HostSession = NonNullable<ReturnType<HostBridge['auth']['getSnapshot']>>;

let authSnapshot: HostSession | null = null;
let authSnapshotAccessToken: string | null = null;
let authSnapshotEmail: string | null = null;

function getAuthSnapshot(): HostSession | null {
  const accessToken = getAccessToken();
  const email = getAuthEmail();

  if (!accessToken) {
    authSnapshot = null;
    authSnapshotAccessToken = null;
    authSnapshotEmail = null;
    return authSnapshot;
  }

  if (
    authSnapshot &&
    authSnapshotAccessToken === accessToken &&
    authSnapshotEmail === email
  ) {
    return authSnapshot;
  }

  authSnapshotAccessToken = accessToken;
  authSnapshotEmail = email;
  authSnapshot = {
    userId: email ?? 'user',
    displayName: email ?? undefined,
    roles: [],
  };
  return authSnapshot;
}

const authSession: Omit<HostBridge['auth'], 'http'> = {
  getSnapshot: getAuthSnapshot,
  subscribe: subscribeSession,
  async signOut() {
    await logoutSession();
    await appRouter.navigate('/login', { replace: true });
  },
};

function createAuthForRemote(remoteId: string): HostBridge['auth'] {
  return {
    ...authSession,
    http: createRemoteAuthHttp(remoteId, {
      getAuthProvider,
      getStoredAccessToken: getAccessToken,
    }),
  };
}

const remoteRequests: Record<string, string> = {
  remote: 'demo_remote/mount',
  remoteAngular: 'angular_remote/mount',
  aso: 'aso_remote/mount',
  zeywin: 'zeywin_remote/mount',
};

const asoRemoteManifestUrl =
  import.meta.env.VITE_ASO_REMOTE_MANIFEST_URL ||
  'http://localhost:5003/mf-manifest.json';

const zeywinRemoteManifestUrl = readFederationManifestUrl(
  import.meta.env.VITE_ZEYWIN_REMOTE_MANIFEST_URL
);

function readFederationManifestUrl(
  value: string | undefined
): string | undefined {
  const entry = value?.trim();
  if (!entry) {
    return undefined;
  }

  try {
    const url = new URL(entry);
    if (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      url.hostname.length > 0
    ) {
      return entry;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

function unwrapFederationModule(value: unknown): unknown {
  if (typeof value !== 'object' || value === null || 'mount' in value) {
    return value;
  }

  return 'default' in value ? Reflect.get(value, 'default') : value;
}

const federationRuntime = createInstance({
  name: 'runtime_mf_shell',
  remotes: [
    {
      name: 'runtime_mf_module',
      alias: 'demo_remote',
      entry:
        import.meta.env.VITE_REMOTE_MANIFEST_URL ||
        'http://localhost:5001/mf-manifest.json',
    },
    {
      name: 'runtime_mf_module_angular',
      alias: 'angular_remote',
      entry:
        import.meta.env.VITE_ANGULAR_REMOTE_MANIFEST_URL ||
        'http://localhost:5002/mf-manifest.json',
    },
    {
      name: 'aso_market_admin',
      alias: 'aso_remote',
      entry: asoRemoteManifestUrl,
    },
    ...(zeywinRemoteManifestUrl
      ? [
          {
            name: 'zeywin_app',
            alias: 'zeywin_remote',
            entry: zeywinRemoteManifestUrl,
          },
        ]
      : []),
  ],
});

export const shellRemoteRuntimeAdapters = {
  loadRemote(remoteId: string) {
    const request = remoteRequests[remoteId];

    if (!request) {
      return Promise.reject(
        new Error(`No federation request is configured for ${remoteId}.`)
      );
    }

    return federationRuntime.loadRemote(request).then(unwrapFederationModule);
  },
  createAuthForRemote,
  navigation: createRouterNavigation(appRouter),
} satisfies RemoteRuntimeAdapters;

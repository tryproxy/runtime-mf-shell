import type { HostBridge } from '@platform/runtime-mf-contract';
import { createInstance } from '@module-federation/enhanced/runtime';
import type { RemoteRuntimeAdapters } from '@/remote-runtime';
import { getAccessToken, getAuthEmail, subscribeSession } from '@/shared/auth';
import { appRouter } from '@/app/routing/app-router';
import { createRouterNavigation } from '@/app/routing/router-navigation';

const auth: HostBridge['auth'] = {
  getSnapshot: () => {
    const accessToken = getAccessToken();
    const email = getAuthEmail();

    if (!accessToken) {
      return null;
    }

    return {
      userId: email ?? 'user',
      displayName: email ?? undefined,
      roles: [],
    };
  },
  subscribe: subscribeSession,
  http: {
    mode: 'bearer',
    getAccessToken: async () => getAccessToken(),
  },
};

const remoteRequests: Record<string, string> = {
  remote: 'demo_remote/mount',
  remoteAngular: 'angular_remote/mount',
};

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
  ],
});

export const remoteRuntimeAdapters = {
  loadRemote(remoteId: string) {
    const request = remoteRequests[remoteId];

    if (!request) {
      return Promise.reject(
        new Error(`No federation request is configured for ${remoteId}.`)
      );
    }

    return federationRuntime.loadRemote(request).then(unwrapFederationModule);
  },
  auth,
  navigation: createRouterNavigation(appRouter),
} satisfies RemoteRuntimeAdapters;

import type { HostBridge } from '@platform/runtime-mf-contract';
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

const remoteLoaders: Record<string, () => Promise<unknown>> = {
  remote: () => import('demo_remote/mount'),
  remoteAngular: () => import('angular_remote/mount'),
};

export const remoteRuntimeAdapters = {
  loadRemote(remoteId: string) {
    const loader = remoteLoaders[remoteId];

    if (!loader) {
      return Promise.reject(
        new Error(`No remote loader is configured for ${remoteId}.`)
      );
    }

    return loader();
  },
  auth,
  navigation: createRouterNavigation(appRouter),
} satisfies RemoteRuntimeAdapters;

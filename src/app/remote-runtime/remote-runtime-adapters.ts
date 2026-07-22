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

export const remoteRuntimeAdapters = {
  auth,
  navigation: createRouterNavigation(appRouter),
} satisfies RemoteRuntimeAdapters;

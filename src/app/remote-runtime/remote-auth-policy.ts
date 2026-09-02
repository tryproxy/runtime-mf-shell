import type { HostBridge } from '@platform/runtime-mf-contract';
import type { AuthProvider } from '@/shared/auth';

type RemoteAuthPolicyId = 'none' | 'legacy-aso-bearer' | 'legacy-custom-bearer';

type RemoteAuthPolicyDependencies = {
  getAuthProvider(): AuthProvider | null;
  getStoredAccessToken(): string | null;
};

const remoteAuthPolicyByRemoteId = new Map<string, RemoteAuthPolicyId>([
  ['aso', 'legacy-aso-bearer'],
  ['remote', 'legacy-custom-bearer'],
  ['remoteAngular', 'legacy-custom-bearer'],
]);

function resolveRemoteAuthPolicy(remoteId: string): RemoteAuthPolicyId {
  return remoteAuthPolicyByRemoteId.get(remoteId) ?? 'none';
}

function bearerForProvider(
  provider: AuthProvider,
  dependencies: RemoteAuthPolicyDependencies
): HostBridge['auth']['http'] {
  return {
    mode: 'bearer',
    getAccessToken: async () =>
      dependencies.getAuthProvider() === provider
        ? dependencies.getStoredAccessToken()
        : null,
  };
}

export function createRemoteAuthHttp(
  remoteId: string,
  dependencies: RemoteAuthPolicyDependencies
): HostBridge['auth']['http'] {
  switch (resolveRemoteAuthPolicy(remoteId)) {
    case 'legacy-aso-bearer':
      return bearerForProvider('aso', dependencies);
    case 'legacy-custom-bearer':
      return bearerForProvider('custom', dependencies);
    case 'none':
      return {
        mode: 'bearer',
        getAccessToken: async () => null,
      };
  }
}

import type { HostBridge } from '@platform/runtime-mf-contract';

type RemoteAuthPolicyId = 'none' | 'legacy-aso-bearer';

type RemoteAuthPolicyDependencies = {
  getLegacyAsoAccessToken(): string | null;
};

const remoteAuthPolicyByRemoteId = new Map<string, RemoteAuthPolicyId>([
  ['aso', 'legacy-aso-bearer'],
]);

function resolveRemoteAuthPolicy(remoteId: string): RemoteAuthPolicyId {
  return remoteAuthPolicyByRemoteId.get(remoteId) ?? 'none';
}

export function createRemoteAuthHttp(
  remoteId: string,
  dependencies: RemoteAuthPolicyDependencies
): HostBridge['auth']['http'] {
  switch (resolveRemoteAuthPolicy(remoteId)) {
    case 'legacy-aso-bearer':
      return {
        mode: 'bearer',
        getAccessToken: async () => dependencies.getLegacyAsoAccessToken(),
      };
    case 'none':
      return {
        mode: 'bearer',
        getAccessToken: async () => null,
      };
  }
}

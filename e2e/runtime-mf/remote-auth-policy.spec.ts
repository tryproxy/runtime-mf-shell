import { expect, test } from '@playwright/test';
import type { HostBridge } from '@platform/runtime-mf-contract';
import { createRemoteAuthHttp } from '../../src/app/remote-runtime/remote-auth-policy';

function getBearerAccessToken(
  http: HostBridge['auth']['http']
): Promise<string | null> {
  expect(http.mode).toBe('bearer');
  if (http.mode !== 'bearer' || !http.getAccessToken) {
    throw new Error('Expected a bearer policy with a token getter.');
  }
  return http.getAccessToken();
}

test.describe('remote auth policy', () => {
  test('passes the legacy ASO bearer only to the ASO remote', async () => {
    const getLegacyAsoAccessToken = () => 'aso-access-token';
    const getAuthProvider = () => 'aso' as const;

    const http = createRemoteAuthHttp('aso', {
      getAuthProvider,
      getLegacyAsoAccessToken,
    });

    await expect(getBearerAccessToken(http)).resolves.toBe('aso-access-token');
  });

  test('does not expose a custom credential to the ASO remote', async () => {
    let accessTokenReads = 0;
    const getLegacyAsoAccessToken = () => {
      accessTokenReads += 1;
      return 'custom-access-token';
    };

    const http = createRemoteAuthHttp('aso', {
      getAuthProvider: () => 'custom',
      getLegacyAsoAccessToken,
    });

    await expect(getBearerAccessToken(http)).resolves.toBeNull();
    expect(accessTokenReads).toBe(0);
  });

  test('gives unknown remotes no credential and does not read the ASO token', async () => {
    let accessTokenReads = 0;
    const getLegacyAsoAccessToken = () => {
      accessTokenReads += 1;
      return 'aso-access-token';
    };

    const http = createRemoteAuthHttp('future-product', {
      getAuthProvider: () => 'aso',
      getLegacyAsoAccessToken,
    });

    await expect(getBearerAccessToken(http)).resolves.toBeNull();
    expect(accessTokenReads).toBe(0);
  });
});

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
    const getStoredAccessToken = () => 'aso-access-token';
    const getAuthProvider = () => 'aso' as const;

    const http = createRemoteAuthHttp('aso', {
      getAuthProvider,
      getStoredAccessToken,
    });

    await expect(getBearerAccessToken(http)).resolves.toBe('aso-access-token');
  });

  test('does not expose a custom credential to the ASO remote', async () => {
    let accessTokenReads = 0;
    const getStoredAccessToken = () => {
      accessTokenReads += 1;
      return 'custom-access-token';
    };

    const http = createRemoteAuthHttp('aso', {
      getAuthProvider: () => 'custom',
      getStoredAccessToken,
    });

    await expect(getBearerAccessToken(http)).resolves.toBeNull();
    expect(accessTokenReads).toBe(0);
  });

  test('passes the custom bearer to mapped demo remotes', async () => {
    const getStoredAccessToken = () => 'custom-access-token';

    await expect(
      getBearerAccessToken(
        createRemoteAuthHttp('remote', {
          getAuthProvider: () => 'custom',
          getStoredAccessToken,
        })
      )
    ).resolves.toBe('custom-access-token');
    await expect(
      getBearerAccessToken(
        createRemoteAuthHttp('remoteAngular', {
          getAuthProvider: () => 'custom',
          getStoredAccessToken,
        })
      )
    ).resolves.toBe('custom-access-token');
  });

  test('does not expose an ASO credential to demo remotes', async () => {
    let accessTokenReads = 0;
    const getStoredAccessToken = () => {
      accessTokenReads += 1;
      return 'aso-access-token';
    };

    await expect(
      getBearerAccessToken(
        createRemoteAuthHttp('remote', {
          getAuthProvider: () => 'aso',
          getStoredAccessToken,
        })
      )
    ).resolves.toBeNull();
    expect(accessTokenReads).toBe(0);
  });

  test('gives unknown remotes no credential and does not read the stored token', async () => {
    let accessTokenReads = 0;
    const getStoredAccessToken = () => {
      accessTokenReads += 1;
      return 'aso-access-token';
    };

    const http = createRemoteAuthHttp('future-product', {
      getAuthProvider: () => 'aso',
      getStoredAccessToken,
    });

    await expect(getBearerAccessToken(http)).resolves.toBeNull();
    expect(accessTokenReads).toBe(0);
  });
});

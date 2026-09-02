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

    const http = createRemoteAuthHttp('aso', { getLegacyAsoAccessToken });

    await expect(getBearerAccessToken(http)).resolves.toBe('aso-access-token');
  });

  test('gives unknown remotes no credential and does not read the ASO token', async () => {
    let accessTokenReads = 0;
    const getLegacyAsoAccessToken = () => {
      accessTokenReads += 1;
      return 'aso-access-token';
    };

    const http = createRemoteAuthHttp('future-product', {
      getLegacyAsoAccessToken,
    });

    await expect(getBearerAccessToken(http)).resolves.toBeNull();
    expect(accessTokenReads).toBe(0);
  });
});

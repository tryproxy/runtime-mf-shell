import { expect, test } from '../fixtures/runtime-mf';

test.describe('shell session', () => {
  test('custom logout clears the local session when its API notification fails', async ({
    page,
  }) => {
    let logoutRequests = 0;
    await page.route('**/v1/auth/logout', (route) => {
      logoutRequests += 1;
      return route.abort('failed');
    });
    await page.goto('/host');
    await page.evaluate(() =>
      window.localStorage.setItem('rmf-auth-provider', 'custom')
    );

    await expect
      .poll(() =>
        page.evaluate(() => window.localStorage.getItem('rmf-access-token'))
      )
      .not.toBeNull();

    await page
      .getByRole('button', { name: 'Log out', exact: true })
      .first()
      .click();

    await expect(page).toHaveURL(/\/login\/?$/);
    await expect
      .poll(() =>
        page.evaluate(() => window.localStorage.getItem('rmf-access-token'))
      )
      .toBeNull();
    await expect
      .poll(() =>
        page.evaluate(() => window.localStorage.getItem('rmf-auth-provider'))
      )
      .toBeNull();
    await expect.poll(() => logoutRequests).toBe(1);
  });

  test('ASO logout does not call the custom backend logout endpoint', async ({
    page,
  }) => {
    let logoutRequests = 0;
    await page.route('**/v1/auth/logout', (route) => {
      logoutRequests += 1;
      return route.fulfill({ status: 204 });
    });
    await page.goto('/host');

    await page
      .getByRole('button', { name: 'Log out', exact: true })
      .first()
      .click();

    await expect(page).toHaveURL(/\/login\/?$/);
    await expect
      .poll(() =>
        page.evaluate(() => window.localStorage.getItem('rmf-auth-provider'))
      )
      .toBeNull();
    expect(logoutRequests).toBe(0);
  });
});

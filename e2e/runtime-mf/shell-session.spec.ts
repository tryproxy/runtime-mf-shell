import { expect, test } from '../fixtures/runtime-mf';

test.describe('shell session', () => {
  test('logout clears the local session when the API notification fails', async ({
    page,
  }) => {
    await page.route('**/v1/auth/logout', (route) => route.abort('failed'));
    await page.goto('/host');

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
  });
});

import { expect, test } from '@playwright/test';

test.describe('login provider selector', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/host');
    await page.evaluate(() => window.localStorage.clear());
    await page.goto('/login');
  });

  test('signs in through the replaceable custom backend adapter', async ({
    page,
  }) => {
    await expect(page.getByRole('tab', { name: 'ASO Pilot' })).toHaveAttribute(
      'aria-selected',
      'true'
    );

    await page.getByRole('tab', { name: 'Custom' }).click();
    await expect(page.getByRole('tab', { name: 'Custom' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(page.getByLabel('ASO access token')).toBeHidden();
    await expect(page.getByPlaceholder('user@mail.com')).toBeVisible();
    await expect(page.getByPlaceholder('1Qwe-rty')).toBeVisible();

    await page.route('**/v1/auth/login', async (route) => {
      expect(route.request().postDataJSON()).toEqual({
        email: 'custom@example.com',
        password: 'custom-password',
      });
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ accessToken: 'custom-access-token' }),
      });
    });

    await page.getByLabel('Email').fill('custom@example.com');
    await page.getByLabel('Password', { exact: true }).fill('custom-password');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    await expect(page).toHaveURL(/\/host\/?$/);
    await expect
      .poll(() =>
        page.evaluate(() => ({
          accessToken: window.localStorage.getItem('rmf-access-token'),
          email: window.localStorage.getItem('rmf-auth-email'),
          provider: window.localStorage.getItem('rmf-auth-provider'),
        }))
      )
      .toEqual({
        accessToken: 'custom-access-token',
        email: 'custom@example.com',
        provider: 'custom',
      });
  });

  test('signs in through Custom as the configured test user', async ({
    page,
  }) => {
    await page.getByRole('tab', { name: 'Custom' }).click();

    await page.route('**/v1/auth/login', async (route) => {
      expect(route.request().postDataJSON()).toEqual({
        email: 'user@mail.com',
        password: '1Qwe-rty',
      });
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ accessToken: 'custom-test-user-token' }),
      });
    });

    await page.getByRole('button', { name: 'Log in as test user' }).click();

    await expect(page).toHaveURL(/\/host\/?$/);
    await expect
      .poll(() =>
        page.evaluate(() => ({
          accessToken: window.localStorage.getItem('rmf-access-token'),
          email: window.localStorage.getItem('rmf-auth-email'),
          provider: window.localStorage.getItem('rmf-auth-provider'),
        }))
      )
      .toEqual({
        accessToken: 'custom-test-user-token',
        email: 'user@mail.com',
        provider: 'custom',
      });
  });

  test('does not carry an ASO validation error into the custom tab', async ({
    page,
  }) => {
    await page
      .getByRole('button', { name: 'Sign in with access token' })
      .click();
    await expect(
      page.getByText('Paste an ASO access token to continue.')
    ).toBeVisible();

    await page.getByRole('tab', { name: 'Custom' }).click();

    await expect(
      page.getByText('Paste an ASO access token to continue.')
    ).toBeHidden();
  });

  test('does not copy custom credentials into the ASO tab', async ({
    page,
  }) => {
    await page.getByRole('tab', { name: 'Custom' }).click();
    await page.getByLabel('Email').fill('custom@example.com');
    await page.getByRole('tab', { name: 'ASO Pilot' }).click();
    await expect(page.getByLabel('Email')).toHaveValue('');
  });
});

import { expect, test as setup } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { AUTH_STATE_PATH, readE2eAuth } from '../env';

setup('authenticate through the shell login UI', async ({ page }) => {
  const auth = readE2eAuth();

  await page.goto('/login');
  await expect(
    page.getByRole('button', { name: 'Sign in with access token' })
  ).toBeVisible();

  if (auth.kind === 'token') {
    await page.getByLabel('ASO access token').fill(auth.token);
    await page
      .getByRole('button', { name: 'Sign in with access token' })
      .click();
  } else {
    await page.getByLabel('Email').fill(auth.email);
    await page.getByLabel('Password').fill(auth.password);
    await page.getByRole('button', { name: 'Sign in to ASO' }).click();
  }

  await page.waitForURL((url) => url.pathname !== '/login', {
    timeout: 20_000,
  });

  fs.mkdirSync(path.dirname(AUTH_STATE_PATH), { recursive: true });
  await page.context().storageState({ path: AUTH_STATE_PATH });
});

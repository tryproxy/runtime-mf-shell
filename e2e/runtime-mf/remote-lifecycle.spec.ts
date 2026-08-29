import { expect, test } from '../fixtures/runtime-mf';

test.describe('remote lifecycle', () => {
  test('shell opens the registered React remote and it becomes usable', async ({
    openRemote,
    page,
    target,
  }) => {
    await openRemote();

    await expect(
      page.getByRole('heading', { name: target.readyHeading, level: 3 })
    ).toBeVisible();
    await expect(page.getByText('PLATFORM').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();
  });

  test('leaving the remote and returning creates a clean mount', async ({
    openRemote,
    page,
    sessionStarts,
    target,
  }) => {
    await openRemote();
    const afterFirst = await sessionStarts(target.remoteId);
    expect(afterFirst).toBeGreaterThan(0);

    await page.goto('/host');
    await expect(
      page.getByRole('heading', { name: 'Host page' })
    ).toBeVisible();

    await openRemote();
    await expect(
      page.getByRole('heading', { name: target.readyHeading, level: 3 })
    ).toBeVisible();

    const afterReturn = await sessionStarts(target.remoteId);
    expect(afterReturn).toBeGreaterThan(afterFirst);
  });

  test('a remote render failure stays inside the slot', async ({
    openRemote,
    page,
    target,
  }) => {
    test.skip(
      target.crashPath === null,
      'E2E_REMOTE_CRASH_PATH is empty; demo crash surface is not targeted'
    );

    await openRemote(target.crashPath ?? undefined);
    await page.getByRole('button', { name: 'Crash module render' }).click();

    const remoteAlert = page.getByRole('alert');
    await expect(remoteAlert).toContainText(
      'Something went wrong in this module'
    );
    await expect(remoteAlert).toContainText(
      'PoC crash: intentional module render error'
    );
    await expect(page.getByText('PLATFORM').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Something went wrong in the shell' })
    ).toHaveCount(0);
  });

  test('shell theme and locale reach the remote without replacing chrome', async ({
    openRemote,
    page,
    sessionStarts,
    target,
  }) => {
    await openRemote();
    const startsBefore = await sessionStarts(target.remoteId);

    const themeBefore = await page.evaluate(
      () => document.documentElement.dataset.rmfTheme ?? ''
    );
    await page.getByRole('button', { name: /Dark|Light/ }).click();
    await expect
      .poll(async () =>
        page.evaluate(() => document.documentElement.dataset.rmfTheme ?? '')
      )
      .not.toBe(themeBefore);

    await expect(page).toHaveURL(new RegExp(`${target.indexPath}/?$`));
    await expect(
      page.getByRole('heading', { name: target.readyHeading, level: 3 })
    ).toBeVisible();
    await expect(page.getByText('PLATFORM').first()).toBeVisible();

    await page.getByLabel('Language').click();
    await page.getByRole('option', { name: 'RU' }).click();
    await expect(
      page.getByRole('heading', { name: target.readyHeading, level: 3 })
    ).toHaveCount(0);
    await expect(
      page.locator(`[data-rmf-slot="${target.remoteId}"] h3`).first()
    ).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${target.indexPath}/?$`));

    const startsAfter = await sessionStarts(target.remoteId);
    expect(startsAfter).toBe(startsBefore);
  });
});

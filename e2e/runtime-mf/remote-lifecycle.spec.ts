import {
  expect,
  readRemoteThemeAppearance,
  test,
  waitForRemoteReady,
} from '../fixtures/runtime-mf';

test.describe('remote lifecycle', () => {
  test('shell opens the registered React remote and it becomes usable', async ({
    openRemote,
    page,
    target,
  }) => {
    await openRemote();

    await expect(
      page.getByRole('heading', { name: target.readyHeading, exact: true })
    ).toBeVisible();
    await expect(page.getByText('PLATFORM').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log out' })).toBeVisible();
  });

  test('one retry restores the remote and its navigation after its origin recovers', async ({
    page,
    target,
  }) => {
    const remotePort = new URL(target.remoteDevUrl).port;
    let originRecovered = false;
    let failedRequests = 0;

    await page.route(
      (url) => url.port === remotePort,
      async (route) => {
        if (!originRecovered) {
          failedRequests += 1;
          await route.abort('failed');
          return;
        }

        await route.continue();
      }
    );

    await page.goto(target.indexPath);
    await expect(
      page.locator(
        `[data-rmf-slot="${target.remoteId}"][data-rmf-slot-status="error"]`
      )
    ).toBeVisible({ timeout: 15_000 });

    originRecovered = true;
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await waitForRemoteReady(page, target);

    expect(failedRequests).toBeGreaterThan(0);
    await expect(
      page.getByRole('navigation', { name: 'Module pages' })
    ).toBeVisible({ timeout: 3_000 });
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
      page.getByRole('heading', { name: target.readyHeading, exact: true })
    ).toBeVisible();

    const afterReturn = await sessionStarts(target.remoteId);
    expect(afterReturn).toBeGreaterThan(afterFirst);
  });

  test('a remote render failure stays inside the slot', async ({
    openRemote,
    page,
    target,
  }) => {
    if (target.crashPath === null) {
      test.skip(
        true,
        'E2E_REMOTE_CRASH_PATH is empty; crash surface is not targeted'
      );
      return;
    }

    await openRemote(target.crashPath);
    await page.getByRole('button', { name: target.crashControlLabel }).click();

    const remoteAlert = page.getByRole('alert');
    await expect(remoteAlert).toContainText(target.crashErrorTitle);
    await expect(remoteAlert).toContainText(target.crashErrorDetail);
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
    const themeBefore = await readRemoteThemeAppearance(page);

    expect(themeBefore.mountRootTheme).toBe(themeBefore.documentTheme);
    expect(themeBefore.mountRootIsDark).toBe(themeBefore.documentIsDark);
    expect(themeBefore.documentIsDark).toBe(
      themeBefore.documentTheme === 'dark'
    );

    await page.getByRole('button', { name: /Dark|Light/ }).click();
    await expect
      .poll(async () => {
        const next = await readRemoteThemeAppearance(page);
        return next.documentTheme === themeBefore.documentTheme ||
          next.mountRootTheme !== next.documentTheme
          ? null
          : next.documentTheme;
      })
      .not.toBeNull();

    const themeAfter = await readRemoteThemeAppearance(page);
    expect(themeAfter.documentTheme).not.toBe(themeBefore.documentTheme);
    expect(themeAfter.mountRootTheme).toBe(themeAfter.documentTheme);
    expect(themeAfter.mountRootIsDark).toBe(themeAfter.documentIsDark);
    expect(themeAfter.documentIsDark).toBe(themeAfter.documentTheme === 'dark');
    expect(themeAfter.mountRootIsDark).toBe(
      themeAfter.mountRootTheme === 'dark'
    );

    await expect(page).toHaveURL(new RegExp(`${target.indexPath}/?$`));
    await expect(
      page.getByRole('heading', { name: target.readyHeading, exact: true })
    ).toBeVisible();
    await expect(page.getByText('PLATFORM').first()).toBeVisible();

    await page.getByLabel('Language').click();
    await page.getByRole('option', { name: 'RU' }).click();
    await expect(
      page.getByRole('heading', { name: target.readyHeading, exact: true })
    ).toHaveCount(0);
    await expect(
      page
        .locator(`[data-rmf-slot="${target.remoteId}"]`)
        .getByRole('heading')
        .first()
    ).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${target.indexPath}/?$`));

    const startsAfter = await sessionStarts(target.remoteId);
    expect(startsAfter).toBe(startsBefore);
  });
});

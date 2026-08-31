import { expect, test, waitForRemoteReady } from '../fixtures/runtime-mf';

test.describe('remote navigation', () => {
  test('shell shows child pages from remote nav.json', async ({
    openRemote,
    page,
    target,
  }) => {
    await openRemote();

    const pagesNav = page.getByRole('navigation', { name: 'Module pages' });
    await expect(pagesNav).toBeVisible({ timeout: 15_000 });
    await expect(
      pagesNav.getByRole('link', { name: target.indexNavLabel })
    ).toBeVisible();
    await expect(
      pagesNav.getByRole('link', { name: target.childNavLabel })
    ).toBeVisible();
  });

  test('index and child deep links work on navigation and reload', async ({
    openRemote,
    page,
    target,
  }) => {
    await openRemote(target.indexPath);
    await expect(
      page.getByRole('heading', { name: target.readyHeading, exact: true })
    ).toBeVisible();

    await page.reload();
    await waitForRemoteReady(page, target);
    await expect(
      page.getByRole('heading', { name: target.readyHeading, exact: true })
    ).toBeVisible();

    await openRemote(target.childPath);
    await expect(
      page.getByRole('heading', { name: target.childHeading, exact: true })
    ).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${target.childPath}/?$`));

    await page.reload();
    await waitForRemoteReady(page, target);
    await expect(
      page.getByRole('heading', { name: target.childHeading, exact: true })
    ).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${target.childPath}/?$`));
  });

  test('browser back and forward stay below the shell-owned basename', async ({
    openRemote,
    page,
    target,
  }) => {
    await openRemote(target.indexPath);
    await openRemote(target.childPath);
    await expect(page).toHaveURL(new RegExp(`${target.childPath}/?$`));

    await page.goBack();
    await expect(page).toHaveURL(new RegExp(`${target.indexPath}/?$`));
    expect(new URL(page.url()).pathname.startsWith(target.remotePath)).toBe(
      true
    );

    await page.goForward();
    await expect(page).toHaveURL(new RegExp(`${target.childPath}/?$`));
    expect(new URL(page.url()).pathname.startsWith(target.remotePath)).toBe(
      true
    );
  });
});

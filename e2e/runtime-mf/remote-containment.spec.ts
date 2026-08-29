import { expect, test } from '../fixtures/runtime-mf';

test.describe('remote containment', () => {
  test('shell chrome metrics stay stable across mount and unmount', async ({
    captureChrome,
    openRemote,
    page,
  }) => {
    await page.goto('/host');
    await expect(
      page.getByRole('heading', { name: 'Host page' })
    ).toBeVisible();
    const before = await captureChrome();
    expect(before.sidebarWidth).toBeGreaterThan(0);
    expect(before.headerHeight).toBeGreaterThan(0);

    await openRemote();
    const mounted = await captureChrome();
    expect(mounted.htmlOverflow).toBe(before.htmlOverflow);
    expect(mounted.bodyOverflow).toBe(before.bodyOverflow);
    expect(mounted.htmlFontFamily).toBe(before.htmlFontFamily);
    expect(mounted.sidebarWidth).toBe(before.sidebarWidth);
    expect(mounted.headerHeight).toBe(before.headerHeight);

    await page.goto('/host');
    await expect(
      page.getByRole('heading', { name: 'Host page' })
    ).toBeVisible();
    const after = await captureChrome();
    expect(after.htmlOverflow).toBe(before.htmlOverflow);
    expect(after.bodyOverflow).toBe(before.bodyOverflow);
    expect(after.htmlFontFamily).toBe(before.htmlFontFamily);
    expect(after.sidebarWidth).toBe(before.sidebarWidth);
    expect(after.headerHeight).toBe(before.headerHeight);
  });

  test('opening and closing a portaled select leaves no overlay', async ({
    assertNoOrphanedPortals,
    openRemote,
    page,
    target,
  }) => {
    test.skip(
      target.formPath === null,
      'E2E_REMOTE_FORM_PATH is empty; demo form surface is not targeted'
    );

    await openRemote(target.formPath ?? undefined);
    await page.getByLabel('Team').click();
    await expect(page.getByRole('option', { name: 'Platform' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('option', { name: 'Platform' })).toHaveCount(0);
    await assertNoOrphanedPortals();
  });

  test('forced unmount while a portal is open leaves no overlay', async ({
    assertNoOrphanedPortals,
    openRemote,
    page,
    target,
  }) => {
    test.skip(
      target.formPath === null,
      'E2E_REMOTE_FORM_PATH is empty; demo form surface is not targeted'
    );

    await openRemote(target.formPath ?? undefined);
    await page.getByLabel('Team').click();
    await expect(page.getByRole('option', { name: 'Platform' })).toBeVisible();

    await page.goto('/host');
    await expect(
      page.getByRole('heading', { name: 'Host page' })
    ).toBeVisible();
    await assertNoOrphanedPortals();
  });
});

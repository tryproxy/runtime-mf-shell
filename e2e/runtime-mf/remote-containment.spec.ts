import { expect, test } from '../fixtures/runtime-mf';

test.describe('remote containment', () => {
  test('shell chrome metrics stay stable across mount and unmount', async ({
    captureShellChromeMetrics,
    openRemote,
    page,
  }) => {
    await page.goto('/host');
    await expect(
      page.getByRole('heading', { name: 'Host page' })
    ).toBeVisible();
    const before = await captureShellChromeMetrics();
    expect(before.sidebarWidth).toBeGreaterThan(0);
    expect(before.headerHeight).toBeGreaterThan(0);

    await openRemote();
    const mounted = await captureShellChromeMetrics();
    expect(mounted.theme).toBe(before.theme);
    expect(mounted.htmlHasDarkClass).toBe(before.htmlHasDarkClass);
    expect(mounted.htmlOverflow).toBe(before.htmlOverflow);
    expect(mounted.bodyOverflow).toBe(before.bodyOverflow);
    expect(mounted.htmlFontFamily).toBe(before.htmlFontFamily);
    expect(mounted.sidebarWidth).toBe(before.sidebarWidth);
    expect(mounted.headerHeight).toBe(before.headerHeight);

    await page.goto('/host');
    await expect(
      page.getByRole('heading', { name: 'Host page' })
    ).toBeVisible();
    const after = await captureShellChromeMetrics();
    expect(after.theme).toBe(before.theme);
    expect(after.htmlHasDarkClass).toBe(before.htmlHasDarkClass);
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
    if (target.formPath === null) {
      test.skip(
        true,
        'E2E_REMOTE_FORM_PATH is empty; form surface is not targeted'
      );
      return;
    }

    await openRemote(target.formPath);
    await page.getByLabel(target.formSelectLabel).click();
    await expect(
      page.getByRole('option', { name: target.formSelectOption })
    ).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(
      page.getByRole('option', { name: target.formSelectOption })
    ).toHaveCount(0);
    await assertNoOrphanedPortals();
  });

  test('forced unmount while a portal is open leaves no overlay', async ({
    assertNoOrphanedPortals,
    openRemote,
    page,
    target,
  }) => {
    if (target.formPath === null) {
      test.skip(
        true,
        'E2E_REMOTE_FORM_PATH is empty; form surface is not targeted'
      );
      return;
    }

    await openRemote(target.formPath);
    await page.getByLabel(target.formSelectLabel).click();
    await expect(
      page.getByRole('option', { name: target.formSelectOption })
    ).toBeVisible();

    await page.goto('/host');
    await expect(
      page.getByRole('heading', { name: 'Host page' })
    ).toBeVisible();
    await assertNoOrphanedPortals();
  });
});

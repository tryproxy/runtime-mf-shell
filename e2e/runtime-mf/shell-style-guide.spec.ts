import { expect, test } from '../fixtures/runtime-mf';

test.describe('shell style guide', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('select first-open, overlays, and toasts stay aligned', async ({
    assertNoOrphanedPortals,
    page,
  }) => {
    await page.goto('/host/style-guide');
    await expect(
      page.getByRole('button', { name: 'Destructive' })
    ).toBeVisible();
    await expect(
      page.getByRole('checkbox', { name: 'Subscribe' })
    ).toBeVisible();
    await expect(
      page.getByRole('switch', { name: 'Notifications' })
    ).toBeVisible();
    await expect(
      page.getByText('--rmf-color-page', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText('--rmf-font-sans', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByRole('textbox', { name: 'Notes', exact: true })
    ).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Draft' })).toHaveCount(1);
    await expect(
      page.getByRole('radio', { name: 'Plan disabled' })
    ).toBeDisabled();
    await expect(
      page.getByRole('textbox', { name: 'Name invalid', exact: true })
    ).toHaveAttribute('aria-invalid', 'true');
    await expect(
      page.getByRole('button', { name: 'Save example', exact: true })
    ).toHaveAttribute('aria-busy', 'true');
    await expect(page.locator('[data-slot="badge"]')).toHaveCount(4);

    const trigger = page.getByRole('combobox', { name: 'State', exact: true });
    const triggerBox = await trigger.boundingBox();
    expect(triggerBox, 'state select trigger bounds').not.toBeNull();

    await trigger.click();
    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();
    const listBox = await listbox.boundingBox();
    expect(listBox, 'state select listbox bounds').not.toBeNull();
    expect(
      Math.abs((listBox?.x ?? 0) - (triggerBox?.x ?? 0)),
      'select listbox shifted horizontally on first open'
    ).toBeLessThan(48);

    await page.keyboard.press('Escape');
    await expect(listbox).toHaveCount(0);

    await page.getByRole('button', { name: 'Open dialog' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();
    await expect(dialog).toHaveCount(0);

    await page.getByRole('button', { name: 'Open menu' }).click();
    await expect(page.getByRole('menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('menu')).toHaveCount(0);

    const hint = page.getByRole('button', { name: 'Hint' });
    await hint.hover();
    await expect(
      page.getByRole('tooltip', { name: 'Host-owned hint' })
    ).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tooltip')).toHaveCount(0);

    await page.getByRole('button', { name: 'Show toast' }).click();
    const toast = page.getByRole('status').filter({ hasText: 'Saved' });
    await expect(toast).toBeVisible();
    await toast.getByRole('button', { name: 'Close' }).click();
    await expect(toast).toHaveCount(0);

    await assertNoOrphanedPortals();
  });

  test('theme and locale changes keep shell chrome and restyle the lab', async ({
    page,
  }) => {
    await page.goto('/host/style-guide');
    const header = page.locator('[data-rmf-shell="header"]');

    await header.getByRole('combobox', { name: 'Language' }).click();
    await page.getByRole('option', { name: 'RU' }).click();
    await expect(
      page.getByRole('heading', { name: 'Гайд стиля Shell' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Опасное' })).toBeVisible();
    await expect(
      page.getByRole('checkbox', { name: 'Подписка' })
    ).toBeVisible();
    await expect(
      page.getByRole('switch', { name: 'Уведомления' })
    ).toBeVisible();
    await expect(header.getByRole('button', { name: 'Выйти' })).toBeVisible();

    const html = page.locator('html');
    const beforeTheme = await html.getAttribute('data-rmf-theme');
    await header.getByRole('button', { name: /Тёмная|Светлая/ }).click();
    await expect(html).not.toHaveAttribute('data-rmf-theme', beforeTheme ?? '');
    await expect(
      page.getByRole('heading', { name: 'Гайд стиля Shell' })
    ).toBeVisible();
    await expect(page.locator('[data-rmf-shell="sidebar"]')).toBeVisible();
  });
});

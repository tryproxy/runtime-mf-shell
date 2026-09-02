import { expect, test } from '../fixtures/runtime-mf';

const DESKTOP = { width: 1280, height: 800 };
const COMPACT = { width: 390, height: 844 };

test.describe('shell lab navigation', () => {
  test.use({ viewport: DESKTOP });

  test('desktop sidebar groups modules and keeps headings non-interactive', async ({
    page,
  }) => {
    await page.goto('/host');
    await expect(
      page.getByRole('heading', { name: 'Host page' })
    ).toBeVisible();

    await page
      .locator('[data-rmf-shell="sidebar"]')
      .getByRole('button', { name: 'Shell Lab', exact: true })
      .click();

    const sidebar = page.locator('[data-rmf-shell="sidebar"]');
    const platform = sidebar.locator('[data-rmf-nav-group="platform"]');
    const demos = sidebar.locator('[data-rmf-nav-group="demos"]');
    const products = sidebar.locator('[data-rmf-nav-group="products"]');

    await expect(platform).toHaveText('Platform');
    await expect(demos).toHaveText('Demos');
    await expect(products).toHaveText('Products');
    await expect(platform).not.toHaveRole('button');
    await expect(platform).not.toHaveRole('link');
    await expect(demos).not.toHaveRole('link');
    await expect(products).not.toHaveRole('button');

    await expect(
      sidebar.getByRole('button', { name: 'Shell Lab' })
    ).toBeVisible();
    await expect(
      sidebar.getByRole('button', { name: 'React Demo' })
    ).toBeVisible();
    await expect(
      sidebar.getByRole('button', { name: 'Angular Demo' })
    ).toBeVisible();
    await expect(
      sidebar.getByRole('button', { name: 'ASO Customer Admin' })
    ).toBeVisible();
    await expect(
      sidebar.getByRole('button', { name: 'Zeywin' })
    ).toHaveAttribute('title', 'Product app connected to this shell.');

    await platform.click();
    await expect(page).toHaveURL(/\/host\/?$/);

    await sidebar.getByRole('button', { name: 'React Demo' }).click();
    await expect(page).toHaveURL(/\/remote\/?/);
  });

  test('shell lab pages navigate, reload, and keep history', async ({
    page,
  }) => {
    await page.goto('/host');
    await expect(
      page.getByRole('heading', { name: 'Host page' })
    ).toBeVisible();
    await expect(
      page.getByRole('navigation', { name: 'Module pages' })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Overview', exact: true })
    ).toBeVisible();

    await page.getByRole('link', { name: 'Style Guide', exact: true }).click();
    await expect(page).toHaveURL(/\/host\/style-guide\/?$/);
    await expect(
      page.getByRole('heading', { name: 'Shell Style Guide' })
    ).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'Shell Style Guide' })
    ).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/host\/?$/);
    await expect(
      page.getByRole('heading', { name: 'Host page' })
    ).toBeVisible();

    await page.goForward();
    await expect(page).toHaveURL(/\/host\/style-guide\/?$/);
    await expect(
      page.getByRole('heading', { name: 'Shell Style Guide' })
    ).toBeVisible();

    await page.goto('/host/style-guide');
    await expect(
      page.getByRole('heading', { name: 'Shell Style Guide' })
    ).toBeVisible();
  });
});

test.describe('shell lab compact navigation', () => {
  test.use({ viewport: COMPACT });

  test('compact switcher stays flat and still reaches the style guide', async ({
    page,
  }) => {
    await page.goto('/host');

    const header = page.locator('[data-rmf-shell="header"]');
    await expect(
      header.getByRole('button', { name: 'Shell Lab' })
    ).toBeVisible();
    await expect(
      header.getByRole('button', { name: 'React Demo' })
    ).toBeVisible();
    await expect(
      header.getByRole('button', { name: 'ASO Customer Admin' })
    ).toHaveAttribute('title', 'Product app connected to this shell.');
    await expect(header.getByText('Platform', { exact: true })).toHaveCount(0);
    await expect(header.getByText('Demos', { exact: true })).toHaveCount(0);

    await header.getByRole('button', { name: 'Style Guide' }).click();
    await expect(page).toHaveURL(/\/host\/style-guide\/?$/);
    await expect(
      page.getByRole('heading', { name: 'Shell Style Guide' })
    ).toBeVisible();
  });
});

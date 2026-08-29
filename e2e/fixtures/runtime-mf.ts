import { expect, test as base, type Page } from '@playwright/test';
import { readE2eTarget, type E2eTarget } from '../env';

type ChromeSnapshot = {
  theme: string | null;
  htmlOverflow: string;
  bodyOverflow: string;
  htmlFontFamily: string;
  sidebarWidth: number;
  headerHeight: number;
};

type RuntimeMfFixtures = {
  target: E2eTarget;
  openRemote: (path?: string) => Promise<void>;
  captureChrome: () => Promise<ChromeSnapshot>;
  sessionStarts: (remoteId: string) => Promise<number>;
  assertNoOrphanedPortals: () => Promise<void>;
};

async function waitForRemoteReady(
  page: Page,
  target: E2eTarget
): Promise<void> {
  await expect(
    page.locator(
      `[data-rmf-slot="${target.remoteId}"][data-rmf-slot-status="ready"]`
    )
  ).toBeVisible({ timeout: 45_000 });
}

export const test = base.extend<RuntimeMfFixtures>({
  target: async ({}, use) => {
    await use(readE2eTarget());
  },

  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      try {
        const raw = sessionStorage.getItem('__RMF_E2E__');
        const parsed: unknown = raw ? JSON.parse(raw) : null;
        const sessionStarts =
          parsed &&
          typeof parsed === 'object' &&
          'sessionStarts' in parsed &&
          parsed.sessionStarts &&
          typeof parsed.sessionStarts === 'object'
            ? (parsed.sessionStarts as Record<string, number>)
            : {};
        window.__RMF_E2E__ = { sessionStarts };
      } catch {
        window.__RMF_E2E__ = { sessionStarts: {} };
      }
    });
    await use(page);
  },

  openRemote: async ({ page, target }, use) => {
    await use(async (path) => {
      await page.goto(path ?? target.indexPath);
      await waitForRemoteReady(page, target);
    });
  },

  captureChrome: async ({ page }, use) => {
    await use(async () => {
      return page.evaluate(() => {
        const html = document.documentElement;
        const body = document.body;
        const sidebar = document.querySelector('[data-rmf-shell="sidebar"]');
        const header = document.querySelector('[data-rmf-shell="header"]');

        return {
          theme: html.dataset.rmfTheme ?? null,
          htmlOverflow: getComputedStyle(html).overflow,
          bodyOverflow: getComputedStyle(body).overflow,
          htmlFontFamily: getComputedStyle(html).fontFamily,
          sidebarWidth: sidebar
            ? Math.round(sidebar.getBoundingClientRect().width)
            : 0,
          headerHeight: header
            ? Math.round(header.getBoundingClientRect().height)
            : 0,
        };
      });
    });
  },

  sessionStarts: async ({ page }, use) => {
    await use(async (remoteId) => {
      return page.evaluate((id) => {
        return window.__RMF_E2E__?.sessionStarts[id] ?? 0;
      }, remoteId);
    });
  },

  assertNoOrphanedPortals: async ({ page }, use) => {
    await use(async () => {
      await expect(page.locator('[data-slot="select-content"]')).toHaveCount(0);
      await expect(page.locator('[data-slot="dialog-overlay"]')).toHaveCount(0);
      await expect(page.locator('[data-slot="dialog-content"]')).toHaveCount(0);
      await expect(page.locator('[data-radix-focus-guard]')).toHaveCount(0);
    });
  },
});

export { expect };

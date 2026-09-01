import type { Locator, Page } from '@playwright/test';
import type { E2eTarget, StarterE2eProfile } from '../env';
import { expect, test, waitForRemoteReady } from '../fixtures/runtime-mf';

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'compact', width: 390, height: 844 },
] as const;

const THEME_SELECTORS = [
  '[data-rmf-root]',
  '[data-slot="card"]',
  '[data-slot="input"]',
  '[data-slot="select-trigger"]',
  '[data-slot="select-content"]',
] as const;

async function waitForLayout(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      )
  );
}

async function expectSelectAligned(
  trigger: Locator,
  listbox: Locator,
  context: string,
  alignment: 'center' | 'full-width'
): Promise<void> {
  const triggerBounds = await trigger.boundingBox();
  const listboxBounds = await listbox.boundingBox();
  expect(triggerBounds, `${context} trigger bounds`).not.toBeNull();
  expect(listboxBounds, `${context} listbox bounds`).not.toBeNull();

  if (!triggerBounds || !listboxBounds) return;

  if (alignment === 'full-width') {
    expect(
      Math.abs(listboxBounds.x - triggerBounds.x),
      `${context} horizontal alignment`
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(listboxBounds.width - triggerBounds.width),
      `${context} width`
    ).toBeLessThanOrEqual(1);
  } else {
    expect(
      Math.abs(
        listboxBounds.x +
          listboxBounds.width / 2 -
          (triggerBounds.x + triggerBounds.width / 2)
      ),
      `${context} centered alignment`
    ).toBeLessThanOrEqual(1);
    expect(
      listboxBounds.width,
      `${context} minimum width`
    ).toBeGreaterThanOrEqual(triggerBounds.width);
  }

  expect(
    Math.abs(listboxBounds.y - (triggerBounds.y + triggerBounds.height + 4)),
    `${context} vertical alignment`
  ).toBeLessThanOrEqual(1);
}

function requireStarterProfile(target: E2eTarget): StarterE2eProfile {
  if (!target.starterProfile) {
    throw new Error('Starter profile is unavailable.');
  }
  return target.starterProfile;
}

async function openStarterSurface(
  page: Page,
  target: E2eTarget,
  profile: StarterE2eProfile
): Promise<void> {
  await page.goto(profile.surfaceUrl);
  if (profile.embedded) {
    await waitForRemoteReady(page, target);
  } else {
    await page.locator('[data-rmf-root]').waitFor();
  }
}

test.describe('starter UI hardening', () => {
  test.beforeEach(({ target }) => {
    test.skip(
      target.starterProfile === null,
      'E2E_STARTER_SURFACE_URL is unset; starter acceptance is not targeted'
    );
  });

  test('Select is aligned on first open and after ancestor scroll or resize', async ({
    page,
    target,
  }) => {
    const profile = requireStarterProfile(target);

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      await openStarterSurface(page, target, profile);
      await page.evaluate(() => document.fonts.ready);
      await waitForLayout(page);

      const trigger = page.getByLabel(profile.formSelectLabel);
      const form = trigger.locator('xpath=ancestor::form');
      await form.evaluate((element) => {
        element.style.height = '180px';
        element.style.overflow = 'auto';
        const spacer = document.createElement('div');
        spacer.dataset.rmfE2eScrollSpacer = '';
        spacer.style.height = '320px';
        element.append(spacer);
      });

      await trigger.click();
      const listbox = page.getByRole('listbox');
      await expect(listbox).toBeVisible();
      await expectSelectAligned(
        trigger,
        listbox,
        `${viewport.name} full-width first open`,
        'full-width'
      );

      await form.evaluate((element) => {
        element.scrollTop = 32;
      });
      await waitForLayout(page);
      await expectSelectAligned(
        trigger,
        listbox,
        `${viewport.name} ancestor scroll`,
        'full-width'
      );

      await page.setViewportSize({
        width: viewport.width - 24,
        height: viewport.height,
      });
      await waitForLayout(page);
      await expectSelectAligned(
        trigger,
        listbox,
        `${viewport.name} resize`,
        'full-width'
      );

      await page.keyboard.press('Escape');
      await expect(listbox).toHaveCount(0);

      if (!profile.embedded) {
        const compactTrigger = page.getByLabel(profile.compactSelectLabel);
        await compactTrigger.click();
        const compactListbox = page.getByRole('listbox');
        await expect(compactListbox).toBeVisible();
        await expectSelectAligned(
          compactTrigger,
          compactListbox,
          `${viewport.name} compact first open`,
          'center'
        );
        await page.keyboard.press('Escape');
      }
    }
  });

  test('hint appears as a hover tooltip without shifting layout', async ({
    page,
    target,
  }) => {
    const profile = requireStarterProfile(target);
    await openStarterSurface(page, target, profile);
    const control = page.getByRole('button', {
      name: profile.hintControlLabel,
    });
    const toast = page.getByRole('button', { name: 'Show toast' });
    const layoutBefore = await toast.boundingBox();

    expect(layoutBefore, 'Show toast bounds before hover').not.toBeNull();
    await expect(control).not.toHaveAttribute('aria-expanded');

    await control.click();
    await expect(control).not.toHaveAttribute('aria-expanded');
    expect(
      Math.abs(((await toast.boundingBox())?.y ?? 0) - (layoutBefore?.y ?? 0)),
      'Show toast shifted after click'
    ).toBeLessThanOrEqual(1);

    await toast.hover();
    await expect(page.getByRole('tooltip')).toHaveCount(0);

    await control.hover();
    const hint = page.getByRole('tooltip', { name: profile.hintText });
    await expect(hint).toBeVisible();

    const layoutAfter = await toast.boundingBox();
    expect(layoutAfter, 'Show toast bounds after hover').not.toBeNull();
    expect(
      Math.abs((layoutAfter?.x ?? 0) - (layoutBefore?.x ?? 0)),
      'Show toast shifted horizontally'
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs((layoutAfter?.y ?? 0) - (layoutBefore?.y ?? 0)),
      'Show toast shifted vertically'
    ).toBeLessThanOrEqual(1);
  });

  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    test(`theme switch is atomic with reduced motion: ${reducedMotion}`, async ({
      page,
      target,
    }) => {
      const profile = requireStarterProfile(target);
      await page.emulateMedia({ reducedMotion });
      await openStarterSurface(page, target, profile);
      await page.getByLabel(profile.formSelectLabel).click();
      await expect(page.getByRole('listbox')).toBeVisible();

      const result = await page.evaluate(
        async ({ embedded, selectors }) => {
          const root = document.querySelector<HTMLElement>('[data-rmf-root]');
          const themeControl = embedded
            ? Array.from(
                document.querySelectorAll<HTMLButtonElement>('button')
              ).find((button) =>
                /^(Dark|Light)$/.test(button.textContent?.trim() ?? '')
              )
            : document.querySelector<HTMLButtonElement>(
                'button[aria-label="Theme"]'
              );
          if (!root || !themeControl) {
            throw new Error('Starter theme controls are unavailable.');
          }

          const readStyles = () => {
            const sample: Record<string, string> = {
              $theme: root.dataset.rmfTheme ?? '',
            };
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            const context = canvas.getContext('2d', {
              willReadFrequently: true,
            });
            if (!context) {
              throw new Error('Canvas color normalization is unavailable.');
            }
            const normalizeColor = (value: string) => {
              context.clearRect(0, 0, 1, 1);
              context.fillStyle = value;
              context.fillRect(0, 0, 1, 1);
              return [...context.getImageData(0, 0, 1, 1).data].join(',');
            };

            for (const selector of selectors) {
              const element =
                selector === '[data-rmf-root]'
                  ? root
                  : root.querySelector<HTMLElement>(selector);
              if (!element) {
                throw new Error(`Missing theme sample element: ${selector}`);
              }
              const style = getComputedStyle(element);
              sample[selector] = [
                normalizeColor(style.backgroundColor),
                normalizeColor(style.borderColor),
                normalizeColor(style.color),
              ].join('|');
            }
            return sample;
          };

          const before = readStyles();
          themeControl.click();
          const frames: Record<string, string>[] = [];
          for (let index = 0; index < 18; index += 1) {
            await new Promise<void>((resolve) =>
              requestAnimationFrame(() => resolve())
            );
            frames.push(readStyles());
          }
          return { before, frames };
        },
        { embedded: profile.embedded, selectors: THEME_SELECTORS }
      );
      const finalFrame = result.frames.at(-1);
      expect(finalFrame).toBeDefined();
      if (!finalFrame) return;

      expect(finalFrame.$theme).not.toBe(result.before.$theme);
      const changedSelectors = Object.keys(result.before).filter(
        (selector) => result.before[selector] !== finalFrame[selector]
      );
      expect(changedSelectors.sort()).toEqual(
        ['$theme', ...THEME_SELECTORS].sort()
      );

      for (const frame of result.frames) {
        const phases = new Set<'before' | 'after'>();
        for (const selector of changedSelectors) {
          const observed = frame[selector];
          const before = result.before[selector];
          const after = finalFrame[selector];
          expect(
            [before, after],
            `${selector} rendered an intermediate theme value`
          ).toContain(observed);
          phases.add(observed === before ? 'before' : 'after');
        }
        expect(
          [...phases],
          'theme elements changed in different frames'
        ).not.toEqual(expect.arrayContaining(['before', 'after']));
      }

      if (reducedMotion === 'reduce') {
        await page.keyboard.press('Escape');
        await page.getByRole('button', { name: 'Open dialog' }).click();
        const dialog = page.getByRole('dialog');
        await expect(dialog).toBeVisible();
        expect(
          await dialog.evaluate(
            (element) => getComputedStyle(element).animationName
          )
        ).toBe('none');
      }
    });
  }
});

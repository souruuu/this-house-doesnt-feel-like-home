import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import {
  inspectLayout,
  logicalRects,
  mouseSizes,
  touchSizes,
} from './ui-responsive-helpers';

// Owner responsive rule (2026-10-18): mouse = the 1920x1080 design scaled
// uniformly inside the 16:9 stage; touch landscape < 0.6 = designed compact
// layout with >= 44 css px targets; stage < 0.28 or touch portrait = guard.
const url = 'http://127.0.0.1:4174/nested/game/';
const evidence = join(process.cwd(), '..', 'phase2-evidence', 'responsive');
const button = (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true });

async function ready(page: Page) {
  await page.goto(url);
  await expect(page.locator('[data-world-state="ready"]')).toHaveCount(1);
  await page.evaluate(() => document.fonts.ready);
}

// Walks every Phase 1 surface, checking and photographing each one.
async function walk(
  page: Page,
  label: string,
  shoot: boolean,
  touch: boolean,
): Promise<string[]> {
  const failures: string[] = [];
  const check = async (surface: string) => {
    const report = await inspectLayout(page);
    for (const [kind, list] of Object.entries(report))
      for (const item of list) failures.push(`${surface} ${kind}: ${item}`);
    if (touch) {
      const small = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('.demo-overlay button')]
          .filter((el) =>
            el.checkVisibility({
              opacityProperty: true,
              visibilityProperty: true,
            }),
          )
          .filter((el) => el.getBoundingClientRect().height < 43.9)
          .map((el) => (el.textContent ?? '').trim()),
      );
      for (const item of small) failures.push(`${surface} target<44: ${item}`);
    }
    if (shoot)
      await page.screenshot({
        path: join(evidence, `${label}_${surface}.png`),
      });
  };
  await ready(page);
  await check('01-menu');
  for (const [entry, surface] of [
    ['Gallery', '02-gallery'],
    ['About', '03-about'],
    ['Load', '04-load'],
    ['Options', '05-options'],
  ] as const) {
    await page.locator(`[data-menu-entry="${entry}"]`).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await check(surface);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  }
  await page.locator('[data-menu-entry="Start"]').click();
  await expect(page.locator('.demo-narrative')).toHaveAttribute(
    'data-scene-id',
    'NOTICE',
  );
  await check('06-notice');
  // A3: the Notice box keeps one position across its lines and the start
  // choice sits under it in the same paper zone.
  const first = await logicalRects(page, '.demo-dialogue');
  const next = button(page, 'อ่านต่อ');
  const notice = page.locator('.demo-narrative');
  for (let step = 0; step < 6; step++) {
    if ((await notice.getAttribute('data-phase')) === 'choice') break;
    await next.click();
  }
  await expect(notice).toHaveAttribute('data-phase', 'choice');
  const later = await logicalRects(page, '.demo-dialogue');
  expect(Math.abs(later[0][0] - first[0][0])).toBeLessThanOrEqual(1);
  expect(Math.abs(later[0][1] - first[0][1])).toBeLessThanOrEqual(1);
  const [choice] = await logicalRects(page, '.demo-choices');
  expect(choice[0]).toBeGreaterThanOrEqual(later[0][0] - 1);
  expect(choice[0] + choice[2]).toBeLessThanOrEqual(900);
  expect(choice[1]).toBeGreaterThan(later[0][1] + later[0][3] - 1);
  await check('06b-notice-choice');
  await button(page, 'พัก').click();
  await expect(page.getByRole('dialog', { name: 'พักเกม' })).toBeVisible();
  await check('07-pause');
  return failures;
}

test.beforeAll(() => mkdirSync(evidence, { recursive: true }));

for (const [width, height] of mouseSizes)
  test(`mouse ${width}x${height}: Phase 1 surfaces fit the stage without overlap`, async ({
    page,
    browserName,
  }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width, height });
    const failures = await walk(
      page,
      `mouse-${width}x${height}`,
      browserName === 'chromium',
      false,
    );
    await expect(page.locator('.demo-shell')).toHaveAttribute(
      'data-compact',
      'false',
    );
    expect(failures).toEqual([]);
  });

for (const [width, height] of touchSizes)
  test(`touch ${width}x${height}: compact layout keeps 44px targets without overlap`, async ({
    browser,
    browserName,
  }) => {
    test.setTimeout(90_000);
    const context = await browser.newContext({
      viewport: { width, height },
      hasTouch: true,
      isMobile: true,
    });
    const page = await context.newPage();
    const failures = await walk(
      page,
      `touch-${width}x${height}`,
      browserName === 'chromium',
      true,
    );
    await expect(page.locator('.demo-shell')).toHaveAttribute(
      'data-compact',
      'true',
    );
    expect(failures).toEqual([]);
    await context.close();
  });

test('mouse windows scale the 1920 layout uniformly (menu and pause ±2 logical px)', async ({
  page,
}) => {
  test.setTimeout(120_000);
  const measure = async () => {
    await ready(page);
    const menu = await logicalRects(page, '[data-menu-entry]');
    const title = await logicalRects(page, '.vn-main-menu h1');
    await page.locator('[data-menu-entry="Start"]').click();
    await button(page, 'พัก').click();
    const pause = await logicalRects(page, '.demo-pause, .demo-pause button');
    return [...menu, ...title, ...pause];
  };
  await page.setViewportSize({ width: 1920, height: 1080 });
  const reference = await measure();
  for (const [width, height] of mouseSizes.slice(1)) {
    await page.setViewportSize({ width, height });
    const rects = await measure();
    expect(rects.length).toBe(reference.length);
    rects.forEach((rect, i) =>
      rect.forEach((value, k) =>
        expect(
          Math.abs(value - reference[i][k]),
          `${width}x${height} rect ${i} axis ${k}`,
        ).toBeLessThanOrEqual(2),
      ),
    );
  }
});

test('too-small window and touch portrait show a Thai guard; play resumes without state loss', async ({
  browser,
  browserName,
}) => {
  test.setTimeout(90_000);
  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
  });
  await ready(page);
  await page.locator('[data-menu-entry="Start"]').click();
  const view = page.locator('.demo-narrative');
  await expect(view).toHaveAttribute('data-line-id', 'demo.D1N-L001');
  const run = await view.getAttribute('data-run-id');
  await page.setViewportSize({ width: 500, height: 300 });
  await expect(page.getByRole('alert')).toContainText(
    'ขยายหน้าต่างให้ใหญ่ขึ้นเพื่อเล่นต่อ',
  );
  await expect(page.locator('.demo-shell')).toHaveAttribute(
    'data-paused',
    'true',
  );
  await expect(page.locator('.demo-overlay')).toHaveAttribute('inert', '');
  if (browserName === 'chromium')
    await page.screenshot({ path: join(evidence, 'guard-small_500x300.png') });
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.locator('.demo-shell')).toHaveAttribute(
    'data-paused',
    'false',
  );
  await expect(view).toHaveAttribute('data-run-id', run!);
  await expect(view).toHaveAttribute('data-line-id', 'demo.D1N-L001');
  await page.close();

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const phone = await context.newPage();
  await phone.goto(url);
  await expect(phone.getByRole('alert')).toContainText('กรุณาหมุนอุปกรณ์');
  await expect(phone.locator('.demo-overlay')).toHaveAttribute('inert', '');
  expect(
    await phone.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
  if (browserName === 'chromium')
    await phone.screenshot({
      path: join(evidence, 'guard-portrait_390x844.png'),
    });
  await context.close();
});

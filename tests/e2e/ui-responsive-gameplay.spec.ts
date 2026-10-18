import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import { advanceTo, startGame, type GameplayView } from './ui-phase2-helpers';
import {
  inspectLayout,
  logicalRects,
  mouseSizes,
  touchSizes,
} from './ui-responsive-helpers';

// Owner responsive rule for gameplay views (narration, speech, player,
// choice): inside the stage, no overlap/overflow, mouse = uniform scaling,
// touch compact = >= 44 css px targets.
const evidence = join(process.cwd(), '..', 'phase2-evidence', 'responsive');
const views: [GameplayView, string][] = [
  ['narration', '08-play-narration'],
  ['speech', '09-play-speech'],
  ['player', '10-play-player'],
  ['choice', '11-play-choice'],
];

async function walk(page: Page, label: string, shoot: boolean, touch: boolean) {
  const failures: string[] = [];
  await startGame(page);
  for (const [kind, surface] of views) {
    await advanceTo(page, kind);
    const report = await inspectLayout(page);
    for (const [problem, list] of Object.entries(report))
      for (const item of list) failures.push(`${surface} ${problem}: ${item}`);
    if (touch) {
      const small = await page.evaluate(() =>
        [...document.querySelectorAll<HTMLElement>('.demo-overlay button')]
          .filter((el) =>
            el.checkVisibility({
              opacityProperty: true,
              visibilityProperty: true,
            }),
          )
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return r.height < 43.9 || r.width < 43.9;
          })
          .map((el) => el.getAttribute('aria-label') ?? el.textContent),
      );
      for (const item of small) failures.push(`${surface} target<44: ${item}`);
    }
    if (shoot)
      await page.screenshot({
        path: join(evidence, `${label}_${surface}.png`),
      });
  }
  return failures;
}

test.beforeAll(() => mkdirSync(evidence, { recursive: true }));

for (const [width, height] of mouseSizes)
  test(`mouse ${width}x${height}: gameplay views fit the stage without overlap`, async ({
    page,
    browserName,
  }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height });
    const failures = await walk(
      page,
      `mouse-${width}x${height}`,
      browserName === 'chromium',
      false,
    );
    expect(failures).toEqual([]);
  });

for (const [width, height] of touchSizes)
  test(`touch ${width}x${height}: compact gameplay keeps 44px targets`, async ({
    browser,
    browserName,
  }) => {
    test.setTimeout(120_000);
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

test('mouse gameplay scales the 1920 layout uniformly (box, plate, choices ±2 logical px)', async ({
  page,
}) => {
  test.setTimeout(180_000);
  const measure = async () => {
    await startGame(page);
    await advanceTo(page, 'speech');
    const speech = [
      ...(await logicalRects(page, '.demo-dialogue')),
      ...(await logicalRects(page, '.demo-speaker-header')),
      ...(await logicalRects(page, '.demo-dialogue-footer button')),
    ];
    await advanceTo(page, 'choice');
    const choice = [
      ...(await logicalRects(page, '.demo-dialogue')),
      ...(await logicalRects(page, '[data-demo-choice]')),
    ];
    return [...speech, ...choice];
  };
  await page.setViewportSize({ width: 1920, height: 1080 });
  const reference = await measure();
  for (const [width, height] of [mouseSizes[3], mouseSizes[6]]) {
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

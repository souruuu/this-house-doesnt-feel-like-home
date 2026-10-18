import { expect, test, type Page } from '@playwright/test';
import {
  advanceTo,
  button,
  stageState,
  startGame,
  view,
} from './ui-phase2-helpers';
import { logicalRects } from './ui-responsive-helpers';

// UI Phase 2 (Owner D-1/D-5/D-6, 2026-10-18): 16:9 stage, art-anchored
// characters, three line kinds, right choice column, Auto suspend/resume.
// Walking the approved script to a view takes a while on this machine.
test.describe.configure({ timeout: 90_000 });

const dialogue = (page: Page) => page.locator('.demo-dialogue');

test('16:9 stage: no side bars, no on-stage speaker chip, table mask on', async ({
  page,
}) => {
  await startGame(page);
  await advanceTo(page, 'speech');
  const world = page.locator('[data-world-stage]');
  const stage = JSON.parse((await world.getAttribute('data-world-stage'))!);
  expect(stage).toMatchObject({
    time: 'morning',
    texture: 'demo.stage.counter.day',
    tint: null,
    occlusion: 'mask',
  });
  await expect(page.locator('[data-world-character-cue]')).toHaveAttribute(
    'data-world-character-cue',
    '',
  );
  // The canvas fills the whole 16:9 logical stage.
  const [canvas] = await logicalRects(page, '.world-host canvas');
  expect(canvas).toEqual([0, 0, 1920, 1080]);
});

test('three line kinds are visually distinct; quotes never enter the text', async ({
  page,
}) => {
  await startGame(page);
  await advanceTo(page, 'narration');
  await expect(page.locator('.demo-speaker-header')).toHaveCount(0);
  const narration = await page.locator('.demo-text').evaluate((el) => {
    const s = getComputedStyle(el);
    const box = getComputedStyle(el.closest('.demo-dialogue')!);
    return {
      style: s.fontStyle,
      family: s.fontFamily,
      color: s.color,
      edge: box.borderLeftWidth,
      before: getComputedStyle(el, '::before').content,
    };
  });
  expect(narration).toMatchObject({
    style: 'italic',
    color: 'rgb(233, 225, 207)',
    edge: '10px',
    before: 'none',
  });
  expect(narration.family).toMatch(/Bai Jamjuree/);
  const italicFace = await page.evaluate(() =>
    [...document.fonts].some(
      (f) =>
        f.family.includes('Bai Jamjuree') &&
        f.style === 'italic' &&
        f.status === 'loaded',
    ),
  );
  expect(italicFace).toBe(true); // real italic file, not a synthesized slant

  await advanceTo(page, 'speech');
  const speech = await page.locator('.demo-text').evaluate((el) => ({
    text: el.textContent,
    before: getComputedStyle(el, '::before').content,
    after: getComputedStyle(el, '::after').content,
  }));
  expect(speech.before).toBe('"“"');
  expect(speech.after).toBe('"”"');
  expect(speech.text).not.toMatch(/^“|”$/);
  const [box] = await logicalRects(page, '.demo-dialogue');
  const [plate] = await logicalRects(page, '.demo-speaker-header');
  expect(plate[0]).toBeLessThan(box[0] + box[2] / 2); // top-left
  expect(plate[1]).toBeLessThan(box[1]); // sits on the box edge
  await expect(page.locator('.demo-speaker-header')).toHaveCSS(
    'background-color',
    'rgb(215, 178, 124)',
  );

  await advanceTo(page, 'player');
  await expect(page.locator('.demo-speaker')).toHaveText('เจ้าของร้าน');
  const [playerBox] = await logicalRects(page, '.demo-dialogue');
  const [playerPlate] = await logicalRects(page, '.demo-speaker-header');
  expect(playerPlate[0]).toBeGreaterThan(playerBox[0] + playerBox[2] / 2); // top-right
  await expect(page.locator('.demo-speaker-header')).toHaveCSS(
    'background-color',
    'rgb(143, 208, 220)',
  );
  // The player never gets a portrait or a stage label.
  const visible = (await stageState(page)).slots.filter((s) => s.visible);
  expect(visible.every((s) => s.character !== 'player')).toBe(true);
  await expect(page.locator('[data-world-character-cue]')).toHaveAttribute(
    'data-world-character-cue',
    '',
  );
});

test('choices: right column, numbered 2-line cards, collapsed box keeps the character visible', async ({
  page,
}) => {
  await startGame(page);
  await advanceTo(page, 'choice');
  const cards = await logicalRects(page, '[data-demo-choice]');
  expect(cards.length).toBeGreaterThanOrEqual(2);
  for (const [x, , w, h] of cards) {
    expect(x).toBeGreaterThanOrEqual(1010 - 1);
    expect(x + w).toBeLessThanOrEqual(1710 + 1);
    expect(h).toBeGreaterThanOrEqual(96 - 1);
  }
  await expect(page.locator('.demo-choice-mark').first()).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  const lines = await page
    .locator('[data-demo-choice] > span:last-child')
    .evaluateAll((spans) =>
      spans.map((s) => {
        const lh = parseFloat(getComputedStyle(s).lineHeight);
        return Math.round(s.clientHeight / lh);
      }),
    );
  for (const count of lines) expect(count).toBeLessThanOrEqual(2);
  const [box] = await logicalRects(page, '.demo-dialogue');
  expect(box[1]).toBeCloseTo(900, -1);
  expect(box[3]).toBeCloseTo(130, -1);
  const actor = (await stageState(page)).slots.find((s) => s.visible)!;
  expect(actor.x + actor.width).toBeLessThan(cards[0][0]);
  // Keyboard order and focus treatment unchanged.
  await expect(page.locator('[data-demo-choice]').first()).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('[data-demo-choice]').nth(1)).toBeFocused();
  await expect(page.locator('[data-demo-choice]').nth(1)).toHaveCSS(
    'border-color',
    'rgb(215, 178, 124)',
  );
});

test.describe('character baseline is the same at every size', () => {
  const sizes = [
    { width: 1920, height: 1080, touch: false },
    { width: 1280, height: 720, touch: false },
    { width: 844, height: 390, touch: true },
  ];
  for (const size of sizes)
    test(`${size.width}x${size.height}`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: size.width, height: size.height },
        ...(size.touch ? { hasTouch: true, isMobile: true } : {}),
      });
      const page = await context.newPage();
      await startGame(page);
      await advanceTo(page, 'speech');
      const actor = (await stageState(page)).slots.find((s) => s.visible)!;
      expect(Math.abs(actor.y + actor.height - 800)).toBeLessThanOrEqual(8);
      expect(Math.abs(actor.x + actor.width / 2 - 700)).toBeLessThanOrEqual(8);
      expect(actor.height).toBeCloseTo(470, 0);
      await context.close();
    });
});

test.describe('Auto (D-6)', () => {
  test('clicking the box advances and keeps Auto on; it then plays by itself', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await startGame(page, { autoSeconds: 1 });
    await advanceTo(page, 'speech');
    await button(page, 'Auto').click();
    await expect(button(page, 'Auto')).toHaveAttribute('aria-pressed', 'true');
    const box = (await dialogue(page).boundingBox())!;
    const seen = new Set<string>();
    for (let i = 0; i < 5; i++) {
      seen.add((await view(page).getAttribute('data-line-id'))!);
      if ((await view(page).getAttribute('data-phase')) !== 'line') break;
      await page.mouse.click(box.x + 40, box.y + box.height / 2);
      await page.waitForTimeout(260);
      await expect(button(page, 'Auto')).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    }
    expect(seen.size).toBeGreaterThan(1);
    // Hands off: Auto keeps advancing on its own.
    if ((await view(page).getAttribute('data-phase')) === 'line') {
      const id = await view(page).getAttribute('data-line-id');
      await expect(view(page)).not.toHaveAttribute('data-line-id', id!, {
        timeout: 5000,
      });
    }
  });

  test('pause, blur and resize suspend then resume; no step while paused', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await startGame(page, { autoSeconds: 1 });
    await advanceTo(page, 'narration');
    await button(page, 'Auto').click();
    const shell = page.locator('.demo-shell');
    // Pause: nothing advances, Auto stays on, then resumes after a full delay.
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: 'พักเกม' })).toBeVisible();
    await expect(page.getByRole('dialog')).toContainText(
      'Auto จะพักตอนพักเกมและกลับมาต่อเองเมื่อเล่นต่อ',
    );
    const paused = await view(page).getAttribute('data-line-id');
    await page.waitForTimeout(2500);
    await expect(view(page)).toHaveAttribute('data-line-id', paused!);
    await page.keyboard.press('Escape');
    await expect(view(page)).toHaveAttribute('data-auto', 'true');
    await expect(view(page)).not.toHaveAttribute('data-line-id', paused!, {
      timeout: 5000,
    });
    // Blur / focus.
    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    await expect(shell).toHaveAttribute('data-paused', 'true');
    const blurred = await view(page).getAttribute('data-line-id');
    await page.waitForTimeout(2000);
    await expect(view(page)).toHaveAttribute('data-line-id', blurred!);
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await expect(view(page)).toHaveAttribute('data-auto', 'true');
    // Resize (fullscreen/window change) restarts the delay, never stops Auto.
    await page.setViewportSize({ width: 1100, height: 700 });
    await expect(view(page)).toHaveAttribute('data-auto', 'true');
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(view(page)).toHaveAttribute('data-auto', 'true');
    // Auto off only via its own button.
    await button(page, 'Auto').click();
    await expect(button(page, 'Auto')).toHaveAttribute('aria-pressed', 'false');
  });

  test('Auto never picks a choice for the player', async ({ page }) => {
    test.setTimeout(60_000);
    await startGame(page, { autoSeconds: 1 });
    await advanceTo(page, 'narration');
    await button(page, 'Auto').click();
    await expect(view(page)).toHaveAttribute('data-phase', 'choice', {
      timeout: 40_000,
    });
    await expect(view(page)).toHaveAttribute(
      'data-auto-execution',
      'waiting-choice',
    );
    const id = await view(page).getAttribute('data-line-id');
    await page.waitForTimeout(3000);
    await expect(view(page)).toHaveAttribute('data-phase', 'choice');
    await expect(view(page)).toHaveAttribute('data-line-id', id!);
    await expect(button(page, 'Auto')).toHaveAttribute('aria-pressed', 'true');
  });
});

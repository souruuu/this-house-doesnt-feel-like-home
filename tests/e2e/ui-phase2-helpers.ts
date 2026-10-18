import { expect, type Page } from '@playwright/test';

// Shared navigation for ui-phase2-* / ui-responsive-gameplay specs.
export const url = 'http://127.0.0.1:4174/nested/game/';
export const button = (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true });
export const view = (page: Page) => page.locator('.demo-narrative');

export type GameplayView = 'narration' | 'speech' | 'player' | 'choice';

export async function stageState(page: Page) {
  const host = page.locator('[data-world-character-stage]');
  const raw = (await host.getAttribute('data-world-character-stage')) ?? '{}';
  return JSON.parse(raw) as {
    slots: {
      position: string;
      character: string | null;
      visible: boolean;
      phase: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }[];
  };
}

export async function startGame(page: Page, { autoSeconds = 0 } = {}) {
  await page.goto(url);
  await expect(page.locator('[data-world-state="ready"]')).toHaveCount(1);
  await page.evaluate(() => document.fonts.ready);
  await page.locator('[data-menu-entry="Options"]').click();
  await page
    .getByRole('checkbox', { name: 'แสดงข้อความทันที', exact: true })
    .check();
  if (autoSeconds) {
    const delay = page.getByRole('slider', { name: 'เวลาเลื่อนอัตโนมัติ' });
    await delay.focus();
    await page.keyboard.press('Home'); // 1 second
    await expect(delay).toHaveValue(String(autoSeconds));
  }
  await button(page, 'กลับหน้าหลัก').click();
  await page.locator('[data-menu-entry="Start"]').click();
  await expect(view(page)).toHaveAttribute('data-scene-id', 'NOTICE');
}

// Steps the approved story until the wanted view is on screen with a
// character visible (gameplay scenes only). Never edits text or state.
export async function advanceTo(page: Page, wanted: GameplayView) {
  for (let step = 0; step < 200; step++) {
    // The day card (650 ms input guard) must be gone before any input.
    await expect(page.locator('.demo-day-transition')).toHaveCount(0);
    await expect(view(page)).not.toHaveAttribute('inert', '');
    const phase = await view(page).getAttribute('data-phase');
    const scene = await view(page).getAttribute('data-scene-id');
    if (scene !== 'NOTICE') {
      const visible = (await stageState(page)).slots.some(
        (slot) => slot.visible && slot.phase === 'stable',
      );
      const kind = await page
        .locator('.demo-dialogue')
        .getAttribute('data-line-kind');
      if (
        visible &&
        ((wanted === 'choice' && phase === 'choice') ||
          (wanted !== 'choice' && phase === 'line' && kind === wanted))
      )
        return;
    }
    if (phase === 'line') {
      const state = async () =>
        `${await view(page).getAttribute('data-phase')}/${await view(page).getAttribute('data-line-id')}`;
      const before = await state();
      await button(page, 'อ่านต่อ').click();
      // A line before a choice keeps its id; only the phase changes.
      await expect.poll(state).not.toBe(before);
    } else if (phase === 'choice') {
      await page.locator('[data-demo-choice]').first().click();
      await expect(view(page)).toHaveAttribute('data-phase', 'line');
    } else throw new Error(`unexpected phase ${phase}`);
  }
  throw new Error(`did not reach ${wanted}`);
}

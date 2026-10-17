import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { demoMenuPortrait, demoPortrait } from '../../src/world/demoStage';

test.use({ hasTouch: true });
const url = 'http://127.0.0.1:4174/nested/game/';
const button = (p: Page, name: string) =>
  p.getByRole('button', { name, exact: true });
const view = (p: Page) => p.locator('.demo-narrative');
type Stage = {
  generation: number;
  paused: boolean;
  slots: {
    character: string | null;
    position: string;
    visible: boolean;
    phase: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
};
async function stage(p: Page): Promise<Stage> {
  return JSON.parse(
    (await p
      .locator('[data-world-character-stage]')
      .getAttribute('data-world-character-stage'))!,
  );
}
async function settled(p: Page) {
  await expect
    .poll(async () => (await stage(p)).slots.every((s) => s.phase === 'stable'))
    .toBe(true);
}
async function shot(p: Page, info: TestInfo, name: string) {
  await p.screenshot({ path: info.outputPath(name + '.png') });
}
async function next(p: Page) {
  await expect(p.locator('.demo-day-transition')).toHaveCount(0);
  const before = `${await view(p).getAttribute('data-phase')}/${await view(p).getAttribute('data-line-id')}`;
  if ((await view(p).getAttribute('data-phase')) === 'choice') {
    await p.locator('[data-demo-choice]').first().click();
    await expect(view(p)).toHaveAttribute('data-phase', 'line');
  } else {
    await expect(view(p)).toHaveAttribute('data-revealing', 'false');
    await button(p, 'อ่านต่อ').click();
    await expect
      .poll(
        async () =>
          `${await view(p).getAttribute('data-phase')}/${await view(p).getAttribute('data-line-id')}`,
      )
      .not.toBe(before);
  }
}
async function begin(p: Page, target = url) {
  await p.goto(target);
  await expect(p).toHaveTitle('หลังเคาน์เตอร์');
  await expect(p.locator('[data-world-state="ready"]')).toHaveCount(1);
  await expect(p.locator('canvas')).toHaveCount(1);
  await button(p, 'Options').click();
  await p
    .getByRole('checkbox', { name: 'แสดงข้อความทันที', exact: true })
    .check();
  await button(p, 'กลับหน้าหลัก').click();
  await button(p, 'Start').click();
}
async function reach(p: Page, id: string) {
  for (let i = 0; i < 200; i++) {
    if (
      (await view(p).getAttribute('data-line-id')) === id &&
      (await view(p).getAttribute('data-phase')) === 'line'
    )
      return;
    await next(p);
  }
  throw new Error('Did not reach ' + id);
}
const audit = (p: Page) => {
  const errors: string[] = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  p.on('response', (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
  return errors;
};

for (const viewport of [
  { width: 1920, height: 1080 },
  { width: 1280, height: 720 },
  { width: 844, height: 390 },
]) {
  test(`Post-AB four canonical characters and safe UI bounds ${viewport.width}`, async ({
    page,
  }, info) => {
    test.setTimeout(360_000);
    const errors = audit(page);
    await page.setViewportSize(viewport);
    await page.goto(url);
    await expect(page.locator('[data-world-state="ready"]')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'หลังเคาน์เตอร์',
    );
    expect((await stage(page)).slots.every((s) => !s.visible)).toBe(true);
    await shot(page, info, 'title-no-menu-characters');
    const rect = (await page.locator('.logical-stage').boundingBox())!;
    const scale = rect.width / 1920;
    for (const name of ['Gallery', 'About', 'Load']) {
      await button(page, name).click();
      const panel = page.getByRole('dialog', { name, exact: true });
      const r = (await panel.boundingBox())!;
      expect(r.x).toBeGreaterThanOrEqual(rect.x);
      expect(r.x + r.width).toBeLessThan(rect.x + demoMenuPortrait.x * scale);
      expect(r.y + r.height).toBeLessThanOrEqual(rect.y + rect.height);
      await shot(page, info, name.toLowerCase() + '-safe-bounds');
      const back = button(page, 'กลับหน้าหลัก');
      await back.hover();
      await expect(back).toHaveCSS('text-shadow', 'none');
      await expect(back).toHaveCSS('text-decoration-line', 'none');
      await expect(back).toHaveCSS('box-shadow', 'none');
      await page.keyboard.press('Tab');
      await expect(back).toBeFocused();
      expect(await back.evaluate((el) => el.matches(':focus-visible'))).toBe(
        true,
      );
      await expect(back).toHaveCSS('outline-style', 'solid');
      await shot(page, info, name.toLowerCase() + '-back-keyboard-focus');
      await back.click();
      await expect(button(page, name)).toBeFocused();
    }
    await button(page, 'Options').click();
    for (const [name, pane] of [
      ['การอ่าน', 'reading'],
      ['หน้าจอ', 'display'],
      ['เสียง', 'audio'],
    ]) {
      await button(page, name).click();
      await expect(page.locator('[data-options-pane]')).toHaveAttribute(
        'data-options-pane',
        pane,
      );
      await shot(page, info, 'options-' + pane);
    }
    await button(page, 'การอ่าน').click();
    await page
      .getByRole('checkbox', { name: 'แสดงข้อความทันที', exact: true })
      .check();
    await button(page, 'กลับหน้าหลัก').click();
    await button(page, 'Start').click();
    const notice = (await page.locator('.demo-dialogue').boundingBox())!;
    expect(notice.x + notice.width).toBeLessThan(
      rect.x + demoMenuPortrait.x * scale,
    );
    await shot(page, info, 'notice-safe-bounds');
    const captures: Record<string, string> = {
      'demo.D101-L003': 'manao',
      'demo.D102-L003': 'som',
      'demo.D103-L003': 'nut',
      'demo.D303-L004': 'kant',
      'demo.D203-L003T': 'nut-evening',
      'demo.D302-L004': 'nut-night',
    };
    const evidence = [];
    const seen = new Set<string>();
    let named = false,
      choiceCaptured = false;
    for (let i = 0; i < 250; i++) {
      const phase = await view(page).getAttribute('data-phase');
      const id = (await view(page).getAttribute('data-line-id'))!;
      if (phase === 'ended') break;
      expect(phase).not.toBe('error');
      if (id === 'demo.D303-L010A') named = true;
      if (!named) await expect(view(page)).not.toContainText('กันต์');
      if (phase === 'line' && captures[id] && !seen.has(captures[id])) {
        await settled(page);
        const s = await stage(page),
          visible = s.slots.filter((s) => s.visible);
        const expected = captures[id].split('-')[0];
        expect(visible).toHaveLength(1);
        expect(visible[0].character).toBe(expected);
        const actor = visible[0];
        expect(actor.position).toBe('left');
        expect(actor.x).toBeGreaterThan(demoPortrait.x);
        expect(actor.x + actor.width).toBeLessThan(
          demoPortrait.x + demoPortrait.width,
        );
        expect(actor.y).toBeGreaterThan(0);
        const dialogue = (await page.locator('.demo-dialogue').boundingBox())!;
        expect(rect.y + (actor.y + actor.height) * scale).toBeLessThan(
          dialogue.y,
        );
        await shot(page, info, 'character-' + captures[id]);
        evidence.push({ id, renderer: s });
        seen.add(captures[id]);
      }
      if (id === 'demo.D101-L004' && phase === 'line') {
        await settled(page);
        expect((await stage(page)).slots[0].character).toBe('manao');
        await expect(page.locator('.demo-speaker-header')).toHaveCount(0);
        await shot(page, info, 'narrator-retains-character');
      }
      if (id === 'demo.D101-L004' && phase === 'choice' && !choiceCaptured) {
        const s = await stage(page),
          actor = s.slots.find((s) => s.visible)!;
        const c = (await page.locator('.demo-choice-region').boundingBox())!;
        expect(c.x).toBeGreaterThan(rect.x + (actor.x + actor.width) * scale);
        expect(c.x + c.width).toBeLessThan(
          rect.x + (demoPortrait.x + demoPortrait.width) * scale,
        );
        const revision = await view(page).getAttribute('data-view-revision');
        await shot(page, info, 'choice-beside-character');
        await expect(view(page)).toHaveAttribute(
          'data-view-revision',
          revision!,
        );
        expect((await stage(page)).slots[0].character).toBe('manao');
        choiceCaptured = true;
      }
      if (
        ['demo.D103-L008', 'demo.D103-L011'].includes(id) &&
        phase === 'line'
      ) {
        await settled(page);
        expect((await stage(page)).slots.every((s) => !s.visible)).toBe(true);
      }
      expect(
        (await stage(page)).slots.filter((s) => s.visible).length,
      ).toBeLessThanOrEqual(1);
      await next(page);
    }
    await expect(view(page)).toHaveAttribute('data-phase', 'ended');
    await settled(page);
    expect((await stage(page)).slots.every((s) => !s.visible)).toBe(true);
    expect([...seen].sort()).toEqual(
      ['kant', 'manao', 'nut', 'nut-evening', 'nut-night', 'som'].sort(),
    );
    expect(choiceCaptured).toBe(true);
    await info.attach('actual-character-bounds', {
      body: JSON.stringify(evidence, null, 2),
      contentType: 'application/json',
    });
    expect(errors).toEqual([]);
  });
}

test('Post-AB real Phaser cancellation, reduced motion and development remount', async ({
  page,
}, info) => {
  test.setTimeout(120_000);
  const errors = audit(page);
  await begin(page);
  await reach(page, 'demo.D101-L001');
  await next(page); // Canonical entry; do not wait for the tween before rapid Continue.
  const generation = (await stage(page)).generation;
  await next(page);
  expect((await stage(page)).generation).toBe(generation);
  expect((await stage(page)).slots.filter((s) => s.visible)).toHaveLength(1);
  await button(page, 'พัก').click();
  await expect.poll(async () => (await stage(page)).paused).toBe(true);
  await settled(page);
  const revision = await view(page).getAttribute('data-view-revision');
  await shot(page, info, 'pause-with-character');
  await expect(page.locator('.demo-main-surface')).toHaveCSS('opacity', '0');
  await page.waitForTimeout(650); // Past enter/out/gap durations: no queued callback may resume.
  await expect(view(page)).toHaveAttribute('data-view-revision', revision!);
  await button(page, 'เล่นต่อ').click();
  await settled(page);
  await expect(view(page)).toHaveAttribute('data-auto', 'false');
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect.poll(async () => (await stage(page)).paused).toBe(true);
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect.poll(async () => (await stage(page)).paused).toBe(false);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('alert')).toContainText('กรุณาหมุน');
  await expect.poll(async () => (await stage(page)).paused).toBe(true);
  await settled(page);
  await shot(page, info, 'portrait-rotate-static-stage');
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.getByRole('alert')).toHaveCount(0);
  await button(page, 'พัก').click();
  await button(page, 'Options').click();
  await button(page, 'หน้าจอ').click();
  await page
    .getByRole('checkbox', { name: 'ลดการเคลื่อนไหว', exact: true })
    .check();
  await page.keyboard.press('Escape');
  await button(page, 'เล่นต่อ').click();
  await reach(page, 'demo.D101-L010');
  expect(
    (await stage(page)).slots.every((s) => !s.visible && s.phase === 'stable'),
  ).toBe(true);
  await next(page);
  await next(page); // New Som entry is immediately static.
  expect((await stage(page)).slots[0]).toMatchObject({
    character: 'som',
    visible: true,
    phase: 'stable',
  });
  await shot(page, info, 'reduced-motion-immediate-som');
  await button(page, 'พัก').click();
  await button(page, 'กลับหน้าหลัก').click();
  expect((await stage(page)).slots.every((s) => !s.visible)).toBe(true);
  await begin(page, 'http://127.0.0.1:4173/'); // Real React StrictMode boot/remount boundary.
  await reach(page, 'demo.D101-L003');
  await settled(page);
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(page.locator('[data-world-character-stage]')).toHaveCount(1);
  expect((await stage(page)).slots.filter((s) => s.visible)).toHaveLength(1);
  expect(errors).toEqual([]);
});

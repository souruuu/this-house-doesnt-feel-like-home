import { expect, test, type Page } from '@playwright/test';
import { demoPortrait, demoMenuPortrait } from '../../src/world/demoStage';

const production = 'http://127.0.0.1:4174/nested/game/';
const narrative = (page: Page) => page.getByRole('region', { name: 'บทสนทนา' });
const next = (page: Page) =>
  page.getByRole('button', { name: 'อ่านต่อ', exact: true });
async function reach(page: Page, lineId: string) {
  for (let step = 0; step < 60; step++) {
    if ((await narrative(page).getAttribute('data-line-id')) === lineId) return;
    const phase = await narrative(page).getAttribute('data-phase');
    if (phase === 'line') {
      if ((await narrative(page).getAttribute('data-revealing')) === 'true')
        await next(page).click();
      await next(page).click();
    } else if (phase === 'choice') {
      await page.locator('[data-demo-choice]').first().click();
      await expect(narrative(page)).toHaveAttribute('data-phase', 'line');
    } else throw new Error(`Unexpected phase ${phase}`);
  }
  throw new Error(`Did not reach ${lineId}`);
}
async function start(page: Page) {
  await page.goto(production);
  await page.getByRole('button', { name: 'เริ่มเกม', exact: true }).click();
  await expect(narrative(page)).toHaveAttribute(
    'data-line-id',
    'demo.D1N-L001',
  );
}

for (const viewport of [
  { width: 1920, height: 1080 },
  { width: 1280, height: 720 },
  { width: 844, height: 390 },
]) {
  test(`demo layout, Thai overflow and choice focus ${viewport.width}x${viewport.height}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('response', (response) => {
      if (response.status() >= 400)
        errors.push(`${response.status()} ${response.url()}`);
    });
    await page.goto(production);
    await expect(page.locator('[data-world-state="ready"]')).toHaveCount(1);
    const stage = (await page.locator('.logical-stage').boundingBox())!;
    const scale = stage.width / 1920;
    const menu = (await page.locator('.vn-main-menu h1').boundingBox())!;
    expect(menu.x + menu.width).toBeLessThan(
      stage.x + demoMenuPortrait.x * scale,
    );
    await page.screenshot({
      path: testInfo.outputPath(
        `menu-${viewport.width}x${viewport.height}.png`,
      ),
    });
    // Keep the CSS-only DOM stress deterministic; reveal behavior has its own
    // real-hook tests, and the new default is covered by menu/options tests.
    await page.getByRole('button', { name: 'ตั้งค่า', exact: true }).click();
    await page.getByRole('checkbox', { name: 'แสดงข้อความทันที' }).check();
    await page
      .getByRole('button', { name: 'กลับหน้าหลัก', exact: true })
      .click();
    await page.getByRole('button', { name: 'เริ่มเกม', exact: true }).click();
    await reach(page, 'demo.D101-L001');
    await page.screenshot({
      path: testInfo.outputPath(
        `dialogue-${viewport.width}x${viewport.height}.png`,
      ),
    });
    await reach(page, 'demo.D101-L003');
    await expect(narrative(page)).toHaveAttribute(
      'data-line-id',
      'demo.D101-L003',
    );
    await expect(narrative(page)).toHaveAttribute('data-revealing', 'false');
    const body = page.locator('.demo-text-scroll');
    const original = await page.locator('.demo-text').textContent();
    // CSS stress only: approved narrative bytes/IDs are never altered.
    await page.locator('.demo-text').evaluate((el) => {
      el.textContent =
        'ข้อความทดสอบภาษาไทยที่ยาวขึ้นพร้อมสระและวรรณยุกต์ '.repeat(100);
    });
    const metrics = await body.evaluate((el) => ({
      height: el.clientHeight,
      scroll: el.scrollHeight,
      width: el.clientWidth,
      scrollWidth: el.scrollWidth,
    }));
    expect(metrics.scroll).toBeGreaterThan(metrics.height);
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.width + 1);
    const button = (await next(page).boundingBox())!;
    expect(button.height).toBeGreaterThanOrEqual(43.9);
    expect(button.y + button.height).toBeLessThan(stage.y + stage.height);
    await expect(page.locator('.demo-speaker')).toBeVisible();
    await body.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    expect(await body.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
    await page.locator('.demo-text').evaluate((el, text) => {
      el.textContent = text;
    }, original);
    for (
      let step = 0;
      step < 12 &&
      (await narrative(page).getAttribute('data-phase')) !== 'choice';
      step++
    ) {
      if ((await narrative(page).getAttribute('data-revealing')) === 'true')
        await next(page).click();
      await next(page).click();
    }
    await expect(narrative(page)).toHaveAttribute('data-phase', 'choice');
    const choices = page.locator('[data-demo-choice]');
    expect(await choices.count()).toBeGreaterThan(1);
    const bounds = (await page.locator('.demo-choices').boundingBox())!;
    const dialogue = (await page.locator('.demo-dialogue').boundingBox())!;
    expect(bounds.x).toBeGreaterThan(stage.x + demoPortrait.x * scale);
    expect(bounds.x + bounds.width).toBeLessThan(
      stage.x + (demoPortrait.x + demoPortrait.width) * scale,
    );
    expect(bounds.y + bounds.height).toBeLessThan(dialogue.y);
    await expect(choices.first()).toBeFocused();
    const id = await narrative(page).getAttribute('data-line-id');
    // Narrative context Enter cannot bypass a choice.
    await narrative(page).focus();
    await page.keyboard.press('Enter');
    await expect(narrative(page)).toHaveAttribute('data-line-id', id!);
    await expect(narrative(page)).toHaveAttribute('data-phase', 'choice');
    await choices.first().focus();
    await page.keyboard.down('ArrowDown');
    await expect(choices.nth(1)).toBeFocused();
    await page.keyboard.down('ArrowDown'); // repeat must not move focus again
    await expect(choices.nth(1)).toBeFocused();
    await page.keyboard.up('ArrowDown');
    await page.keyboard.press('Escape');
    await expect(
      page.getByRole('button', { name: 'เล่นต่อ', exact: true }),
    ).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(
      page.getByRole('button', { name: 'กลับหน้าหลัก', exact: true }),
    ).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(
      page.getByRole('button', { name: 'เล่นต่อ', exact: true }),
    ).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(choices.nth(1)).toBeFocused();
    await page.screenshot({
      path: testInfo.outputPath(
        `choice-${viewport.width}x${viewport.height}.png`,
      ),
    });
    await page.keyboard.down(' ');
    await expect(narrative(page)).toHaveAttribute('data-phase', 'line');
    const selectedLine = await narrative(page).getAttribute('data-line-id');
    await expect(next(page)).toBeFocused();
    await page.keyboard.down(' ');
    await page.keyboard.up(' ');
    await expect(narrative(page)).toHaveAttribute(
      'data-line-id',
      selectedLine!,
    );
    expect(errors).toEqual([]);
  });
}

test('typewriter finish/advance, pause, hidden and reduced motion preserve controller identity', async ({
  page,
}) => {
  await start(page);
  if ((await narrative(page).getAttribute('data-revealing')) === 'true')
    await next(page).click();
  await page.getByRole('button', { name: 'พัก', exact: true }).click();
  await page.getByRole('button', { name: 'ตั้งค่า', exact: true }).click();
  const instant = page.getByRole('checkbox', { name: 'แสดงข้อความทันที' });
  await expect(instant).not.toBeChecked();
  await instant.check();
  await instant.uncheck();
  await page.getByRole('button', { name: 'กลับเมนูเกม', exact: true }).click();
  await page.getByRole('button', { name: 'เล่นต่อ', exact: true }).click();
  await expect(narrative(page)).toHaveAttribute('data-revealing', 'false'); // toggle does not restart displayed line
  await next(page).click();
  await expect(narrative(page)).toHaveAttribute('data-revealing', 'true');
  const id = await narrative(page).getAttribute('data-line-id');
  const revision = await narrative(page).getAttribute('data-view-revision');
  await next(page).dblclick(); // first click reveals; second is suppressed
  await expect(narrative(page)).toHaveAttribute('data-revealing', 'false');
  await expect(narrative(page)).toHaveAttribute('data-line-id', id!);
  await expect(narrative(page)).toHaveAttribute(
    'data-view-revision',
    revision!,
  );
  await next(page).click();
  await expect(narrative(page)).toHaveAttribute('data-phase', 'choice');
  await page.locator('[data-demo-choice]').first().click();
  await expect(narrative(page)).toHaveAttribute('data-revealing', 'true');
  await page.keyboard.press('Escape');
  const text = await page.locator('.demo-text').textContent();
  await page.waitForTimeout(200); // deliberate paused-clock assertion
  expect(await page.locator('.demo-text').textContent()).toBe(text);
  await page.keyboard.press('Escape');
  await expect(page.locator('.demo-text')).not.toHaveText(text!);
  // Test-only visibility signal; no production interception or browser internals.
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator('.demo-shell')).toHaveAttribute(
    'data-paused',
    'true',
  );
  const hiddenText = await page.locator('.demo-text').textContent();
  await page.waitForTimeout(150);
  expect(await page.locator('.demo-text').textContent()).toBe(hiddenText);
  await page.evaluate(() => {
    Reflect.deleteProperty(document, 'hidden');
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator('.demo-shell')).toHaveAttribute(
    'data-paused',
    'false',
  );
  const current = await narrative(page).getAttribute('data-line-id');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(narrative(page)).toHaveAttribute('data-revealing', 'false');
  await expect(narrative(page)).toHaveAttribute('data-line-id', current!);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(narrative(page)).toHaveAttribute('data-revealing', 'false');
  await page.getByRole('button', { name: 'พัก', exact: true }).click();
  await page.getByRole('button', { name: 'ตั้งค่า', exact: true }).click();
  await instant.check();
  await page.getByRole('button', { name: 'กลับเมนูเกม', exact: true }).click();
  await page.getByRole('button', { name: 'เล่นต่อ', exact: true }).click();
  await next(page).click();
  await expect(narrative(page)).toHaveAttribute('data-revealing', 'false');
});

test('missing Segmenter uses instant text and fullscreen rejection remains playable', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(Intl, 'Segmenter', {
      value: undefined,
      configurable: true,
    });
    Element.prototype.requestFullscreen = () =>
      Promise.reject(new Error('Denied by test policy'));
  });
  await start(page);
  await page.getByRole('button', { name: 'เต็มจอ', exact: true }).click();
  await expect(
    page.getByRole('status').filter({ hasText: 'ไม่สามารถแสดงเต็มจอได้' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'พัก', exact: true }).click();
  await page.getByRole('button', { name: 'ตั้งค่า', exact: true }).click();
  await page.getByRole('checkbox', { name: 'แสดงข้อความทันที' }).uncheck();
  await page.getByRole('button', { name: 'กลับเมนูเกม', exact: true }).click();
  await page.getByRole('button', { name: 'เล่นต่อ', exact: true }).click();
  await next(page).click();
  await expect(narrative(page)).toHaveAttribute('data-revealing', 'false');
  await expect(page.locator('.demo-text')).toHaveText(
    'คุณสามารถหยุดพักระหว่างเล่นได้จากเมนูเกม',
  );
});

test('portrait guard blocks touch, returns to landscape and touch choice selects once', async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    hasTouch: true,
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  await page.goto(production);
  await expect(page.getByRole('alert')).toContainText('กรุณาหมุนอุปกรณ์');
  await expect(page.locator('.demo-overlay')).toHaveAttribute('inert', '');
  await page.screenshot({ path: testInfo.outputPath('portrait-390x844.png') });
  await page.setViewportSize({ width: 844, height: 390 });
  await page.getByRole('button', { name: 'เริ่มเกม', exact: true }).tap();
  for (const id of ['demo.D1N-L001', 'demo.D1N-L002']) {
    await expect(narrative(page)).toHaveAttribute('data-line-id', id);
    if ((await narrative(page).getAttribute('data-revealing')) === 'true')
      await next(page).tap();
    await next(page).tap();
  }
  await expect(narrative(page)).toHaveAttribute('data-phase', 'choice');
  await page.locator('[data-demo-choice]').first().tap();
  await expect(narrative(page)).toHaveAttribute(
    'data-line-id',
    'demo.D1P-L001',
  );
  await context.close();
});

test('real reveal hook StrictMode/remount cancels scheduled work without narrative effects', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/tests/fixtures/dialogue-reveal.html');
  await expect(page.locator('p')).not.toHaveText('');
  for (let cycle = 0; cycle < 3; cycle++) {
    await page.getByRole('button', { name: 'Toggle mount' }).click();
    await expect(page.locator('p')).toHaveCount(0);
    await page.getByRole('button', { name: 'Inspect', exact: true }).click();
    await expect(page.locator('output')).toHaveText(
      '{"pending":0,"sameView":true,"sameState":true}',
    );
    await page.getByRole('button', { name: 'Toggle mount' }).click();
    await expect(page.locator('p')).not.toHaveText('');
  }
  expect(errors).toEqual([]);
});

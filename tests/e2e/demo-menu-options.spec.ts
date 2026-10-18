import { expect, test, type Page } from '@playwright/test';
import { demoMenuPortrait } from '../../src/world/demoStage';

const url = 'http://127.0.0.1:4174/nested/game/';
const button = (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true });
const view = (page: Page) => page.locator('.demo-narrative');

for (const viewport of [
  { width: 1920, height: 1080 },
  { width: 1280, height: 720 },
  { width: 844, height: 390 },
]) {
  test(`checkpoint A menu/options composition ${viewport.width}x${viewport.height}`, async ({
    page,
  }, info) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('response', (r) => {
      if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
    });
    await page.goto(url);
    await expect(page).toHaveTitle('หลังเคาน์เตอร์');
    await expect(page.locator('[data-world-state="ready"]')).toHaveCount(1);
    const stage = (await page.locator('.logical-stage').boundingBox())!;
    const scale = stage.width / 1920;
    const title = (await page
      .getByRole('heading', { level: 1 })
      .boundingBox())!;
    expect(title.x + title.width).toBeLessThan(
      stage.x + demoMenuPortrait.x * scale,
    );
    for (const name of [
      'เริ่มเกม',
      'โหลดเกม',
      'ตั้งค่า',
      'แกลเลอรี',
      'เกี่ยวกับ',
    ]) {
      await expect(button(page, name)).toBeVisible();
      expect(
        (await button(page, name).boundingBox())!.height,
      ).toBeGreaterThanOrEqual(43.9);
    }
    await page.mouse.click(stage.x + 25 * scale, stage.y + 25 * scale);
    await page.screenshot({
      path: info.outputPath(`menu-${viewport.width}x${viewport.height}.png`),
    });
    const before = await button(page, 'ตั้งค่า').evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    await button(page, 'ตั้งค่า').hover();
    await expect
      .poll(() =>
        button(page, 'ตั้งค่า').evaluate(
          (el) => getComputedStyle(el).backgroundColor,
        ),
      )
      .not.toBe(before);
    await expect(button(page, 'ตั้งค่า')).toHaveCSS('text-shadow', 'none');
    await page.screenshot({
      path: info.outputPath(`hover-${viewport.width}x${viewport.height}.png`),
    });
    await button(page, 'เริ่มเกม').focus();
    await page.keyboard.press('Tab');
    await expect(button(page, 'โหลดเกม')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(button(page, 'ตั้งค่า')).toBeFocused();
    await page.screenshot({
      path: info.outputPath(`focus-${viewport.width}x${viewport.height}.png`),
    });
    await page.keyboard.press('Enter');
    await expect(
      page.getByRole('dialog', { name: 'ตั้งค่า', exact: true }),
    ).toBeVisible();
    await expect(page.locator('.demo-main-surface')).toHaveAttribute(
      'inert',
      '',
    );
    await expect(
      page.getByRole('slider', { name: 'Music Volume', exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('checkbox', { name: 'ลดการเคลื่อนไหว', exact: true }),
    ).toHaveCount(0);
    await button(page, 'เสียง').click();
    await expect(
      page.getByRole('slider', { name: 'Music Volume', exact: true }),
    ).toBeDisabled();
    await expect(
      page.getByRole('slider', { name: 'Sound Volume', exact: true }),
    ).toBeDisabled();
    await expect(
      page.getByText('เดโมนี้ยังไม่มีระบบเสียง', { exact: false }),
    ).toBeVisible();
    await page.screenshot({
      path: info.outputPath(`options-${viewport.width}x${viewport.height}.png`),
    });
    await button(page, 'หน้าจอ').click();
    await expect(
      page.getByRole('slider', { name: 'Music Volume', exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('slider', { name: 'Text Speed', exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('checkbox', { name: 'ลดการเคลื่อนไหว', exact: true }),
    ).toBeVisible();
    await page.screenshot({
      path: info.outputPath(`display-${viewport.width}x${viewport.height}.png`),
    });
    await button(page, 'การอ่าน').focus();
    await page.keyboard.press('Shift+Tab');
    await expect(
      page.getByRole('checkbox', { name: 'ลดการเคลื่อนไหว', exact: true }),
    ).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(button(page, 'การอ่าน')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(button(page, 'ตั้งค่า')).toBeFocused();
    expect(errors).toEqual([]);
  });
}

test('Load/Gallery/About have honest content and return focus without saves or invented credits', async ({
  page,
}, info) => {
  await page.goto(url);
  for (const [name, text] of [
    ['โหลดเกม', 'ยังไม่พร้อมโหลดเกม'],
    ['แกลเลอรี', 'ยังไม่มีภาพเพิ่มเติม'],
    ['เกี่ยวกับ', 'ช่วงทดลองเล่นวันที่ 1–3'],
  ] as const) {
    await button(page, name).click();
    const dialog = page.getByRole('dialog', { name, exact: true });
    await expect(dialog).toContainText(text);
    await expect(dialog.getByRole('img')).toHaveCount(0);
    await page.screenshot({
      path: info.outputPath(`${name.toLowerCase()}.png`),
    });
    await button(page, 'กลับหน้าหลัก').click();
    await expect(button(page, name)).toBeFocused();
  }
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
});

test('reading preferences are functional, pause return is safe, and profile persistence stays absent', async ({
  page,
}) => {
  await page.goto(url);
  await button(page, 'ตั้งค่า').click();
  const speed = page.getByRole('slider', { name: 'Text Speed', exact: true });
  const delay = page.getByRole('slider', {
    name: 'Auto-Forward Time',
    exact: true,
  });
  await expect(speed).toHaveValue('40');
  await expect(delay).toHaveValue('2');
  await expect(
    page.getByRole('checkbox', { name: 'แสดงข้อความทันที', exact: true }),
  ).not.toBeChecked();
  await speed.focus();
  await page.keyboard.press('End');
  await expect(speed).toHaveValue('60');
  await delay.focus();
  await page.keyboard.press('End');
  await page.keyboard.press('ArrowLeft');
  await expect(delay).toHaveValue('5.5');
  await button(page, 'กลับหน้าหลัก').click();
  await button(page, 'เริ่มเกม').click();
  await expect(view(page)).toHaveAttribute('data-line-id', 'demo.D1N-L001');
  await expect(view(page)).toHaveAttribute('data-revealing', 'true');
  await button(page, 'อ่านต่อ').click();
  await expect(view(page)).toHaveAttribute('data-revealing', 'false');
  const id = await view(page).getAttribute('data-line-id');
  const run = await view(page).getAttribute('data-run-id');
  await button(page, 'พัก').click();
  await button(page, 'ตั้งค่า').click();
  await expect(speed).toHaveValue('60');
  await expect(delay).toHaveValue('5.5');
  await page
    .getByRole('checkbox', { name: 'แสดงข้อความทันที', exact: true })
    .check();
  await page.keyboard.press('Enter'); // Settings context must not continue the story.
  await expect(view(page)).toHaveAttribute('data-line-id', id!);
  await button(page, 'กลับเมนูเกม').click();
  await expect(page.getByRole('dialog', { name: 'พักเกม' })).toBeVisible();
  await expect(button(page, 'ตั้งค่า')).toBeFocused();
  await button(page, 'เล่นต่อ').click();
  await expect(view(page)).toHaveAttribute('data-run-id', run!);
  await expect(view(page)).toHaveAttribute('data-line-id', id!);
  await button(page, 'อ่านต่อ').click();
  await expect(view(page)).toHaveAttribute('data-line-id', 'demo.D1N-L002');
  await expect(view(page)).toHaveAttribute('data-revealing', 'false');
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
  await page.reload();
  await expect(button(page, 'เริ่มเกม')).toBeVisible();
  await button(page, 'ตั้งค่า').click();
  await expect(speed).toHaveValue('40'); // D1 profile persistence is not implemented.
});

test('selected text speed changes the actual revealed line duration', async ({
  page,
}) => {
  test.setTimeout(30_000);
  await page.goto(url);
  const elapsed: number[] = [];
  for (const speed of [25, 60]) {
    await button(page, 'ตั้งค่า').click();
    const input = page.getByRole('slider', { name: 'Text Speed', exact: true });
    await input.focus();
    await page.keyboard.press(speed === 25 ? 'Home' : 'End');
    await expect(input).toHaveValue(String(speed));
    await button(page, 'กลับหน้าหลัก').click();
    await button(page, 'เริ่มเกม').click();
    await expect(view(page)).toHaveAttribute('data-revealing', 'true');
    const start = Date.now();
    await expect(view(page)).toHaveAttribute('data-revealing', 'false', {
      timeout: 10_000,
    });
    elapsed.push(Date.now() - start);
    await expect(view(page)).toHaveAttribute('data-line-id', 'demo.D1N-L001');
    await button(page, 'พัก').click();
    await button(page, 'กลับหน้าหลัก').click();
  }
  expect(elapsed[0]).toBeGreaterThan(elapsed[1] * 1.3);
});

test('fullscreen follows native state or reports browser rejection; failure does not break Start', async ({
  page,
}, info) => {
  await page.goto(url);
  await button(page, 'ตั้งค่า').click();
  await button(page, 'หน้าจอ').click();
  await expect(button(page, 'Windowed')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await button(page, 'Fullscreen').click();
  await expect
    .poll(
      async () =>
        Boolean(await page.evaluate(() => document.fullscreenElement)) ||
        (await page.locator('p[role="status"]').count()) > 0,
    )
    .toBe(true);
  const native = await page.evaluate(() => Boolean(document.fullscreenElement));
  info.annotations.push({
    type: 'native-fullscreen',
    description: native
      ? 'entered fullscreen'
      : 'browser reported rejection/unavailable',
  });
  if (native) {
    await expect(button(page, 'Fullscreen')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await button(page, 'Windowed').click();
    await expect
      .poll(() => page.evaluate(() => Boolean(document.fullscreenElement)))
      .toBe(false);
    await expect(button(page, 'Windowed')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  } else
    await expect(page.locator('p[role="status"]')).toContainText(
      /ไม่สามารถ|ไม่รองรับ/,
    );
  await button(page, 'กลับหน้าหลัก').click();
  await button(page, 'เริ่มเกม').click();
  await expect(view(page)).toHaveAttribute('data-phase', 'line');
});

test('OS reduced motion wins, native fullscreen denial is truthful, external handlers survive', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = () =>
      Promise.reject(new Error('Denied for test'));
  });
  await page.goto(url);
  await expect(page.locator('[data-world-state="ready"]')).toHaveCount(1);
  await page.evaluate(() => {
    const blur = window.onblur,
      focus = window.onfocus;
    let externalCalls = 0;
    const external = () => {
      externalCalls++;
    };
    window.addEventListener('blur', external);
    Object.defineProperty(window, 'readExternalProbe', {
      configurable: true,
      value: () => ({
        sameBlur: window.onblur === blur,
        sameFocus: window.onfocus === focus,
        externalCalls,
      }),
    });
  });
  await expect(button(page, 'ตั้งค่า')).toHaveCSS('transition-duration', '0s');
  for (let cycle = 0; cycle < 3; cycle++) {
    await button(page, 'ตั้งค่า').click();
    await button(page, 'กลับหน้าหลัก').click();
  }
  await page.evaluate(() => {
    window.dispatchEvent(new Event('blur'));
  });
  await expect(page.locator('.demo-shell')).toHaveAttribute(
    'data-paused',
    'true',
  );
  await page.evaluate(() => {
    window.dispatchEvent(new Event('focus'));
  });
  await expect(page.locator('.demo-shell')).toHaveAttribute(
    'data-paused',
    'false',
  );
  expect(
    await page.evaluate(() => Reflect.get(window, 'readExternalProbe')()),
  ).toEqual({ sameBlur: true, sameFocus: true, externalCalls: 1 });
  await button(page, 'ตั้งค่า').click();
  await button(page, 'หน้าจอ').click();
  await button(page, 'Fullscreen').click();
  await expect(page.locator('p[role="status"]')).toContainText(
    'ไม่สามารถแสดงเต็มจอ',
  );
  await expect(button(page, 'Windowed')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(
    page.getByText('อุปกรณ์ตั้งค่าลดการเคลื่อนไหวอยู่', { exact: false }),
  ).toBeVisible();
  await button(page, 'กลับหน้าหลัก').click();
  await button(page, 'เริ่มเกม').click();
  await expect(view(page)).toHaveAttribute('data-revealing', 'false');
  await expect(page.locator('canvas')).toHaveCount(1);
});

test('portrait guard remains; touch landscape opens and returns from Options', async ({
  browser,
}, info) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto(url);
  await expect(page.getByRole('alert')).toContainText('กรุณาหมุนอุปกรณ์');
  await expect(page.locator('.demo-overlay')).toHaveAttribute('inert', '');
  await page.screenshot({ path: info.outputPath('portrait-390x844.png') });
  await page.setViewportSize({ width: 844, height: 390 });
  await button(page, 'ตั้งค่า').tap();
  await expect(
    page.getByRole('dialog', { name: 'ตั้งค่า', exact: true }),
  ).toBeVisible();
  await button(page, 'กลับหน้าหลัก').tap();
  await expect(button(page, 'เริ่มเกม')).toBeVisible();
  await context.close();
});

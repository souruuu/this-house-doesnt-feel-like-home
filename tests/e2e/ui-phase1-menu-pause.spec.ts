import { expect, test, type Page } from '@playwright/test';

// UI Phase 1 (Owner D-2/D-3/D-4): fonts, Main Menu, info panels, Pause/Options.
const url = 'http://127.0.0.1:4174/nested/game/';
const COVER_SHA256 =
  '70821a58f484f640a5ebde90e0c7355b104210c52df77ceb765cd7ecd5783a18';
const button = (page: Page, name: string) =>
  page.getByRole('button', { name, exact: true });
const view = (page: Page) => page.locator('.demo-narrative');

async function logical(page: Page, selector: string) {
  return page.evaluate((sel) => {
    const stage = document
      .querySelector('.logical-stage')!
      .getBoundingClientRect();
    const box = document.querySelector(sel)!.getBoundingClientRect();
    const k = stage.width / 1920;
    return {
      x: (box.x - stage.x) / k,
      y: (box.y - stage.y) / k,
      right: (box.right - stage.x) / k,
      bottom: (box.bottom - stage.y) / k,
      cssHeight: box.height,
    };
  }, selector);
}

// WebKit in this Playwright build does not expose overscroll-behavior even
// when the rule applies; there we only assert the internal scroll container.
async function expectContainedScroll(page: Page, selector: string) {
  const style = await page.locator(selector).evaluate((el) => {
    const s = getComputedStyle(el);
    return { overscroll: s.overscrollBehaviorY, overflow: s.overflowY };
  });
  expect(style.overflow).toBe('auto');
  if (style.overscroll) expect(style.overscroll).toBe('contain');
}

async function ready(page: Page) {
  await page.goto(url);
  await expect(page.locator('[data-world-state="ready"]')).toHaveCount(1);
  await page.evaluate(() => document.fonts.ready);
}

test('Thai menu labels keep stable entry IDs and original behaviour', async ({
  page,
}) => {
  await ready(page);
  const labels = {
    Start: 'เริ่มเกม',
    Load: 'โหลดเกม',
    Options: 'ตั้งค่า',
    Gallery: 'แกลเลอรี',
    About: 'เกี่ยวกับ',
  } as const;
  for (const [entry, label] of Object.entries(labels)) {
    await expect(
      page.locator(`[data-menu-entry="${entry}"]`),
    ).toHaveAccessibleName(label);
    await expect(button(page, label)).toHaveAttribute('data-menu-entry', entry);
  }
  await expect(page.locator('[data-menu-entry="Load"]')).toHaveAttribute(
    'aria-describedby',
    'demo-load-availability',
  );
  await expect(page.locator('#demo-load-availability')).toContainText(
    'เดโมนี้ยังไม่บันทึกความคืบหน้า',
  );
  for (const [entry, dialog] of [
    ['Load', 'โหลดเกม'],
    ['Gallery', 'แกลเลอรี'],
    ['About', 'เกี่ยวกับ'],
    ['Options', 'ตั้งค่า'],
  ] as const) {
    await page.locator(`[data-menu-entry="${entry}"]`).click();
    await expect(page.getByRole('dialog', { name: dialog })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator(`[data-menu-entry="${entry}"]`)).toBeFocused();
  }
  await page.locator('[data-menu-entry="Start"]').click();
  await expect(view(page)).toHaveAttribute('data-line-id', 'demo.D1N-L001');
});

test('menu cover is the byte-identical artist file over paper, fonts are self-hosted', async ({
  page,
}) => {
  const external: string[] = [];
  page.on('request', (request) => {
    // Phaser decodes textures through same-page blob:/data: URLs.
    const target = request.url();
    if (
      !target.startsWith('http://127.0.0.1:4174/') &&
      !target.startsWith('blob:http://127.0.0.1:4174/') &&
      !target.startsWith('data:')
    )
      external.push(target);
  });
  await ready(page);
  const overlay = await page.locator('.demo-overlay').evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      image: style.backgroundImage,
      blend: style.backgroundBlendMode,
      color: style.backgroundColor,
    };
  });
  expect(overlay.image).toContain('assets/demo/menu/menu-cover-day.png');
  expect(overlay.blend).toBe('multiply');
  expect(overlay.color).toBe('rgb(251, 246, 234)');
  const coverUrl = overlay.image.match(/url\("(.+)"\)/)![1];
  const digest = await page.evaluate(async (src) => {
    const bytes = await (await fetch(src)).arrayBuffer();
    const hash = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(hash)]
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }, coverUrl);
  expect(digest).toBe(COVER_SHA256);
  const loaded = await page.evaluate(() =>
    [...document.fonts]
      .filter((face) => face.status === 'loaded')
      .map((face) => face.family.replaceAll('"', '')),
  );
  for (const family of ['Chonburi', 'Mitr', 'Bai Jamjuree'])
    expect(loaded).toContain(family);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCSS(
    'font-family',
    /Chonburi/,
  );
  await expect(button(page, 'เริ่มเกม')).toHaveCSS('font-family', /Mitr/);
  expect(external).toEqual([]);
});

test('menu shows only som and manao, decorative and unnamed', async ({
  page,
}) => {
  await ready(page);
  const characters = page.locator('[data-menu-character]');
  await expect(characters).toHaveCount(2);
  await expect(page.locator('.vn-menu-characters')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  const sources = await characters.evaluateAll((images) =>
    images.map((img) => ({
      slot: img.getAttribute('data-menu-character'),
      src: (img as HTMLImageElement).src,
      alt: img.getAttribute('alt'),
      complete: (img as HTMLImageElement).naturalWidth > 0,
      events: getComputedStyle(img.parentElement!).pointerEvents,
    })),
  );
  expect(sources.map((s) => s.slot)).toEqual(['som', 'manao']);
  for (const source of sources) {
    expect(source.src).toMatch(
      new RegExp(`assets/demo/characters/${source.slot}\\.png$`),
    );
    expect(source.alt).toBe('');
    expect(source.complete).toBe(true);
    expect(source.events).toBe('none');
  }
  const menu = page.getByRole('region', { name: 'หน้าหลัก' });
  const text = (await menu.innerText()) + (await menu.innerHTML());
  for (const name of [
    'Kant',
    'kant',
    'กันต์',
    'นัท',
    'nut.png',
    'ส้ม',
    'มะนาว',
  ])
    expect(text).not.toContain(name);
  await expect(page.getByRole('img')).toHaveCount(0);
  const title = await logical(page, '.vn-main-menu h1');
  expect(title.x).toBeGreaterThanOrEqual(90);
  expect(title.right).toBeLessThanOrEqual(880.5); // sub-pixel stage scaling
});

for (const viewport of [
  { width: 1920, height: 1080 },
  { width: 1280, height: 720 },
  { width: 844, height: 390 },
]) {
  test.describe(`${viewport.width}x${viewport.height}`, () => {
    // Owner rule 2026-10-18: 844x390 is the touch-phone compact case; mouse
    // windows scale uniformly (covered by ui-responsive-*.spec.ts).
    if (viewport.width === 844) test.use({ hasTouch: true, isMobile: true });
    test(`touch targets and paper-zone panels ${viewport.width}x${viewport.height}`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await ready(page);
      for (const entry of ['Start', 'Load', 'Options', 'Gallery', 'About']) {
        const box = await logical(page, `[data-menu-entry="${entry}"]`);
        expect(box.cssHeight).toBeGreaterThanOrEqual(43.9);
        expect(box.right).toBeLessThan(1000);
      }
      const note = await logical(page, '.vn-menu-note');
      const about = await logical(page, '[data-menu-entry="About"]');
      expect(note.y).toBeGreaterThan(about.bottom);
      expect(note.bottom).toBeLessThanOrEqual(1080);
      for (const [entry, name] of [
        ['Load', 'โหลดเกม'],
        ['Gallery', 'แกลเลอรี'],
        ['About', 'เกี่ยวกับ'],
      ] as const) {
        await page.locator(`[data-menu-entry="${entry}"]`).click();
        await expect(page.getByRole('dialog', { name })).toBeVisible();
        const panel = await logical(page, '.vn-info-screen');
        expect(panel.right).toBeLessThanOrEqual(900);
        await expectContainedScroll(page, '.vn-info-content');
        await button(page, 'กลับหน้าหลัก').click();
      }
      await button(page, 'เริ่มเกม').click();
      await expect(view(page)).toHaveAttribute('data-scene-id', 'NOTICE');
      const notice = await logical(page, '.demo-dialogue');
      expect(notice.right).toBeLessThanOrEqual(900);
      await button(page, 'พัก').click();
      for (const name of ['เล่นต่อ', 'ตั้งค่า', 'กลับหน้าหลัก']) {
        const box = (await button(page, name).boundingBox())!;
        expect(box.height).toBeGreaterThanOrEqual(43.9);
      }
      const sign = await logical(page, '.demo-pause');
      expect(sign.x).toBeLessThan(200);
      expect(sign.right).toBeLessThanOrEqual(900);
      expect(sign.bottom).toBeLessThanOrEqual(1080);
    });
  });
}

test('Pause sign: initial focus, focus trap, Esc closes and restores focus', async ({
  page,
}) => {
  await ready(page);
  await button(page, 'เริ่มเกม').click();
  await expect(view(page)).toHaveAttribute('data-line-id', 'demo.D1N-L001');
  await button(page, 'พัก').focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'พักเกม' });
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(button(page, 'เล่นต่อ')).toBeFocused();
  // Instant text moved to Options; Pause keeps only the truthful Auto note.
  await expect(dialog.getByRole('checkbox')).toHaveCount(0);
  await expect(dialog).toContainText('Auto หยุดเมื่อพักเกม');
  await expect(dialog).toContainText('กลับหน้าหลักแล้วรอบนี้จะหายไป');
  await page.keyboard.press('Tab');
  await expect(button(page, 'ตั้งค่า')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(button(page, 'กลับหน้าหลัก')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(button(page, 'เล่นต่อ')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(button(page, 'กลับหน้าหลัก')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(button(page, 'พัก')).toBeFocused();
  await expect(view(page)).toHaveAttribute('data-line-id', 'demo.D1N-L001');
  await button(page, 'พัก').click();
  await button(page, 'ตั้งค่า').click();
  await expect(page.getByRole('dialog', { name: 'ตั้งค่า' })).toBeVisible();
  await expect(
    page.getByRole('checkbox', { name: 'แสดงข้อความทันที', exact: true }),
  ).toBeVisible();
  await button(page, 'กลับเมนูเกม').click();
  await expect(button(page, 'ตั้งค่า')).toBeFocused();
});

test('Options shows the selected section; Back to Main has focus but no underline/glow', async ({
  page,
}) => {
  await ready(page);
  await button(page, 'ตั้งค่า').click();
  const reading = button(page, 'การอ่าน');
  const display = button(page, 'หน้าจอ');
  await expect(reading).toHaveAttribute('aria-current', 'location');
  await expect(display).not.toHaveAttribute('aria-current', /.+/);
  const idle = await display.evaluate(
    (el) => getComputedStyle(el).backgroundColor,
  );
  await display.click();
  await expect(display).toHaveAttribute('aria-current', 'location');
  await expect(reading).not.toHaveAttribute('aria-current', /.+/);
  expect(
    await display.evaluate((el) => getComputedStyle(el).backgroundColor),
  ).not.toBe(idle);
  await expectContainedScroll(page, '.vn-options-content');
  await button(page, 'กลับหน้าหลัก').click();
  await button(page, 'เกี่ยวกับ').click();
  const back = button(page, 'กลับหน้าหลัก');
  const style = (el: Element) => {
    const s = getComputedStyle(el);
    return {
      decoration: s.textDecorationLine,
      shadow: s.textShadow,
      box: s.boxShadow,
      background: s.backgroundColor,
      outline: s.outlineStyle,
    };
  };
  await page.mouse.move(0, 0);
  const rest = await back.evaluate(style);
  await back.hover();
  const hover = await back.evaluate(style);
  expect(hover.decoration).toBe('none');
  expect(hover.shadow).toBe('none');
  expect(hover.box).toBe(rest.box);
  expect(hover.background).toBe(rest.background);
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(back).toBeFocused();
  expect((await back.evaluate(style)).outline).toBe('solid');
});

test('reduced motion: menu and pause controls have no transition or press motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await ready(page);
  await expect(button(page, 'เริ่มเกม')).toHaveCSS('transition-duration', '0s');
  await expect(page.locator('.demo-shell')).toHaveAttribute(
    'data-reduced-motion',
    'true',
  );
  await button(page, 'เริ่มเกม').click();
  await button(page, 'พัก').click();
  await expect(button(page, 'เล่นต่อ')).toHaveCSS('transition-duration', '0s');
  await expect(page.locator('.demo-pause')).toHaveCSS('animation-name', 'none');
});

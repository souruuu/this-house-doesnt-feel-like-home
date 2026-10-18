import { expect, test, type Page } from '@playwright/test';
const url = 'http://127.0.0.1:4174/nested/game/';
const button = (p: Page, name: string) =>
  p.getByRole('button', { name, exact: true });
const view = (p: Page) => p.locator('.demo-narrative');

test('safe dialogue clicks exclude selection, drag, scroll and controls; first reveal then one advance', async ({
  page,
}, info) => {
  await page.goto(url);
  await button(page, 'ตั้งค่า').click();
  await page.getByRole('slider', { name: 'Text Speed' }).focus();
  await page.keyboard.press('Home');
  await button(page, 'กลับหน้าหลัก').click();
  // Revocation also spans a menu-only cycle with no Controller revision yet.
  const startBounds = (await button(page, 'เริ่มเกม').boundingBox())!;
  await page.mouse.move(startBounds.x + 20, startBounds.y + 20);
  await page.mouse.down();
  await button(page, 'ตั้งค่า').focus();
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('dialog', { name: 'ตั้งค่า', exact: true }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('dialog', { name: 'ตั้งค่า', exact: true }),
  ).toHaveCount(0);
  await page.mouse.up();
  await expect(view(page)).toHaveCount(0);
  await button(page, 'เริ่มเกม').click();
  const panel = page.locator('.demo-dialogue');
  let revision = await view(page).getAttribute('data-view-revision');
  const bounds = (await panel.boundingBox())!;
  let x = bounds.x + 24,
    y = bounds.y + 15;
  await page.mouse.click(x, y);
  await expect(view(page)).toHaveAttribute('data-revealing', 'false');
  await expect(view(page)).toHaveAttribute('data-line-id', 'demo.D1N-L001');
  await expect(view(page)).toHaveAttribute('data-view-revision', revision!);
  // Informational Skip is aria-disabled but deliberately activatable; no narrative action.
  const skip = button(page, 'Skip — ยังไม่พร้อม');
  const s = (await skip.boundingBox())!;
  await page.mouse.click(s.x + s.width / 2, s.y + s.height / 2);
  await expect(
    page.getByRole('status').filter({ hasText: 'ยังไม่พร้อมใช้งาน' }),
  ).toBeVisible();
  await expect(view(page)).toHaveAttribute('data-view-revision', revision!);
  await page.screenshot({ path: info.outputPath('skip-toast.png') });
  await skip.focus();
  await page.keyboard.press('Space');
  await expect(view(page)).toHaveAttribute('data-view-revision', revision!);
  // A held gesture is revoked across a complete Pause/Resume cycle.
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'พักเกม' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'พักเกม' })).toHaveCount(0);
  revision = await view(page).getAttribute('data-view-revision'); // Pause/Resume legitimately publishes new revisions.
  await page.mouse.up();
  await expect(view(page)).toHaveAttribute('data-line-id', 'demo.D1N-L001');
  await expect(view(page)).toHaveAttribute('data-view-revision', revision!);
  // A drag ending inside the surface is not a Continue.
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 70, y, { steps: 5 });
  await page.mouse.up();
  await expect(view(page)).toHaveAttribute('data-view-revision', revision!);
  await page.locator('.demo-text').evaluate((el) => {
    const range = document.createRange();
    range.selectNodeContents(el);
    const selection = getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
  });
  await page.mouse.click(x, y);
  await expect(view(page)).toHaveAttribute('data-view-revision', revision!);
  await page.evaluate(() => getSelection()?.removeAllRanges());
  const scroll = page.locator('.demo-text-scroll');
  await scroll.focus();
  await page.keyboard.press('Space');
  await expect(view(page)).toHaveAttribute('data-view-revision', revision!);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await scroll.evaluate((el) =>
    el.dispatchEvent(new Event('scroll', { bubbles: true })),
  );
  await page.mouse.up();
  await expect(view(page)).toHaveAttribute('data-view-revision', revision!);
  await page.mouse.click(x, y);
  await expect(view(page)).toHaveAttribute('data-line-id', 'demo.D1N-L002');
  await expect(view(page)).toHaveAttribute('data-revealing', 'true');
  const nextBounds = (await panel.boundingBox())!;
  x = nextBounds.x + 24;
  y = nextBounds.y + 15;
  await page.mouse.dblclick(x, y); // first finishes; second is rejected
  await expect(view(page)).toHaveAttribute('data-line-id', 'demo.D1N-L002');
  await expect(view(page)).toHaveAttribute('data-revealing', 'false');
  await page.waitForTimeout(250);
  await page.evaluate(() => getSelection()?.removeAllRanges());
  const fullBounds = (await panel.boundingBox())!;
  await page.mouse.click(fullBounds.x + 24, fullBounds.y + 15);
  await expect(view(page)).toHaveAttribute('data-phase', 'choice');
  await page.mouse.click(x, y);
  await expect(view(page)).toHaveAttribute('data-phase', 'choice');
});

for (const viewport of [
  { width: 1920, height: 1080 },
  { width: 1280, height: 720 },
  { width: 844, height: 390 },
]) {
  test(`exclusive Options and coherent information screens ${viewport.width}`, async ({
    page,
  }, info) => {
    await page.setViewportSize(viewport);
    await page.goto(url);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('response', (r) => {
      if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
    });
    await expect(page.locator('.vn-menu-art-frame')).toBeHidden();
    await expect(button(page, 'โหลดเกม')).toContainText('(ยังไม่พร้อม)');
    await page.screenshot({ path: info.outputPath('main-menu.png') });
    await button(page, 'ตั้งค่า').click();
    for (const [label, pane, sliders] of [
      ['การอ่าน', 'reading', 2],
      ['หน้าจอ', 'display', 0],
      ['เสียง', 'audio', 2],
    ] as const) {
      await button(page, label).click();
      await expect(page.locator('[data-options-pane]')).toHaveAttribute(
        'data-options-pane',
        pane,
      );
      await expect(page.locator('.vn-setting-section')).toHaveCount(1);
      await expect(page.getByRole('slider')).toHaveCount(sliders);
      await page.screenshot({ path: info.outputPath(`options-${pane}.png`) });
    }
    await expect(button(page, 'เสียง')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(button(page, 'ตั้งค่า')).toBeFocused();
    for (const name of ['โหลดเกม', 'แกลเลอรี', 'เกี่ยวกับ']) {
      await button(page, name).click();
      const dialog = page.getByRole('dialog', { name, exact: true });
      await expect(dialog).toBeVisible();
      const r = (await dialog.boundingBox())!;
      expect(r.x).toBeGreaterThanOrEqual(0);
      expect(r.x + r.width).toBeLessThanOrEqual(viewport.width + 1);
      await page.screenshot({
        path: info.outputPath(`${name.toLowerCase()}.png`),
      });
      await page.keyboard.press('Escape');
      await expect(button(page, name)).toBeFocused();
    }
    await button(page, 'ตั้งค่า').click();
    const speed = page.getByRole('slider', { name: 'Text Speed', exact: true });
    await speed.click();
    await expect(speed).toBeFocused();
    const instant = page.getByRole('checkbox', {
      name: 'แสดงข้อความทันที',
      exact: true,
    });
    await instant.check();
    await expect(instant).toBeFocused();
    await page.locator('.vn-screen-header h2').click();
    await expect(
      page.getByRole('dialog', { name: 'ตั้งค่า', exact: true }),
    ).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(button(page, 'การอ่าน')).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(instant).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(button(page, 'ตั้งค่า')).toBeFocused();
    expect(errors).toEqual([]);
  });
}

test('StrictMode Auto remount revokes pending timer without advancing the real controller', async ({
  page,
}) => {
  await page.goto('/tests/fixtures/dialogue-reveal.html');
  for (let cycle = 0; cycle < 3; cycle++) {
    await button(page, 'Arm test Auto').click();
    await button(page, 'Toggle mount').click();
    await page.waitForTimeout(1200);
    await button(page, 'Inspect').click();
    await expect(page.locator('output')).toHaveText(
      '{"pending":0,"sameView":true,"sameState":true}',
    );
    await button(page, 'Toggle mount').click();
  }
});

test('error presentation is truthful and does not mutate the live controller', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/tests/fixtures/dialogue-reveal.html');
  await button(page, 'Error presentation preview').click();
  await expect(page.getByRole('alert')).toContainText(
    'ไม่สามารถดำเนินเรื่องต่อได้',
  );
  await page.screenshot({
    path: info.outputPath('error-presentation-preview.png'),
  });
  await button(page, 'กลับหน้าหลัก').click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await button(page, 'Inspect').click();
  await expect(page.locator('output')).toContainText('"sameState":true');
});

test('Choice idle, hover, keyboard and single committed feedback are separate states', async ({
  page,
}, info) => {
  await page.goto(url);
  await button(page, 'ตั้งค่า').click();
  await page
    .getByRole('checkbox', { name: 'แสดงข้อความทันที', exact: true })
    .check();
  await button(page, 'กลับหน้าหลัก').click();
  await button(page, 'เริ่มเกม').click();
  await button(page, 'อ่านต่อ').click();
  await button(page, 'อ่านต่อ').click();
  await expect(view(page)).toHaveAttribute('data-phase', 'choice');
  for (
    let step = 0;
    step < 40 && (await page.locator('[data-demo-choice]').count()) < 2;
    step++
  ) {
    await expect(page.locator('.demo-day-transition')).toHaveCount(0);
    if ((await view(page).getAttribute('data-phase')) === 'choice') {
      await page.locator('[data-demo-choice]').first().click();
      await expect(view(page)).toHaveAttribute('data-phase', 'line');
    } else await button(page, 'อ่านต่อ').click();
  }
  const choices = page.locator('[data-demo-choice]');
  await expect(choices).toHaveCount(2);
  await view(page).evaluate((el) => (el as HTMLElement).blur());
  await page.mouse.move(4, 4);
  // Pointer modality does not leave a false selected ring on an idle choice.
  await page.mouse.move(4, 4);
  await page.screenshot({ path: info.outputPath('choice-idle.png') });
  await choices.nth(1).hover();
  await page.screenshot({ path: info.outputPath('choice-hover.png') });
  await choices.first().focus();
  await page.keyboard.press('ArrowDown');
  const states = await choices.evaluateAll((es) =>
    es.map((el) => ({
      focus: el.matches(':focus-visible'),
      color: getComputedStyle(el).outlineColor,
    })),
  );
  expect(states.filter((s) => s.focus)).toHaveLength(1);
  await page.mouse.move(4, 4);
  await page.screenshot({ path: info.outputPath('choice-keyboard.png') });
  // Freeze only the browser clock to capture the real 100ms confirmation surface.
  const time = new Date();
  await page.clock.install({ time });
  await page.clock.pauseAt(new Date(time.getTime() + 1000));
  const r = (await choices.nth(1).boundingBox())!;
  await page.mouse.click(r.x + r.width / 2, r.y + r.height / 2);
  await expect(page.locator('[data-committed="true"]')).toHaveCount(1);
  await expect(choices.first()).toBeDisabled();
  await expect(choices.nth(1)).toBeDisabled();
  await page.screenshot({ path: info.outputPath('choice-committed.png') });
  await page.clock.runFor(120);
  await expect(view(page)).toHaveAttribute('data-phase', 'line');
  await expect(page.locator('[data-demo-choice]')).toHaveCount(0);
});

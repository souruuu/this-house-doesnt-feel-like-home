import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { demoPortrait } from '../../src/world/demoStage';

test.use({ hasTouch: true });
const url = 'http://127.0.0.1:4174/nested/game/';
const button = (p: Page, name: string) =>
  p.getByRole('button', { name, exact: true });
const view = (p: Page) => p.locator('.demo-narrative');
async function stable(p: Page) {
  await expect(p.locator('.demo-day-transition')).toHaveCount(0);
  await expect(view(p)).not.toHaveAttribute('inert', '');
}
async function start(p: Page, instant = true, delay = 1) {
  await p.goto(url);
  await expect(p).toHaveTitle('บ้านที่ไม่รู้สึกเหมือนบ้าน');
  await button(p, 'Options').click();
  if (instant)
    await p.getByRole('checkbox', { name: 'แสดงข้อความทันที' }).check();
  const time = p.getByRole('slider', { name: 'Auto-Forward Time' });
  await time.focus();
  await p.keyboard.press('Home');
  if (delay === 2) {
    await p.keyboard.press('ArrowRight');
    await p.keyboard.press('ArrowRight');
  }
  await button(p, 'กลับหน้าหลัก').click();
  await button(p, 'Start').click();
  await expect(view(p)).toHaveAttribute('data-line-id', 'demo.D1N-L001');
}
async function resize(p: Page, width: number, height: number) {
  await p.setViewportSize({ width, height });
  if (!(await p.locator('.demo-shell').count())) return;
  const scale = Math.min(width / 1920, height / 1080);
  await expect(p.locator('.demo-shell')).toHaveAttribute(
    'data-compact',
    String(scale < 0.6),
  );
  await expect
    .poll(() =>
      p
        .locator('.logical-stage')
        .evaluate((el) => el.getBoundingClientRect().width),
    )
    .toBeCloseTo(scale * 1920, 0);
}
async function next(p: Page) {
  await stable(p);
  const id = await view(p).getAttribute('data-line-id');
  await expect(view(p)).toHaveAttribute('data-revealing', 'false');
  await button(p, 'อ่านต่อ').click();
  await expect
    .poll(
      async () =>
        `${await view(p).getAttribute('data-phase')}/${await view(p).getAttribute('data-line-id')}`,
    )
    .not.toBe(`line/${id}`);
}
async function reach(p: Page, id: string) {
  for (let step = 0; step < 70; step++) {
    await stable(p);
    if ((await view(p).getAttribute('data-line-id')) === id) return;
    if ((await view(p).getAttribute('data-phase')) === 'choice') {
      await p.locator('[data-demo-choice]').first().click();
      await expect(view(p)).toHaveAttribute('data-phase', 'line');
    } else await next(p);
  }
  throw new Error(`Did not reach ${id}`);
}
async function shot(p: Page, info: TestInfo, name: string) {
  await p.screenshot({ path: info.outputPath(name + '.png') });
}

for (const viewport of [
  { width: 1920, height: 1080 },
  { width: 1280, height: 720 },
  { width: 844, height: 390 },
]) {
  test(`B dialogue/choice composition and input ${viewport.width}x${viewport.height}`, async ({
    page,
  }, info) => {
    test.setTimeout(60_000);
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('response', (r) => {
      if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
    });
    await start(page);
    await reach(page, 'demo.D101-L003');
    await expect(page.locator('.demo-speaker')).toHaveText('เด็กหญิง');
    const world = page.locator('[data-world-character-cue]');
    await expect(world).toHaveAttribute(
      'data-world-character-cue',
      viewport.width === 844 ? '' : 'เด็กหญิง',
    );
    const panel = page.locator('.demo-dialogue'),
      footer = page.locator('.demo-dialogue-footer');
    const stage = (await page.locator('.logical-stage').boundingBox())!;
    const scale = stage.width / 1920;
    const header = (await page.locator('.demo-speaker-header').boundingBox())!;
    const body = page.locator('.demo-text-scroll');
    const text = (await body.boundingBox())!;
    const foot = (await footer.boundingBox())!;
    const bounds = (await panel.boundingBox())!;
    expect(header.y + header.height).toBeLessThanOrEqual(text.y);
    expect(text.y + text.height).toBeLessThanOrEqual(foot.y);
    expect(foot.y + foot.height).toBeLessThanOrEqual(bounds.y + bounds.height);
    expect(bounds.height).toBeLessThan(viewport.height * 0.34);
    expect(
      await page
        .locator('.demo-text')
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
    ).toBeGreaterThanOrEqual(16 / scale);
    for (const name of ['Skip — ยังไม่พร้อม', 'Auto', 'อ่านต่อ']) {
      const r = (await button(page, name).boundingBox())!;
      expect(r.height).toBeGreaterThanOrEqual(43.9);
      expect(r.width).toBeGreaterThanOrEqual(43.9);
      expect(r.x + r.width).toBeLessThanOrEqual(stage.x + stage.width);
    }
    await expect(button(page, 'Skip — ยังไม่พร้อม')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await expect(button(page, 'Auto')).toHaveAttribute('aria-pressed', 'false');
    await shot(page, info, `speaker-${viewport.width}`);
    // CSS stress only; Instant mode avoids timer writes during the temporary DOM mutation.
    const original = await page.locator('.demo-text').textContent();
    await page.locator('.demo-text').evaluate((el) => {
      el.textContent =
        'ข้อความทดสอบการเลื่อนภาษาไทยพร้อมสระและวรรณยุกต์ '.repeat(120);
    });
    const size = await body.evaluate((el) => ({
      client: el.clientHeight,
      scroll: el.scrollHeight,
      width: el.clientWidth,
      scrollWidth: el.scrollWidth,
    }));
    expect(size.scroll).toBeGreaterThan(size.client);
    expect(size.scrollWidth).toBeLessThanOrEqual(size.width + 1);
    const headerBeforeScroll = (await page
      .locator('.demo-speaker-header')
      .boundingBox())!;
    await body.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    expect(await body.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
    expect((await footer.boundingBox())!.y).toBe(foot.y);
    expect((await page.locator('.demo-speaker-header').boundingBox())!.y).toBe(
      headerBeforeScroll.y,
    );
    await page.locator('.demo-text').evaluate((el, t) => {
      el.textContent = t;
    }, original);
    await next(page);
    await expect(page.locator('.demo-speaker-header')).toHaveCount(0);
    await expect(world).toHaveAttribute('data-world-character-cue', '');
    await shot(page, info, `narrator-${viewport.width}`);
    expect((await panel.boundingBox())!.height).toBeLessThan(bounds.height);
    await next(page);
    const choices = page.locator('[data-demo-choice]');
    await expect(choices).toHaveCount(2); // Actual approved first shop choice, not mockup count.
    const cb = (await page.locator('.demo-choices').boundingBox())!;
    expect(cb.x).toBeGreaterThan(stage.x + demoPortrait.x * scale);
    expect(cb.x + cb.width).toBeLessThan(
      stage.x + (demoPortrait.x + demoPortrait.width) * scale,
    );
    expect(cb.y + cb.height).toBeLessThan((await panel.boundingBox())!.y);
    await expect(choices.first()).toBeFocused();
    await expect(button(page, 'Auto')).toBeEnabled();
    await expect(button(page, 'อ่านต่อ')).toBeDisabled();
    await view(page).focus();
    await page.keyboard.press('Enter');
    await expect(view(page)).toHaveAttribute('data-phase', 'choice');
    await choices.first().focus();
    await page.keyboard.press('ArrowDown');
    await expect(choices.nth(1)).toBeFocused();
    await shot(page, info, `choice-focus-${viewport.width}`);
    if (viewport.width === 844) await choices.nth(1).tap();
    else if (viewport.width === 1280) await page.keyboard.press('Space');
    else {
      const pos = (await choices.nth(1).boundingBox())!;
      await page.mouse.move(pos.x + 20, pos.y + 20);
      await page.mouse.down();
      await expect(choices.nth(1)).toHaveCSS(
        'background-color',
        'rgb(52, 76, 91)',
      );
      await shot(page, info, 'choice-pressed-1920');
      await page.mouse.up();
    }
    await expect(view(page)).toHaveAttribute('data-line-id', 'demo.D101-L005B');
    await expect(button(page, 'อ่านต่อ')).toBeFocused();
    expect(errors).toEqual([]);
  });
}

test('Auto waits full reveal and delay, retains choice intent, resumes after manual choice', async ({
  page,
}, info) => {
  test.setTimeout(45_000);
  await start(page, false, 2);
  await expect(view(page)).toHaveAttribute('data-revealing', 'true');
  await shot(page, info, 'mid-reveal');
  await button(page, 'Auto').click();
  await expect(button(page, 'Auto')).toHaveAttribute('aria-pressed', 'true');
  await expect(view(page)).toHaveAttribute('data-line-id', 'demo.D1N-L001');
  await expect(view(page)).toHaveAttribute('data-revealing', 'false');
  await page.waitForTimeout(650); // The selected two-second delay begins after full reveal, not when Auto is enabled.
  await expect(view(page)).toHaveAttribute('data-line-id', 'demo.D1N-L001');
  await expect(view(page)).toHaveAttribute('data-line-id', 'demo.D1N-L002', {
    timeout: 3000,
  });
  await expect(view(page)).toHaveAttribute('data-phase', 'choice', {
    timeout: 7000,
  });
  await expect(button(page, 'Auto')).toHaveAttribute('aria-pressed', 'true');
  await expect(view(page)).toHaveAttribute(
    'data-auto-execution',
    'waiting-choice',
  );
  await shot(page, info, 'auto-waiting');
  const revision = await view(page).getAttribute('data-view-revision');
  await view(page).focus();
  await page.keyboard.press('Enter');
  await expect(view(page)).toHaveAttribute(
    'data-auto-execution',
    'waiting-choice',
  );
  await expect(button(page, 'Auto')).toHaveAttribute('aria-pressed', 'true');
  await page.waitForTimeout(2200);
  await expect(view(page)).toHaveAttribute('data-phase', 'choice');
  await expect(view(page)).toHaveAttribute('data-view-revision', revision!);
  await page.locator('[data-demo-choice]').first().click();
  await expect(view(page)).toHaveAttribute('data-line-id', 'demo.D1P-L001');
  await expect(button(page, 'Auto')).toHaveAttribute('aria-pressed', 'true');
  await expect(view(page)).toHaveAttribute('data-revealing', 'false');
  await page.waitForTimeout(650);
  await expect(view(page)).toHaveAttribute('data-line-id', 'demo.D1P-L001');
  await expect(view(page)).toHaveAttribute('data-line-id', 'demo.D1P-L002', {
    timeout: 4000,
  });
  await shot(page, info, 'auto-resumed');
  // Use a long line at slow speed so transport latency cannot finish the short
  // prologue before the manual key reaches the browser. Keep the same assertions.
  await button(page, 'พัก').click();
  await button(page, 'Options').click();
  await page.getByRole('slider', { name: 'Text Speed' }).focus();
  await page.keyboard.press('Home');
  await button(page, 'กลับเมนูเกม').click();
  await button(page, 'กลับหน้าหลัก').click();
  await button(page, 'Start').click();
  await expect(view(page)).toHaveAttribute('data-line-id', 'demo.D1N-L001');
  await expect(view(page)).toHaveAttribute('data-revealing', 'true');
  const id = await view(page).getAttribute('data-line-id');
  await button(page, 'Auto').press('Enter');
  await expect(view(page)).toHaveAttribute('data-revealing', 'true');
  await button(page, 'อ่านต่อ').press('Enter');
  await expect(button(page, 'Auto')).toHaveAttribute('aria-pressed', 'false');
  await expect(view(page)).toHaveAttribute('data-line-id', id!);
  await expect(view(page)).toHaveAttribute('data-revealing', 'false');
  await shot(page, info, 'full-reveal-after-manual');
  await button(page, 'อ่านต่อ').click();
  await expect(view(page)).toHaveAttribute('data-line-id', 'demo.D1N-L002');
});

test('B Auto cancels without catch-up on pause/options, hidden, blur, portrait and new run', async ({
  page,
}, info) => {
  test.setTimeout(45_000);
  await start(page);
  const id = await view(page).getAttribute('data-line-id');
  await button(page, 'Auto').click();
  await button(page, 'พัก').click();
  await expect(page.locator('.demo-main-surface')).toHaveAttribute('inert', '');
  await expect(button(page, 'Auto')).toBeDisabled();
  await expect(view(page)).toHaveAttribute('data-auto', 'false');
  await shot(page, info, 'pause');
  await button(page, 'Options').click();
  await button(page, 'กลับเมนูเกม').click();
  await button(page, 'เล่นต่อ').click();
  await expect(button(page, 'Auto')).toHaveAttribute('aria-pressed', 'false');
  for (const signal of ['hidden', 'blur', 'portrait']) {
    await button(page, 'Auto').click();
    if (signal === 'hidden')
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', {
          configurable: true,
          value: true,
        });
        document.dispatchEvent(new Event('visibilitychange'));
      });
    if (signal === 'blur')
      await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    if (signal === 'portrait')
      await page.setViewportSize({ width: 390, height: 844 });
    await expect(view(page)).toHaveAttribute('data-auto', 'false');
    if (signal === 'portrait') {
      await expect(page.getByRole('alert')).toContainText('กรุณาหมุนอุปกรณ์');
      await shot(page, info, 'portrait-guard');
    }
    await page.waitForTimeout(1150);
    await expect(view(page)).toHaveAttribute('data-line-id', id!);
    if (signal === 'hidden')
      await page.evaluate(() => {
        Reflect.deleteProperty(document, 'hidden');
        document.dispatchEvent(new Event('visibilitychange'));
      });
    if (signal === 'blur')
      await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    if (signal === 'portrait')
      await page.setViewportSize({ width: 844, height: 390 });
    await stable(page);
    await expect(button(page, 'Auto')).toHaveAttribute('aria-pressed', 'false');
  }
  await button(page, 'Auto').click();
  const oldRun = await view(page).getAttribute('data-run-id');
  await button(page, 'พัก').click();
  await button(page, 'กลับหน้าหลัก').click();
  await button(page, 'Start').click();
  await expect(view(page)).not.toHaveAttribute('data-run-id', oldRun!);
  await page.waitForTimeout(1200);
  await expect(view(page)).toHaveAttribute('data-line-id', 'demo.D1N-L001');
  await expect(button(page, 'Auto')).toHaveAttribute('aria-pressed', 'false');
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
});

test('B approved route proves day-only cards, named cues/knowledge guard, longest Thai line, wrapped choice and terminal line', async ({
  page,
}, info) => {
  test.setTimeout(180_000);
  await resize(page, 1280, 720);
  await start(page);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  const days = new Set<string>(),
    cues = new Set<string>();
  const lighting = new Set<string>();
  let longest = false,
    anonymous = false,
    wrapped = false;
  for (let step = 0; step < 240; step++) {
    // Batch public DOM reads. Per-locator protocol latency is not narrative timing.
    const snapshot = await view(page).evaluate((el) => ({
      id: el.getAttribute('data-line-id'),
      phase: el.getAttribute('data-phase'),
      day: el.querySelector('.demo-day')?.textContent,
      transition: el.getAttribute('data-transition'),
      inert: el.hasAttribute('inert'),
      revealing: el.getAttribute('data-revealing'),
      cue: document.querySelector<HTMLElement>('[data-world-character-cue]')
        ?.dataset.worldCharacterCue,
    }));
    const id = snapshot.id,
      day = snapshot.day;
    const light = id?.startsWith('demo.D103-')
      ? 'evening'
      : id?.startsWith('demo.D302-')
        ? 'night'
        : id?.startsWith('demo.D101-')
          ? 'morning'
          : null;
    if (
      light &&
      !lighting.has(light) &&
      snapshot.phase === 'line' &&
      !snapshot.transition &&
      !snapshot.inert
    ) {
      lighting.add(light);
      await shot(page, info, `lighting-${light}`);
    }

    const digit = day?.match(/[123]/)?.[0];
    if (digit && !days.has(digit)) {
      days.add(digit);
      await expect(page.locator('.demo-day-transition')).toHaveAttribute(
        'data-day-transition',
        digit,
      );
      if (digit === '2')
        await expect(page.locator('.demo-day-transition')).toHaveCSS(
          'animation-name',
          'none',
        );
      await shot(page, info, `day-${digit}`);
    }
    if (snapshot.transition || snapshot.inert) await stable(page);
    const phase = snapshot.phase;
    const cue = snapshot.cue;
    if (cue) cues.add(cue);
    if (id === 'demo.D103-L014')
      await page.emulateMedia({ reducedMotion: 'reduce' });
    if (id === 'demo.D201-L001')
      await page.emulateMedia({ reducedMotion: 'no-preference' });
    if (id === 'demo.D202-L007A') {
      longest = true;
      await resize(page, 844, 390);
      await expect(page.locator('.demo-text')).toContainText(
        'ก่อนเก็บทั้งสองอย่างลงถุง',
      );
      await expect(page.locator('.demo-speaker-header')).toHaveCount(0);
      await shot(page, info, 'longest-approved-thai-mobile');
      const body = page.locator('.demo-text-scroll');
      expect(
        await body.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
      ).toBe(true);
      await body.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
      await shot(page, info, 'longest-approved-thai-mobile-scrolled');
      await resize(page, 1280, 720);
      await shot(page, info, 'longest-approved-thai-desktop');
    }
    if (id === 'demo.D303-L010A') {
      anonymous = true;
      await expect(page.locator('.demo-speaker')).toHaveText('เด็กชายที่ชายคา');
      await expect(page.locator('[data-world-character-cue]')).toHaveAttribute(
        'data-world-character-cue',
        'เด็กชายที่ชายคา',
      );
      await shot(page, info, 'kan-disclosure-anonymous-cue');
    }
    if (id === 'demo.D303-L015') {
      await button(page, 'Auto').click();
      await expect(view(page)).toHaveAttribute(
        'data-line-id',
        'demo.D3E-L001',
        { timeout: 4000 },
      );
      await expect(button(page, 'Auto')).toHaveAttribute(
        'aria-pressed',
        'false',
      );
      await expect(button(page, 'Auto')).toBeDisabled();
      await page.waitForTimeout(1200);
      await expect(view(page)).toHaveAttribute('data-line-id', 'demo.D3E-L001');
      await next(page);
      await expect(view(page)).toHaveAttribute('data-line-id', 'demo.D3E-L002');
      await page.waitForTimeout(1200);
      await expect(view(page)).toHaveAttribute('data-phase', 'line');
      await shot(page, info, 'terminal-readable-line');
      await next(page);
      await expect(view(page)).toHaveAttribute('data-phase', 'ended');
      await expect(button(page, 'Auto')).toHaveAttribute(
        'aria-pressed',
        'false',
      );
      break;
    }
    if (phase === 'choice') {
      const options = page.locator('[data-demo-choice]');
      const first = await options.first().getAttribute('data-demo-choice');
      if (first?.startsWith('demo.D303-C01')) {
        wrapped = true;
        await resize(page, 844, 390);
        await options.nth(1).focus();
        await shot(page, info, 'wrapped-choice-mobile');
        const bounds = await page.evaluate(() => {
          const stack = document
            .querySelector('.demo-choices')!
            .getBoundingClientRect();
          const panel = document
            .querySelector('.demo-dialogue')!
            .getBoundingClientRect();
          return { bottom: stack.bottom, panelTop: panel.top };
        });
        expect(bounds.bottom).toBeLessThan(bounds.panelTop);
        await resize(page, 1280, 720);
      }
      if (first?.startsWith('demo.D202-C01')) await options.nth(1).click();
      else await options.first().click();
      await expect(view(page)).toHaveAttribute('data-phase', 'line');
    } else {
      expect(snapshot.revealing).toBe('false'); // This route explicitly selected Instant Text.
      await button(page, 'อ่านต่อ').click();
      await expect
        .poll(() =>
          view(page).evaluate(
            (el) =>
              `${el.getAttribute('data-phase')}/${el.getAttribute('data-line-id')}`,
          ),
        )
        .not.toBe(`line/${id}`);
    }
  }
  expect([...days]).toEqual(['1', '2', '3']);
  expect(longest && anonymous && wrapped).toBe(true);
  for (const name of ['มะนาว', 'ส้ม', 'นัท', 'เด็กชายที่ชายคา'])
    expect(cues.has(name)).toBe(true);
  await expect(view(page)).toHaveAttribute('data-phase', 'ended');
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
});

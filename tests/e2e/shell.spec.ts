import { expect, test } from '@playwright/test';

test('Thai shell, shared bounds, remount, pause and keyboard ownership', async ({
  page,
}, testInfo) => {
  await page.addInitScript(() => {
    const active = new Set<EventListenerOrEventListenerObject>();
    const add = document.addEventListener;
    const remove = document.removeEventListener;
    document.addEventListener = function (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) {
      if (type === 'visibilitychange') active.add(listener);
      add.call(this, type, listener, options);
    };
    document.removeEventListener = function (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions,
    ) {
      if (type === 'visibilitychange') active.delete(listener);
      remove.call(this, type, listener, options);
    };
    Object.defineProperty(window, '__m0VisibilityListeners', {
      get: () => active.size,
    });
  });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  await page.goto('/');
  await expect(page).toHaveTitle('บ้านที่ไม่รู้สึกเหมือนบ้าน');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('[data-world-state="ready"]')).toHaveCount(1);
  await expect(page.locator('canvas')).toHaveCount(1);
  const listenerCount = () =>
    page.evaluate(
      () =>
        (window as unknown as { __m0VisibilityListeners: number })
          .__m0VisibilityListeners,
    );
  const mountedListeners = await listenerCount();
  await expect(page.locator('vite-error-overlay')).toHaveCount(0);
  for (const size of [
    { width: 1000, height: 1000 },
    { width: 844, height: 390 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(size);
    await expect
      .poll(async () => {
        const canvas = await page.locator('canvas').boundingBox();
        const overlay = await page.locator('.ui-overlay').boundingBox();
        return (
          canvas &&
          overlay &&
          Math.abs(canvas.width / canvas.height - 16 / 9) < 0.001 &&
          Math.abs(canvas.width - overlay.width) < 1 &&
          Math.abs(canvas.height - overlay.height) < 1 &&
          canvas.width <= size.width &&
          canvas.height <= size.height
        );
      })
      .toBeTruthy();
  }
  await page.getByRole('button', { name: 'พัก', exact: true }).click();
  await expect(page.locator('[data-world-paused="true"]')).toHaveCount(1);
  // Closing a paused game must still destroy it and allow repeated remounts.
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: 'ปิดฉากทดสอบ' }).click();
    await expect(page.locator('canvas')).toHaveCount(0);
    await expect.poll(listenerCount).toBe(mountedListeners - 1);
    await page.getByRole('button', { name: 'เปิดฉากทดสอบ' }).click();
    await expect(page.locator('canvas')).toHaveCount(1);
    await expect(page.locator('[data-world-paused="true"]')).toHaveCount(1);
    await expect.poll(listenerCount).toBe(mountedListeners);
  }
  await page.getByRole('button', { name: 'เล่นต่อ', exact: true }).click();
  await expect(page.locator('[data-world-state="ready"]')).toHaveCount(1);
  await page.getByRole('button', { name: 'เต็มจอ', exact: true }).focus();
  await page.keyboard.press('Escape');
  await expect(page.locator('.game-shell')).toHaveAttribute(
    'data-paused',
    'false',
  );
  await page.evaluate(() => (document.activeElement as HTMLElement).blur());
  await page.keyboard.press('Escape');
  await expect(page.locator('.game-shell')).toHaveAttribute(
    'data-paused',
    'true',
  );
  await page.keyboard.press('Escape');
  await expect(page.locator('.game-shell')).toHaveAttribute(
    'data-paused',
    'false',
  );
  // Denied fullscreen must leave fit mode usable.
  await page.evaluate(() => {
    document.documentElement.requestFullscreen = () =>
      Promise.reject(new Error('denied'));
    document.querySelector<HTMLElement>('.game-shell')!.requestFullscreen =
      document.documentElement.requestFullscreen;
  });
  await page.getByRole('button', { name: 'เต็มจอ', exact: true }).click();
  await expect(page.locator('.ui-panel > [role="status"]')).toContainText(
    'ไม่สามารถแสดงเต็มจอได้',
  );
  await page.screenshot({
    path: testInfo.outputPath('desktop.png'),
  });
  expect(errors).toEqual([]);
});

test('touch portrait blocks UI and pauses world; landscape uses same shell', async ({
  browser,
}, testInfo) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173');
  await expect(page.getByRole('alert')).toContainText(
    'กรุณาหมุนอุปกรณ์เป็นแนวนอนเพื่อเล่น',
  );
  await expect(page.locator('.ui-overlay')).toHaveAttribute('inert', '');
  await expect(page.locator('[data-world-paused="true"]')).toHaveCount(1);
  await page.screenshot({
    path: testInfo.outputPath('portrait.png'),
  });
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.locator('[data-world-state="ready"]')).toHaveCount(1);
  await expect(page.locator('[data-world-paused="false"]')).toHaveCount(1);
  await page.getByRole('button', { name: 'พัก', exact: true }).tap();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(
    page.getByRole('button', { name: 'เล่นต่อ', exact: true }),
  ).toBeVisible();
  await expect(page.locator('[data-world-paused="true"]')).toHaveCount(1);
  await page.screenshot({
    path: testInfo.outputPath('landscape.png'),
  });
  await context.close();
});

import { expect, test } from '@playwright/test';

for (const route of [
  'accept-and-name',
  'decline-and-anonymous',
  'budget-and-name',
]) {
  test(`production Day 1-3 completes: ${route}`, async ({ page }, testInfo) => {
    test.setTimeout(180_000); // Full approved story, not a short component smoke test.
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => {
      if (response.status() >= 400)
        errors.push(`${response.status()} ${response.url()}`);
    });
    await page.goto('http://127.0.0.1:4174/nested/game/');
    await expect(
      page.getByRole('heading', { name: 'บ้านที่ไม่รู้สึกเหมือนบ้าน' }),
    ).toBeVisible();
    await expect(page.locator('[data-world-state="ready"]')).toHaveCount(1);
    await expect(page.locator('canvas')).toHaveCount(1);
    await page.screenshot({ path: testInfo.outputPath('menu.png') });
    await page.getByRole('button', { name: 'เริ่มเกม', exact: true }).click();
    const narrative = page.getByRole('region', { name: 'บทสนทนา' });
    await expect(narrative).toHaveAttribute('data-line-id', 'demo.D1N-L001');
    await page.getByRole('button', { name: 'พัก', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'พักเกม' })).toBeVisible();
    await expect(narrative).toHaveAttribute('inert', '');
    await page.getByRole('button', { name: 'เล่นต่อ', exact: true }).click();
    const visited = new Set<string>();
    const choices = new Set<string>();
    let previous = '';
    for (let step = 0; step < 250; step++) {
      await expect(narrative).not.toHaveAttribute('data-phase', 'error');
      const phase = await narrative.getAttribute('data-phase');
      const id = (await narrative.getAttribute('data-line-id')) ?? '';
      if (phase === 'ended') break;
      if (phase === 'line') {
        visited.add(id);
        expect(id).not.toBe(previous);
        if (id === 'demo.D303-L010A')
          await expect(page.locator('.demo-speaker')).toHaveText(
            'เด็กชายที่ชายคา',
          );
        if (!visited.has('demo.D303-L010A'))
          await expect(narrative).not.toContainText('กันต์');
        if (id === 'demo.D202-L007A')
          await page.screenshot({ path: testInfo.outputPath('dialogue.png') });
        if (id === 'demo.D303-L015')
          await page.setViewportSize({ width: 844, height: 390 });
        previous = id;
        await page
          .getByRole('button', { name: 'อ่านต่อ', exact: true })
          .click();
        // Choices/ended retain the last readable line; they must still change phase.
        await expect
          .poll(
            async () =>
              `${await narrative.getAttribute('data-phase')}:${await narrative.getAttribute('data-line-id')}`,
          )
          .not.toBe(`line:${id}`);
      } else if (phase === 'choice') {
        const options = page.locator('[data-demo-choice]');
        const first = (await options.first().getAttribute('data-demo-choice'))!;
        const group = first.slice(0, -2);
        let branch = 'A';
        if (route === 'decline-and-anonymous') branch = 'B';
        if (route === 'accept-and-name' && group === 'demo.D202-C01')
          branch = 'B';
        if (route === 'budget-and-name' && group === 'demo.D303-C01')
          branch = 'B';
        const selected = page.locator(
          `[data-demo-choice="${group}-${branch}"]`,
        );
        const target = (await selected.count()) ? selected : options.first();
        choices.add((await target.getAttribute('data-demo-choice'))!);
        if (group === 'demo.D202-C01')
          await page.screenshot({ path: testInfo.outputPath('choices.png') });
        await target.click();
        await expect(narrative).toHaveAttribute('data-phase', 'line');
      } else throw new Error(`Unexpected phase ${phase}`);
    }
    await expect(narrative).toHaveAttribute('data-phase', 'ended');
    expect(visited.has('demo.D203-L003T')).toBe(
      route !== 'decline-and-anonymous',
    );
    expect(visited.has('demo.D203-L003F')).toBe(
      route === 'decline-and-anonymous',
    );
    expect(visited.has('demo.D303-L010A')).toBe(
      route !== 'decline-and-anonymous',
    );
    const som =
      route === 'accept-and-name'
        ? 'A'
        : route === 'budget-and-name'
          ? 'P'
          : 'N';
    expect(visited.has(`demo.D202-L007${som}`)).toBe(true);
    for (const scene of [
      '101',
      '102',
      '103',
      '201',
      '202',
      '203',
      '301',
      '302',
      '303',
    ])
      expect(visited.has(`demo.D${scene}-L001`)).toBe(true);
    expect(choices.size).toBeGreaterThanOrEqual(12);
    await page.screenshot({
      path: testInfo.outputPath('ending-landscape.png'),
    });
    await expect(
      page.getByRole('button', { name: 'กลับหน้าหลัก', exact: true }),
    ).toBeVisible();
    await page
      .getByRole('button', { name: 'กลับหน้าหลัก', exact: true })
      .click();
    await expect(
      page.getByRole('button', { name: 'เริ่มเกม', exact: true }),
    ).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('production touch portrait pauses input; landscape and reload start remain honest', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4174/nested/game/');
  await expect(page.getByRole('alert')).toContainText('กรุณาหมุนอุปกรณ์');
  await expect(page.locator('.demo-overlay')).toHaveAttribute('inert', '');
  await page.setViewportSize({ width: 844, height: 390 });
  await page.getByRole('button', { name: 'เริ่มเกม', exact: true }).tap();
  await expect(page.locator('[data-line-id="demo.D1N-L001"]')).toHaveCount(1);
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'เริ่มเกม', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('เดโมนี้ยังไม่บันทึกความคืบหน้า', { exact: false }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      Object.keys(localStorage).filter((key) =>
        key.startsWith('this-house:technical-fixture'),
      ),
    ),
  ).toEqual([]);
  await context.close();
});

import { expect, test } from '@playwright/test';

test('fixture branch/rejoin uses keyboard and stable identities without errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/?fixture=1');
  const region = page.getByRole('region', { name: 'ทดสอบระบบข้อความ' });
  await expect(region).toHaveAttribute('data-line-id', 'fixture_start_001');
  await region.focus();
  await page.keyboard.press('Enter');
  await expect(region).toHaveAttribute('data-fixture-phase', 'choice');
  await expect(region).toHaveAttribute('data-notifications', '1');
  await page.keyboard.press('ArrowDown');
  await expect(
    page.getByRole('button', { name: 'เลือกเส้นทางทดสอบหนึ่ง' }),
  ).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(
    page.getByRole('button', { name: 'เลือกเส้นทางทดสอบสอง' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(region).toHaveAttribute('data-line-id', 'fixture_branch_b_001');
  await expect(region).toHaveAttribute('data-effects', '1');
  await expect(region).toHaveAttribute(
    'data-ledger',
    'fixture.domain.branch_b',
  );
  await region.focus();
  await page.keyboard.press('Space');
  await expect(region).toHaveAttribute('data-line-id', 'fixture_rejoin_001');
  await expect(region.locator('.fixture-line')).toContainText(
    'ยืนยันข้อมูลหลังบันทึก',
  );
  await expect(region).toHaveAttribute('data-notifications', '2');
  await page.getByRole('button', { name: 'อ่านต่อ', exact: true }).click();
  await expect(region).toHaveAttribute('data-line-id', 'fixture_end_001');
  await expect(region).toHaveAttribute('data-effects', '2');
  await expect(region).toHaveAttribute('data-fixture-phase', 'line');
  await expect(region.locator('[data-choice]')).toHaveCount(0);
  await expect(region).toHaveAttribute('data-notifications', '2');
  await expect(page.getByText('จบชุดทดสอบ', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'อ่านต่อ', exact: true }).click();
  await expect(region).toHaveAttribute('data-fixture-phase', 'ended');
  await expect(region).toHaveAttribute('data-notifications', '2');
  await expect(region.locator('[data-choice]')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'อ่านต่อ', exact: true }),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('StrictMode, double input and UI remount preserve a run; explicit new run isolates it', async ({
  page,
}) => {
  await page.goto('/?fixture=1');
  const region = page.getByRole('region', { name: 'ทดสอบระบบข้อความ' });
  await expect(region).toHaveAttribute('data-line-id', 'fixture_start_001');
  await expect(region).toHaveAttribute('data-notifications', '0');
  await page.getByRole('button', { name: 'อ่านต่อ', exact: true }).dblclick();
  await expect(region).toHaveAttribute('data-fixture-phase', 'choice');
  await expect(region).toHaveAttribute('data-notifications', '1');
  await page.getByRole('button', { name: 'เลือกเส้นทางทดสอบหนึ่ง' }).click();
  await expect(region).toHaveAttribute('data-line-id', 'fixture_branch_a_001');
  await page.getByRole('button', { name: 'พัก', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('button', { name: 'อ่านต่อ', exact: true }),
  ).toBeDisabled();
  await expect(region).toHaveAttribute('data-line-id', 'fixture_branch_a_001');
  await page.getByRole('button', { name: 'เล่นต่อ', exact: true }).click();
  const session = await region.getAttribute('data-session');
  const run = await region.getAttribute('data-run');
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: 'ปิดฉากทดสอบ' }).click();
    await expect(region).toHaveCount(0);
    await page.getByRole('button', { name: 'เปิดฉากทดสอบ' }).click();
    await expect(region).toHaveAttribute(
      'data-line-id',
      'fixture_branch_a_001',
    );
    await expect(region).toHaveAttribute('data-session', session ?? '');
    await expect(region).toHaveAttribute('data-run', run ?? '');
    await expect(region).toHaveAttribute('data-effects', '1');
    await expect(region).toHaveAttribute(
      'data-ledger',
      'fixture.domain.branch_a',
    );
    await expect(region).toHaveAttribute('data-notifications', '1');
    await expect(page.locator('[data-world-state="ready"]')).toHaveCount(1);
  }
  await page
    .getByRole('button', { name: 'เริ่มรอบทดสอบใหม่', exact: true })
    .click();
  await expect(region).toHaveAttribute('data-line-id', 'fixture_start_001');
  await expect(region).not.toHaveAttribute('data-session', session ?? '');
  await expect(region).not.toHaveAttribute('data-run', run ?? '');
  await expect(region).toHaveAttribute('data-effects', '0');
  await expect(region).toHaveAttribute('data-ledger', '');
  await expect(region).toHaveAttribute('data-notifications', '0');
});

test('touch portrait, pause, hidden state and key repeats guard fixture input', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/?fixture=1');
  await expect(page.getByRole('alert')).toContainText(
    'กรุณาหมุนอุปกรณ์เป็นแนวนอนเพื่อเล่น',
  );
  await expect(page.locator('.ui-overlay')).toHaveAttribute('inert', '');
  await page.setViewportSize({ width: 844, height: 390 });
  const region = page.getByRole('region', { name: 'ทดสอบระบบข้อความ' });
  await expect(region).toHaveAttribute('data-line-id', 'fixture_start_001');
  await region.focus();
  await region.dispatchEvent('keydown', { key: 'Enter', repeat: true });
  await expect(region).toHaveAttribute('data-line-id', 'fixture_start_001');
  await page.getByRole('button', { name: 'อ่านต่อ', exact: true }).tap();
  await expect(region).toHaveAttribute('data-fixture-phase', 'choice');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.ui-overlay')).toHaveAttribute('inert', '');
  await page.setViewportSize({ width: 844, height: 390 });
  await page.getByRole('button', { name: 'เลือกเส้นทางทดสอบหนึ่ง' }).tap();
  await expect(region).toHaveAttribute('data-line-id', 'fixture_branch_a_001');
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: true,
    });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(
    page.getByRole('button', { name: 'อ่านต่อ', exact: true }),
  ).toBeDisabled();
  await region.dispatchEvent('keydown', { key: 'Enter' });
  await expect(region).toHaveAttribute('data-line-id', 'fixture_branch_a_001');
  await page.evaluate(() => {
    Reflect.deleteProperty(document, 'hidden');
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(
    page.getByRole('button', { name: 'อ่านต่อ', exact: true }),
  ).toBeEnabled();
  await context.close();
});

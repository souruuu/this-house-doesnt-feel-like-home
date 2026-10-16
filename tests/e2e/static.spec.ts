import { expect, test } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';

test('same static dist runs at a nested path inside an iframe', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400)
      errors.push(`${response.status()} ${response.url()}`);
  });
  await page.goto('http://127.0.0.1:4174/iframe');
  const game = page.frameLocator('iframe');
  await expect(
    game.getByRole('heading', { name: 'บ้านที่ไม่รู้สึกเหมือนบ้าน' }),
  ).toBeVisible();
  await expect(game.locator('[data-world-state="ready"]')).toHaveCount(1);
  await expect(game.locator('canvas')).toHaveCount(1);
  await expect(game.locator('[data-fixture-phase]')).toHaveCount(0);
  await game.getByRole('button', { name: 'เริ่มเกม', exact: true }).click();
  await expect(game.locator('[data-line-id="demo.D1N-L001"]')).toHaveCount(1);
  await game.getByRole('button', { name: 'พัก', exact: true }).click();
  await expect(game.locator('[data-world-paused="true"]')).toHaveCount(1);
  await game.getByRole('button', { name: 'เล่นต่อ', exact: true }).click();
  await expect(game.locator('[data-world-paused="false"]')).toHaveCount(1);
  const html = readFileSync('dist/index.html', 'utf8');
  expect(html).toContain('./assets/');
  expect(html).not.toContain('src="/assets/');
  // Fixture bytecode and compiler must not be shipped in the release shell.
  for (const file of readdirSync('dist/assets').filter((name) =>
    name.endsWith('.js'),
  )) {
    const code = readFileSync(`dist/assets/${file}`, 'utf8');
    expect(code).not.toContain('m0_probe_line_001');
    expect(code).not.toContain('fixture_start_001');
    expect(code).not.toContain('fixture.presentation.started');
    expect(code).not.toContain('fixture.domain.branch_a');
    expect(code).not.toContain('fixture.branch_committed');
    expect(code).not.toContain('เริ่มรอบทดสอบใหม่');
    expect(code).not.toContain('ทดสอบระบบข้อความ');
    expect(code).not.toContain('technical_fixture');
    expect(code).not.toContain('class InkParser');
  }
  expect(errors).toEqual([]);
});

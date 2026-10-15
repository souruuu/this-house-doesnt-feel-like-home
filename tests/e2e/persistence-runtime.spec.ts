import { expect, test, type Page } from '@playwright/test';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const autoKey = 'this-house:technical-fixture:slot:autosave';
const profileKey = 'this-house:technical-fixture:profile';
const region = (page: Page) =>
  page.getByRole('region', { name: 'ทดสอบระบบข้อความ' });
async function ready(page: Page) {
  await expect(page.locator('[data-runtime-busy]')).toHaveAttribute(
    'data-runtime-busy',
    'false',
  );
}
async function decision(page: Page) {
  await expect(page.locator('[data-runtime-phase]')).toHaveAttribute(
    'data-runtime-phase',
    'awaiting-decision',
  );
  await expect(region(page)).toHaveCount(0);
}
async function start(page: Page) {
  await decision(page);
  await page
    .getByRole('button', { name: 'เริ่มรอบทดสอบใหม่', exact: true })
    .click();
  await ready(page);
}
async function resume(page: Page) {
  await decision(page);
  await page
    .getByRole('button', { name: 'เล่นต่อจาก Autosave', exact: true })
    .click();
  await ready(page);
}
async function bytes(page: Page) {
  return page.evaluate((key) => localStorage.getItem(key), autoKey);
}

for (const branch of [0, 1])
  test(`page reload resumes saved line, choice and branch ${branch} without replay`, async ({
    page,
  }) => {
    await page.goto('/');
    await decision(page);
    expect(await bytes(page)).toBeNull();
    await start(page);
    const run = await region(page).getAttribute('data-run');
    const firstSession = await region(page).getAttribute('data-session');
    const firstBytes = await bytes(page);
    await page.reload();
    await decision(page);
    expect(await bytes(page)).toBe(firstBytes);
    await resume(page);
    await expect(region(page)).toHaveAttribute(
      'data-line-id',
      'fixture_start_001',
    );
    await expect(region(page)).toHaveAttribute('data-run', run!);
    await expect(region(page)).not.toHaveAttribute(
      'data-session',
      firstSession!,
    );
    await expect(region(page)).toHaveAttribute('data-notifications', '0');
    expect(await bytes(page)).toBe(firstBytes);
    await page.getByRole('button', { name: 'อ่านต่อ', exact: true }).click();
    await ready(page);
    const choiceBytes = await bytes(page);
    await page.reload();
    await resume(page);
    await expect(region(page)).toHaveAttribute('data-fixture-phase', 'choice');
    await expect(region(page).locator('[data-choice]')).toHaveCount(2);
    await expect(region(page)).toHaveAttribute('data-effects', '0');
    expect(await bytes(page)).toBe(choiceBytes);
    await region(page).locator('[data-choice]').nth(branch).click();
    await ready(page);
    const branchBytes = await bytes(page);
    await page.reload();
    await resume(page);
    await expect(region(page)).toHaveAttribute(
      'data-line-id',
      `fixture_branch_${branch ? 'b' : 'a'}_001`,
    );
    await expect(region(page)).toHaveAttribute('data-effects', '1');
    await expect(region(page)).toHaveAttribute('data-notifications', '0');
    await expect(region(page)).toHaveAttribute(
      'data-ledger',
      `fixture.domain.branch_${branch ? 'b' : 'a'}`,
    );
    expect(await bytes(page)).toBe(branchBytes);
    await page.getByRole('button', { name: 'อ่านต่อ', exact: true }).click();
    await ready(page);
    await expect(region(page).locator('.fixture-line')).toContainText(
      'ยืนยันข้อมูลหลังบันทึก',
    );
  });

test('manual slots and New Run use explicit raw-bound confirmations and preserve global history', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  await start(page);
  await page.getByRole('button', { name: 'อ่านต่อ', exact: true }).click();
  await ready(page);
  await page
    .getByRole('button', { name: 'บันทึก ช่อง 1', exact: true })
    .click();
  await ready(page);
  await region(page).locator('[data-choice]').first().click();
  await ready(page);
  const run = await region(page).getAttribute('data-run');
  const before = await bytes(page);
  await page
    .getByRole('button', { name: 'เริ่มรอบทดสอบใหม่', exact: true })
    .click();
  await page.getByRole('button', { name: 'ยกเลิก', exact: true }).click();
  expect(await bytes(page)).toBe(before);
  await page
    .getByRole('button', { name: 'เริ่มรอบทดสอบใหม่', exact: true })
    .click();
  await page.getByRole('button', { name: 'ยืนยันแทนที่', exact: true }).click();
  await ready(page);
  await expect(region(page)).not.toHaveAttribute('data-run', run!);
  await expect(page.locator('[data-read-history]')).toHaveAttribute(
    'data-read-history',
    /fixture_branch_a_001/,
  );
  await page
    .getByRole('button', { name: 'บันทึก ช่อง 2', exact: true })
    .click();
  await ready(page);
  await page.getByRole('button', { name: 'โหลด ช่อง 1', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'ยืนยันแทนที่', exact: true }).click();
  await ready(page);
  await expect(region(page)).toHaveAttribute('data-run', run!);
  await expect(region(page)).toHaveAttribute('data-fixture-phase', 'choice');
  await region(page).locator('[data-choice]').first().click();
  await ready(page);
  await page.reload();
  await resume(page);
  await expect(page.locator('[data-read-history]')).toHaveAttribute(
    'data-read-history',
    /fixture_branch_a_001/,
  );
  await expect(page.locator('[data-slot="manual-1"]')).toHaveAttribute(
    'data-slot-status',
    'valid',
  );
  await expect(page.locator('[data-slot="manual-2"]')).toHaveAttribute(
    'data-slot-status',
    'valid',
  );
  await expect(page.locator('[data-slot="manual-3"]')).toHaveAttribute(
    'data-slot-status',
    'empty',
  );
  await page.screenshot({ path: testInfo.outputPath('fixture-runtime.png') });
});

test('corrupt profile and future save block startup without changing native stored bytes', async ({
  page,
}) => {
  await page.goto('/');
  await start(page);
  const original = await bytes(page);
  const originalProfile = await page.evaluate(
    (key) => localStorage.getItem(key),
    profileKey,
  );
  await page.evaluate(
    (key) => localStorage.setItem(key, '{bad profile'),
    profileKey,
  );
  await page.reload();
  await expect(page.locator('[data-runtime-phase]')).toHaveAttribute(
    'data-runtime-phase',
    'blocked',
  );
  expect(await bytes(page)).toBe(original);
  expect(
    await page.evaluate((key) => localStorage.getItem(key), profileKey),
  ).toBe('{bad profile');
  await page.evaluate(
    ({ key, profile, auto }) => {
      localStorage.setItem(key, profile!);
      const future = JSON.parse(localStorage.getItem(auto)!);
      future.saveSchemaVersion = 999;
      localStorage.setItem(auto, JSON.stringify(future));
    },
    { key: profileKey, profile: originalProfile, auto: autoKey },
  );
  const futureBytes = await bytes(page);
  await page.reload();
  await expect(page.locator('[data-runtime-phase]')).toHaveAttribute(
    'data-runtime-phase',
    'blocked',
  );
  await expect(region(page)).toHaveCount(0);
  expect(await bytes(page)).toBe(futureBytes);
});

test('native storage write failure shows unsaved and explicit retry succeeds', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key.endsWith(':autosave') && !sessionStorage.getItem('qa-allow-save'))
        throw new DOMException('QA quota failure', 'QuotaExceededError');
      return original.call(this, key, value);
    };
  });
  await page.goto('/');
  await start(page);
  await expect(region(page)).toHaveAttribute(
    'data-line-id',
    'fixture_start_001',
  );
  await expect(page.locator('[data-feedback]')).toHaveAttribute(
    'data-feedback',
    'error',
  );
  expect(await bytes(page)).toBeNull();
  await page.evaluate(() => sessionStorage.setItem('qa-allow-save', 'yes'));
  await page
    .getByRole('button', { name: 'ลองบันทึก Autosave อีกครั้ง', exact: true })
    .click();
  await ready(page);
  await expect(page.locator('[data-feedback]')).toHaveAttribute(
    'data-feedback',
    'saved',
  );
  expect(await bytes(page)).not.toBeNull();
});

test('browser process restart with the same persistent profile resumes line, choice and committed branch', async ({
  playwright,
  browserName,
}) => {
  test.setTimeout(120_000);
  const directory = await mkdtemp(
    join(tmpdir(), 'this-house-fixture-restart-'),
  );
  const launch = () =>
    playwright[browserName].launchPersistentContext(directory, {
      headless: true,
      viewport: { width: 1280, height: 720 },
    });
  let context = await launch();
  try {
    let page = context.pages()[0];
    await page.goto('http://127.0.0.1:4173/');
    await start(page);
    const run = await region(page).getAttribute('data-run');
    let session = await region(page).getAttribute('data-session');
    let previous = await bytes(page);
    for (const expected of [
      'fixture_start_001',
      'choice',
      'fixture_branch_a_001',
    ]) {
      await context.close(); // Persistent context closure terminates its browser.
      context = await launch();
      page = context.pages()[0];
      await page.goto('http://127.0.0.1:4173/');
      await decision(page);
      expect(await bytes(page)).toBe(previous);
      await resume(page);
      await expect(region(page)).toHaveAttribute('data-run', run!);
      await expect(region(page)).not.toHaveAttribute('data-session', session!);
      await expect(region(page)).toHaveAttribute('data-notifications', '0');
      if (expected === 'choice') {
        await expect(region(page)).toHaveAttribute(
          'data-fixture-phase',
          'choice',
        );
        await region(page).locator('[data-choice]').first().click();
      } else {
        await expect(region(page)).toHaveAttribute('data-line-id', expected);
        if (expected === 'fixture_branch_a_001') {
          await expect(region(page)).toHaveAttribute('data-effects', '1');
          break;
        }
        await page
          .getByRole('button', { name: 'อ่านต่อ', exact: true })
          .click();
      }
      await ready(page);
      previous = await bytes(page);
      session = await region(page).getAttribute('data-session');
    }
  } finally {
    await context.close();
  }
});

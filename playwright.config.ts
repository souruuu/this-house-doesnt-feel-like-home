import { defineConfig, devices } from '@playwright/test';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Workers inherit this ID, so one invocation keeps all projects in the same run.
const runId =
  (process.env.PHASER_M0_QA_RUN_ID ??= `${process.platform}-${Date.now()}`);
if (!/^[a-zA-Z0-9-]+$/.test(runId))
  throw new Error('Invalid PHASER_M0_QA_RUN_ID');

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  outputDir: join(tmpdir(), 'this-house-m0-qa', runId, 'test-results'),
  use: {
    baseURL: 'http://127.0.0.1:4173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: [
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 4173 --strictPort',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: false,
    },
    {
      command: 'npm run build && node scripts/serve-static-test.ts',
      url: 'http://127.0.0.1:4174/nested/game/',
      reuseExistingServer: false,
    },
  ],
});

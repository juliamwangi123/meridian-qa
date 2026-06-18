import { defineConfig, devices } from '@playwright/test';

const isCI = !!(globalThis as any).process?.env?.CI;

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'https://opensource-demo.orangehrmlive.com',
    trace: 'on-first-retry',
    navigationTimeout: 60000,
    actionTimeout: 15000,
    // Record videos only on test failure for debugging in CI pipeline
    video: 'retain-on-failure',
    launchOptions: {
      slowMo: isCI ? 0 : 500,
    },
  },
  
  outputDir: 'test-results',

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
  ],
});
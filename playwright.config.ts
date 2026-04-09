import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for visual verification testing
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use */
  reporter: 'list',

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'https://localhost:5172',

    /* Ignore HTTPS errors for self-signed certificates */
    ignoreHTTPSErrors: true,

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Capture screenshot on failure */
    screenshot: 'only-on-failure',

    /* Capture console logs */
    locale: 'en-US',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],

  /* Run local dev server before starting the tests */
  // Note: For now, start the dev server manually with `npm run dev`
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:5172',
  //   reuseExistingServer: true,
  //   timeout: 120000,
  // },
});

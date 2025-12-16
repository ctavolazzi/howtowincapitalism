/**
 * @fileoverview Playwright test configuration.
 *
 * E2E test settings for browser automation:
 * - Chromium browser testing
 * - Automatic dev server startup
 * - Screenshot on failure
 * - Trace collection on retry
 *
 * @see https://playwright.dev/docs/test-configuration
 *
 * @module playwright.config
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */
import { defineConfig, devices } from '@playwright/test';
const baseURL = process.env.BASE_URL || 'http://localhost:4321';
const startLocalServer = baseURL.includes('localhost') || baseURL.includes('127.0.0.1');

export default defineConfig({
  testDir: './tests',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use */
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL for navigation */
    baseURL,

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Screenshot on failure */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run local dev server before starting the tests */
  webServer: startLocalServer
    ? {
        command: 'npm run dev',
        url: 'http://localhost:4321',
        reuseExistingServer: true, // Always reuse existing server
        timeout: 120000,
      }
    : undefined,
});

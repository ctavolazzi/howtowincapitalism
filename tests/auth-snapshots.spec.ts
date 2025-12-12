import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { TEST_CREDENTIALS } from './fixtures/test-credentials';

const shouldCapture = process.env.CAPTURE_AUTH_SNAPS === '1';
test.skip(!shouldCapture, 'Set CAPTURE_AUTH_SNAPS=1 to capture auth flow screenshots.');

const screenshotDir = path.resolve('_docs/screenshots/auth-flow/v0.0.1');

test.beforeAll(() => {
  fs.mkdirSync(screenshotDir, { recursive: true });
});

test.describe.configure({ mode: 'serial' });

test('capture v0.0.1 auth flow snapshots', async ({ page }) => {
  const save = async (filename: string) => {
    await page.screenshot({
      path: path.join(screenshotDir, filename),
      fullPage: true,
    });
  };

  // 01: Login page (default state)
  await page.goto('/login/');
  await page.waitForSelector('#login-form');
  await save('01_login-page_v0.0.1.png');

  // 02: Login error state
  await page.fill('#email', 'wrong@example.com');
  await page.fill('#password', 'wrongpass');
  await page.click('#login-button');
  await page.waitForSelector('#error-message', { state: 'visible' });
  await save('02_login-error_v0.0.1.png');

  // 03: Login success → Home
  await page.fill('#email', TEST_CREDENTIALS.admin.email);
  await page.fill('#password', TEST_CREDENTIALS.admin.password);
  await page.click('#login-button');
  await page.waitForURL('**/');
  await page.waitForSelector('#content', { state: 'visible' });
  await save('03_home-authenticated_v0.0.1.png');

  // 04: User menu open
  await page.waitForSelector('#avatar-button');
  await page.click('#avatar-button');
  await expect(page.locator('.dropdown-menu')).toBeVisible();
  await save('04_user-menu_v0.0.1.png');

  // 05: Profile page
  await page.goto('/users/admin/');
  await page.waitForSelector('#content', { state: 'visible' });
  await save('05_profile-page_v0.0.1.png');

  // 06: Logout back to login page
  await page.goto('/');
  await page.click('#avatar-button');
  await page.click('#logout-button');
  await page.waitForURL('**/login/');
  await save('06_logged-out_v0.0.1.png');

  // 07: Register page (unavailable locally)
  await page.goto('/register/');
  await page.waitForSelector('#register-form');
  await page.fill('#username', 'snapuser');
  await page.fill('#name', 'Snapshot User');
  await page.fill('#email', 'snap@example.com');
  await page.fill('#password', 'SnapPass123');
  await page.click('#register-button');
  await page.waitForSelector('#error-message', { state: 'visible' });
  await save('07_register-unavailable_v0.0.1.png');

  // 08: Forgot password (unavailable locally)
  await page.goto('/forgot-password/');
  await page.waitForSelector('#forgot-password-form');
  await page.fill('#email', 'snap@example.com');
  await page.click('#submit-button');
  await page.waitForSelector('#error-message', { state: 'visible' });
  await save('08_forgot-password-unavailable_v0.0.1.png');
});

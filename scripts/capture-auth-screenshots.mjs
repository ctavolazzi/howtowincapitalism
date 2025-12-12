/**
 * Capture auth flow screenshots against a live/staging base URL.
 *
 * Usage:
 *   AUTH_SNAPSHOT_BASE_URL=https://howtowincapitalism.com node scripts/capture-auth-screenshots.mjs
 *   (defaults to production URL and viewer credentials)
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const baseUrl = process.env.AUTH_SNAPSHOT_BASE_URL || 'https://howtowincapitalism.com';
const loginEmail = process.env.AUTH_SNAPSHOT_EMAIL || 'viewer@email.com';
const loginPassword = process.env.AUTH_SNAPSHOT_PASSWORD || 'V!ewer_Read_2024#';

const screenshotDir = path.resolve('_docs/screenshots/auth-flow/v0.0.1');
fs.mkdirSync(screenshotDir, { recursive: true });

const pageUrl = (pathName) => `${baseUrl.replace(/\/$/, '')}${pathName}`;
const save = async (page, filename) => {
  await page.screenshot({
    path: path.join(screenshotDir, filename),
    fullPage: true,
  });
  console.log('Saved', filename);
};

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 01: Login page (default)
  await page.goto(pageUrl('/login/'));
  await page.waitForSelector('#login-form');
  await save(page, '01_login-page_v0.0.1.png');

  // 02: Login error state
  await page.fill('#email', 'wrong@example.com');
  await page.fill('#password', 'wrongpass');
  await page.click('#login-button');
  await page.waitForSelector('#error-message', { state: 'visible' });
  await save(page, '02_login-error_v0.0.1.png');

  // 03: Login success → Home
  await page.goto(pageUrl('/login/'));
  await page.fill('#email', loginEmail);
  await page.fill('#password', loginPassword);
  await page.click('#login-button');
  await page.waitForURL('**/');
  await page.waitForSelector('#content', { state: 'visible', timeout: 15000 });
  await save(page, '03_home-authenticated_v0.0.1.png');

  // 04: User menu open
  await page.waitForSelector('#avatar-button', { timeout: 10000 });
  await page.click('#avatar-button');
  await page.waitForSelector('.dropdown-menu', { state: 'visible' });
  await save(page, '04_user-menu_v0.0.1.png');

  // 05: Profile page
  await page.goto(pageUrl('/users/viewer/'));
  await page.waitForSelector('#content', { state: 'visible', timeout: 15000 });
  await save(page, '05_profile-page_v0.0.1.png');

  // 06: Logout back to login page
  await page.goto(pageUrl('/'));
  await page.waitForSelector('#avatar-button', { timeout: 10000 });
  await page.click('#avatar-button');
  await page.click('#logout-button');
  await page.waitForURL('**/login/**', { timeout: 15000 });
  await page.waitForSelector('#login-form');
  await save(page, '06_logged-out_v0.0.1.png');

  // 07: Register page (current state)
  await page.goto(pageUrl('/register/'));
  await page.waitForSelector('#register-form');
  await save(page, '07_register-page_v0.0.1.png');

  // 08: Forgot password page (current state)
  await page.goto(pageUrl('/forgot-password/'));
  await page.waitForSelector('#forgot-password-form');
  await save(page, '08_forgot-password-page_v0.0.1.png');

  await browser.close();
}

run().catch((error) => {
  console.error('Screenshot capture failed:', error);
  process.exit(1);
});

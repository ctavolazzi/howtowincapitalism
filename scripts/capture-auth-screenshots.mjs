#!/usr/bin/env node
/**
 * V0.0.1 Auth Flow Screenshot Capture Script
 *
 * Captures screenshots of the authentication flow for documentation.
 * Run: node scripts/capture-auth-screenshots.mjs
 */

import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const screenshotsDir = join(__dirname, '..', '_docs', 'screenshots', 'auth-flow', 'v0.0.1');

// Configuration
const BASE_URL = process.env.BASE_URL || 'https://howtowincapitalism.com';
const TEST_CREDENTIALS = {
  email: 'admin@email.com',
  password: 'Adm!n_Secure_2024#'
};

async function captureScreenshots() {
  console.log('🚀 Starting auth flow screenshot capture...');
  console.log(`📍 Target: ${BASE_URL}`);
  console.log(`📁 Output: ${screenshotsDir}`);

  // Ensure output directory exists
  await mkdir(screenshotsDir, { recursive: true });

  // Launch browser
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  const screenshots = [];

  try {
    // 01 - Login Page
    console.log('\n📸 01 - Login page...');
    await page.goto(`${BASE_URL}/login/`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: join(screenshotsDir, '01-login-page.png'),
      fullPage: false
    });
    screenshots.push('01-login-page.png');

    // 02 - Login Error (invalid credentials)
    console.log('📸 02 - Login error state...');
    await page.fill('input[name="email"], input[type="email"]', 'wrong@email.com');
    await page.fill('input[name="password"], input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000); // Wait for error message
    await page.screenshot({
      path: join(screenshotsDir, '02-login-error.png'),
      fullPage: false
    });
    screenshots.push('02-login-error.png');

    // Clear and login with correct credentials
    console.log('📸 03 - Login success...');
    await page.fill('input[name="email"], input[type="email"]', TEST_CREDENTIALS.email);
    await page.fill('input[name="password"], input[type="password"]', TEST_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: join(screenshotsDir, '03-login-success.png'),
      fullPage: false
    });
    screenshots.push('03-login-success.png');

    // 04 - User Menu (logged in state)
    console.log('📸 04 - User menu...');
    // Try to find and click user menu
    try {
      const userMenuBtn = page.locator('button:has-text("User menu"), [aria-label="User menu"]').first();
      if (await userMenuBtn.isVisible()) {
        await userMenuBtn.click();
        await page.waitForTimeout(500);
      }
    } catch (e) {
      console.log('  (User menu not visible or different selector)');
    }
    await page.screenshot({
      path: join(screenshotsDir, '04-user-menu.png'),
      fullPage: false
    });
    screenshots.push('04-user-menu.png');

    // 05 - Profile Page
    console.log('📸 05 - Profile page...');
    await page.goto(`${BASE_URL}/users/admin/`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: join(screenshotsDir, '05-profile-page.png'),
      fullPage: false
    });
    screenshots.push('05-profile-page.png');

    // 06 - Home page (logged in)
    console.log('📸 06 - Home page logged in...');
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: join(screenshotsDir, '06-home-logged-in.png'),
      fullPage: false
    });
    screenshots.push('06-home-logged-in.png');

    // 07 - Register Page (new context to avoid logged-in state)
    console.log('📸 07 - Register page...');
    const anonContext = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });
    const anonPage = await anonContext.newPage();
    await anonPage.goto(`${BASE_URL}/register/`);
    await anonPage.waitForLoadState('networkidle');
    await anonPage.screenshot({
      path: join(screenshotsDir, '07-register-page.png'),
      fullPage: false
    });
    screenshots.push('07-register-page.png');

    // 08 - Forgot Password Page
    console.log('📸 08 - Forgot password page...');
    await anonPage.goto(`${BASE_URL}/forgot-password/`);
    await anonPage.waitForLoadState('networkidle');
    await anonPage.screenshot({
      path: join(screenshotsDir, '08-forgot-password.png'),
      fullPage: false
    });
    screenshots.push('08-forgot-password.png');

    await anonContext.close();

    // 09 - Logout flow (back to logged in context)
    console.log('📸 09 - Logout...');
    await page.goto(`${BASE_URL}/logout/`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: join(screenshotsDir, '09-logout.png'),
      fullPage: false
    });
    screenshots.push('09-logout.png');

    console.log('\n✅ Screenshot capture complete!');
    console.log(`📁 Saved ${screenshots.length} screenshots to: ${screenshotsDir}`);
    console.log('\nFiles:');
    screenshots.forEach(s => console.log(`  - ${s}`));

  } catch (error) {
    console.error('❌ Error capturing screenshots:', error.message);
    // Take a debug screenshot
    await page.screenshot({
      path: join(screenshotsDir, 'debug-error.png'),
      fullPage: true
    });
    console.log('📸 Debug screenshot saved as debug-error.png');
  } finally {
    await browser.close();
  }
}

captureScreenshots().catch(console.error);

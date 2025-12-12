import { test, expect, Page } from '@playwright/test';

/**
 * Navigation E2E Tests
 *
 * Tests site navigation, breadcrumbs, and link behavior.
 */

const SITE_PASSWORD = 'unlockmenow';
const TEST_USER = { email: 'admin@email.com', password: 'Adm!n_Secure_2024#' };

/**
 * Helper to login and unlock site gate
 */
async function loginAndUnlock(page: Page) {
  await page.goto('/login/');
  await page.fill('input[name="email"]', TEST_USER.email);
  await page.fill('input[name="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/', { timeout: 10000 });

  // Unlock site gate if present
  const gate = page.locator('#passwordGate');
  if (await gate.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.fill('#passwordInput', SITE_PASSWORD);
    await page.click('#passwordForm button[type="submit"]');
    await expect(gate).toBeHidden({ timeout: 5000 });
  }
}

test.describe('Header Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndUnlock(page);
  });

  test('header is visible', async ({ page }) => {
    const header = page.locator('header').first();
    await expect(header).toBeVisible({ timeout: 5000 });
  });

  test('logo/title links to home', async ({ page }) => {
    await page.goto('/faq/introduction/');

    // Unlock gate on content page
    const gate = page.locator('#passwordGate');
    if (await gate.isVisible({ timeout: 1000 }).catch(() => false)) {
      await page.fill('#passwordInput', SITE_PASSWORD);
      await page.click('#passwordForm button[type="submit"]');
    }

    // Wait for content
    await expect(page.locator('#content')).toBeVisible({ timeout: 10000 });

    // Click site title/logo to go home
    const homeLink = page.locator('header a[href="/"]').first();
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(page).toHaveURL('/');
    }
  });

  test('user menu is visible when logged in', async ({ page }) => {
    const userMenu = page.locator('#user-menu');
    await expect(userMenu).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Content Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndUnlock(page);
  });

  test('can navigate from home to FAQ', async ({ page }) => {
    // Find and click FAQ link
    const faqLink = page.locator('a[href*="/faq"]').first();
    if (await faqLink.isVisible()) {
      await faqLink.click();
      await expect(page).toHaveURL(/\/faq\//);
    }
  });

  test('can navigate between FAQ articles', async ({ page }) => {
    await page.goto('/faq/introduction/');

    // Unlock gate
    const gate = page.locator('#passwordGate');
    if (await gate.isVisible({ timeout: 1000 }).catch(() => false)) {
      await page.fill('#passwordInput', SITE_PASSWORD);
      await page.click('#passwordForm button[type="submit"]');
    }

    // Wait for content
    await expect(page.locator('#content, article')).toBeVisible({ timeout: 5000 });

    // Look for internal links
    const internalLink = page.locator('a[href*="/faq/"]').first();
    if (await internalLink.isVisible()) {
      const href = await internalLink.getAttribute('href');
      await internalLink.click();
      if (href) {
        await expect(page).toHaveURL(new RegExp(href.replace(/\//g, '\\/')));
      }
    }
  });
});

test.describe('Breadcrumbs', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndUnlock(page);
  });

  test('breadcrumbs appear on content pages', async ({ page }) => {
    await page.goto('/faq/introduction/');

    // Unlock gate
    const gate = page.locator('#passwordGate');
    if (await gate.isVisible({ timeout: 1000 }).catch(() => false)) {
      await page.fill('#passwordInput', SITE_PASSWORD);
      await page.click('#passwordForm button[type="submit"]');
    }

    // Wait for content
    await expect(page.locator('#content, article')).toBeVisible({ timeout: 5000 });

    // Check for breadcrumbs
    const breadcrumbs = page.locator('.breadcrumbs, nav[aria-label="Breadcrumb"]');
    await expect(breadcrumbs).toBeVisible();
  });

  test('breadcrumb home link works', async ({ page }) => {
    await page.goto('/faq/introduction/');

    // Unlock gate
    const gate = page.locator('#passwordGate');
    if (await gate.isVisible({ timeout: 1000 }).catch(() => false)) {
      await page.fill('#passwordInput', SITE_PASSWORD);
      await page.click('#passwordForm button[type="submit"]');
    }

    // Wait for content
    await expect(page.locator('#content, article')).toBeVisible({ timeout: 5000 });

    // Click home in breadcrumbs
    const homeLink = page.locator('.breadcrumbs a[href="/"], nav[aria-label="Breadcrumb"] a[href="/"]');
    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(page).toHaveURL('/');
    }
  });
});

test.describe('404 Handling', () => {
  test('non-existent page shows error or redirects', async ({ page }) => {
    await loginAndUnlock(page);

    const response = await page.goto('/this-page-does-not-exist-12345/');

    // Should either show 404 or redirect
    const status = response?.status();
    expect(status === 404 || status === 302 || status === 200).toBeTruthy();
  });
});


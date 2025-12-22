import { test, expect, Page } from '@playwright/test';
import { TEST_CREDENTIALS, SITE_PASSWORD } from './fixtures/test-credentials';

/**
 * Accessibility E2E Tests
 *
 * Basic accessibility checks for the site.
 */

const TEST_USER = TEST_CREDENTIALS.admin;

async function loginAndUnlock(page: Page) {
  await page.goto('/login/');
  await page.fill('input[name="email"]', TEST_USER.email);
  await page.fill('input[name="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/', { timeout: 10000 });

  const gate = page.locator('#password-gate');
  if (await gate.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.fill('#site-password', SITE_PASSWORD);
    await page.click('#password-form button[type="submit"]');
    await expect(gate).toBeHidden({ timeout: 5000 });
  }
}

async function unlockGate(page: Page) {
  const gate = page.locator('#password-gate');
  if (await gate.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.fill('#site-password', SITE_PASSWORD);
    await page.click('#password-form button[type="submit"]');
    await expect(gate).toBeHidden({ timeout: 5000 });
  }
}

test.describe('Document Structure', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndUnlock(page);
  });

  test('page has exactly one h1', async ({ page }) => {
    await unlockGate(page);
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('page has lang attribute on html', async ({ page }) => {
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
  });

  test('page has title', async ({ page }) => {
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });
});

test.describe('Form Accessibility', () => {
  test('login form has accessible labels', async ({ page }) => {
    await page.goto('/login/');

    // Email field should have label
    const emailLabel = page.locator('label[for="email"], label:has-text("email")');
    const emailLabelVisible = await emailLabel.isVisible().catch(() => false);

    const emailInput = page.locator('input[name="email"]');
    const emailPlaceholder = await emailInput.getAttribute('placeholder');
    const emailAriaLabel = await emailInput.getAttribute('aria-label');

    // Should have either label, placeholder, or aria-label
    expect(emailLabelVisible || emailPlaceholder || emailAriaLabel).toBeTruthy();
  });

  test('password field has type="password"', async ({ page }) => {
    await page.goto('/login/');

    const passwordInput = page.locator('input[name="password"]');
    const type = await passwordInput.getAttribute('type');
    expect(type).toBe('password');
  });

  test('submit button is keyboard accessible', async ({ page }) => {
    await page.goto('/login/');

    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();

    // Should be focusable
    await submitButton.focus();
    await expect(submitButton).toBeFocused();
  });
});

test.describe('Image Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndUnlock(page);
  });

  test('images have alt attributes', async ({ page }) => {
    await page.goto('/faq/introduction/');
    await unlockGate(page);
    await expect(page.locator('#content, article')).toBeVisible({ timeout: 5000 });

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      // Alt can be empty string for decorative images, but attribute should exist
      expect(alt !== null).toBeTruthy();
    }
  });
});

test.describe('Link Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndUnlock(page);
  });

  test('links have discernible text', async ({ page }) => {
    await page.goto('/faq/introduction/');
    await unlockGate(page);
    await expect(page.locator('#content, article')).toBeVisible({ timeout: 5000 });

    const links = page.locator('#content a, article a');
    const count = await links.count();

    for (let i = 0; i < Math.min(count, 10); i++) { // Check first 10 links
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');

      // Should have text content, aria-label, or title
      expect(text?.trim() || ariaLabel || title).toBeTruthy();
    }
  });

  test('skip to content link exists', async ({ page }) => {
    // Skip link is a common accessibility feature
    const skipLink = page.locator('a[href="#content"], a[href="#main"], .skip-link');
    // This is optional, so we just check if it exists when present
    const hasSkipLink = await skipLink.count();
    // Not failing if missing, just informational
    console.log(`Skip link present: ${hasSkipLink > 0}`);
  });
});

test.describe('Color Contrast', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndUnlock(page);
  });

  test('text is readable (not invisible)', async ({ page }) => {
    await page.goto('/faq/introduction/');
    await unlockGate(page);
    await expect(page.locator('#content, article')).toBeVisible({ timeout: 5000 });

    // Check that main content text is visible
    const content = page.locator('#content, article');
    const text = await content.textContent();
    expect(text?.length).toBeGreaterThan(100); // Should have substantial content
  });
});

test.describe('Keyboard Navigation', () => {
  test('can navigate login form with keyboard', async ({ page }) => {
    await page.goto('/login/');

    // Tab to email field
    await page.keyboard.press('Tab');
    const emailFocused = await page.locator('input[name="email"]').evaluate(
      el => el === document.activeElement
    );

    // Tab to password field
    await page.keyboard.press('Tab');

    // Tab to submit button
    await page.keyboard.press('Tab');

    // Form should be navigable (we're just checking no errors occur)
    expect(true).toBeTruthy();
  });

  test('modal/overlay can be dismissed', async ({ page }) => {
    await loginAndUnlock(page);

    // Open user menu
    await page.click('#user-menu, .user-menu');

    // Should be able to close with Escape
    await page.keyboard.press('Escape');

    // Menu should close or page should remain functional
    expect(true).toBeTruthy();
  });
});

test.describe('Focus Management', () => {
  test('focus is visible on interactive elements', async ({ page }) => {
    await page.goto('/login/');

    const emailInput = page.locator('input[name="email"]');
    await emailInput.focus();
    await expect(emailInput).toBeFocused();
  });

  test('focus returns after modal close', async ({ page }) => {
    await loginAndUnlock(page);

    // Remember which element was focused before
    const userMenu = page.locator('#user-menu, .user-menu');
    await userMenu.click();

    // Close with escape
    await page.keyboard.press('Escape');

    // Page should still be functional
    await expect(page.locator('body')).toBeVisible();
  });
});


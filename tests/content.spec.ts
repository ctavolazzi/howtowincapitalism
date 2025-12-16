/**
 * @fileoverview Content pages E2E tests.
 *
 * Tests for wiki content page rendering:
 * - Home page loading and content display
 * - FAQ pages (Introduction, Compound Interest, etc.)
 * - Notes pages (Automation, Inflation, etc.)
 * - Tools pages (Decision Matrix, Checklist)
 * - Disclaimer page accessibility
 * - MDX component rendering
 *
 * @module tests/content.spec
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */
import { test, expect, Page } from '@playwright/test';
import { TEST_CREDENTIALS, SITE_PASSWORD } from './fixtures/test-credentials';

const TEST_USER = TEST_CREDENTIALS.admin;

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

/**
 * Helper to unlock gate on a specific page
 */
async function unlockGate(page: Page) {
  const gate = page.locator('#passwordGate');
  if (await gate.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.fill('#passwordInput', SITE_PASSWORD);
    await page.click('#passwordForm button[type="submit"]');
    await expect(gate).toBeHidden({ timeout: 5000 });
  }
}

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndUnlock(page);
  });

  test('home page loads with content', async ({ page }) => {
    await unlockGate(page);
    // Wait for auth gate to hide and content to show
    await expect(page.locator('#content')).toBeVisible({ timeout: 10000 });
  });

  test('home page has header', async ({ page }) => {
    await unlockGate(page);
    const header = page.locator('header').first();
    await expect(header).toBeVisible({ timeout: 5000 });
  });
});

test.describe('FAQ Pages', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndUnlock(page);
  });

  const faqPages = [
    { path: '/faq/introduction/', title: 'Introduction' },
    { path: '/faq/compound-interest/', title: 'Compound Interest' },
    { path: '/faq/emergency-fund/', title: 'Emergency Fund' },
    { path: '/faq/debt-strategies/', title: 'Debt' },
    { path: '/faq/decision-matrix/', title: 'Decision Matrix' },
  ];

  for (const { path, title } of faqPages) {
    test(`FAQ: ${title} page loads correctly`, async ({ page }) => {
      await page.goto(path);
      await unlockGate(page);

      // Wait for content to load (auth gate hidden, content visible)
      await expect(page.locator('#content')).toBeVisible({ timeout: 10000 });

      // Check page has article heading
      const heading = page.locator('#content h1, article h1').first();
      await expect(heading).toBeVisible({ timeout: 5000 });
    });
  }
});

test.describe('Notes Pages', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndUnlock(page);
  });

  const notesPages = [
    { path: '/notes/automation/', title: 'Automation' },
    { path: '/notes/inflation-strategies/', title: 'Inflation' },
    { path: '/notes/negotiation-tactics/', title: 'Negotiation' },
  ];

  for (const { path, title } of notesPages) {
    test(`Notes: ${title} page loads correctly`, async ({ page }) => {
      await page.goto(path);
      await unlockGate(page);

      // Wait for content
      await expect(page.locator('#content')).toBeVisible({ timeout: 10000 });

      // Check page has article heading
      const heading = page.locator('#content h1, article h1').first();
      await expect(heading).toBeVisible({ timeout: 5000 });
    });
  }
});

test.describe('Tools Pages', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndUnlock(page);
  });

  const toolsPages = [
    { path: '/tools/decision-matrix-template/', title: 'Decision Matrix Template' },
    { path: '/tools/financial-autonomy-checklist/', title: 'Financial Autonomy Checklist' },
    { path: '/tools/tax-optimization-guide/', title: 'Tax Optimization' },
  ];

  for (const { path, title } of toolsPages) {
    test(`Tools: ${title} page loads correctly`, async ({ page }) => {
      await page.goto(path);
      await unlockGate(page);

      // Wait for content
      await expect(page.locator('#content')).toBeVisible({ timeout: 10000 });

      // Check page has article heading
      const heading = page.locator('#content h1, article h1').first();
      await expect(heading).toBeVisible({ timeout: 5000 });
    });
  }
});

test.describe('Disclaimer Page', () => {
  test('disclaimer page is accessible without login', async ({ page }) => {
    await page.goto('/disclaimer/');

    // Should not redirect
    await expect(page).toHaveURL('/disclaimer/');

    // Should have content
    const content = page.locator('main, article, .content');
    await expect(content).toBeVisible({ timeout: 5000 });
  });

  test('disclaimer page has required legal content', async ({ page }) => {
    await page.goto('/disclaimer/');

    // Check for disclaimer-related text
    const text = await page.textContent('body');
    expect(text?.toLowerCase()).toContain('disclaimer');
  });
});

test.describe('Content Rendering', () => {
  test.beforeEach(async ({ page }) => {
    await loginAndUnlock(page);
  });

  test('MDX components render correctly', async ({ page }) => {
    await page.goto('/faq/introduction/');
    await unlockGate(page);

    // Wait for content
    await expect(page.locator('#content')).toBeVisible({ timeout: 10000 });

    // Should have paragraphs in content area
    const paragraphs = page.locator('#content p');
    expect(await paragraphs.count()).toBeGreaterThan(0);
  });

  test('links in content are clickable', async ({ page }) => {
    await page.goto('/faq/introduction/');
    await unlockGate(page);

    // Wait for content
    await expect(page.locator('#content')).toBeVisible({ timeout: 10000 });

    // Find first internal link in content
    const link = page.locator('#content a[href^="/"]').first();
    if (await link.isVisible()) {
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });
});


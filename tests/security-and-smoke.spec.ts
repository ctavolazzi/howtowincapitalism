/**
 * @fileoverview Security and smoke E2E tests.
 *
 * Infrastructure verification tests:
 * - Security gates (admin access control)
 * - Smoke tests (basic page rendering)
 * - Cloudflare Access enforcement (when enabled)
 *
 * @module tests/security-and-smoke.spec
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';
const ENFORCE_CF_ACCESS = process.env.ENFORCE_CF_ACCESS === 'true';

test.describe('Security & Infrastructure Gates', () => {
  test('unauthenticated users are blocked from Admin', async ({ request }) => {
    if (!ENFORCE_CF_ACCESS) {
      test.skip('Skipping Access gate check (ENFORCE_CF_ACCESS not true)');
    }

    const response = await request.get(`${BASE_URL}/admin/users/`);
    expect(response.status()).not.toBe(200);
  });
});

test.describe('Functional Smoke Tests', () => {
  test('public site renders landing page', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await expect(page.locator('h1')).toBeVisible();
    // Enable if/when we want a baseline visual regression snapshot
    // await expect(page).toHaveScreenshot('landing-page-baseline.png', { fullPage: true });
  });

});

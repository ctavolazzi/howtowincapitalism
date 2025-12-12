import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';
const ENFORCE_CF_ACCESS = process.env.ENFORCE_CF_ACCESS === 'true';
const CF_ACCESS_CLIENT_ID = process.env.CF_ACCESS_CLIENT_ID;
const CF_ACCESS_CLIENT_SECRET = process.env.CF_ACCESS_CLIENT_SECRET;
const HAS_SECRETS = Boolean(CF_ACCESS_CLIENT_ID && CF_ACCESS_CLIENT_SECRET);

const CF_HEADERS = {
  'CF-Access-Client-Id': CF_ACCESS_CLIENT_ID || '',
  'CF-Access-Client-Secret': CF_ACCESS_CLIENT_SECRET || '',
};

test.describe('Security & Infrastructure Gates', () => {
  test('unauthenticated users are blocked from Admin', async ({ request }) => {
    if (!ENFORCE_CF_ACCESS) {
      test.skip('Skipping Access gate check (ENFORCE_CF_ACCESS not true)');
    }

    const response = await request.get(`${BASE_URL}/admin/index.html`);
    expect(response.status()).not.toBe(200);
  });

  test('service tokens bypass Cloudflare Access', async ({ request }) => {
    if (!HAS_SECRETS) {
      test.skip('Skipping Access service token check (no secrets provided)');
    }

    const response = await request.get(`${BASE_URL}/admin/index.html`, {
      headers: CF_HEADERS,
    });

    expect(response.status()).toBe(200);
  });
});

test.describe('Functional Smoke Tests', () => {
  test('public site renders landing page', async ({ page }) => {
    if (HAS_SECRETS) {
      await page.setExtraHTTPHeaders(CF_HEADERS);
    }

    await page.goto(`${BASE_URL}/`);
    await expect(page.locator('h1')).toBeVisible();
    // Enable if/when we want a baseline visual regression snapshot
    // await expect(page).toHaveScreenshot('landing-page-baseline.png', { fullPage: true });
  });

  // 4. INFRASTRUCTURE: CMS Asset Check
  // Verify that the TinaCMS SPA actually loads its JavaScript.
  // A 200 OK on the HTML isn't enough; we need to see the app mount.
  test('TinaCMS Admin SPA loads', async ({ page }) => {
    // Only run if we have the keys to get through the gate
    if (!HAS_SECRETS) test.skip('Skipping CMS check (No Service Tokens)');

    await page.setExtraHTTPHeaders(CF_HEADERS);

    // Go to the admin entry point
    await page.goto(`${BASE_URL}/admin/index.html`);

    // Check for the Tina loading state or login prompt.
    // "Tina" is usually present in the title or the login button text.
    // This confirms the JS bundle was found and executed.
    await expect(page.getByText(/tina/i).first()).toBeVisible({ timeout: 10000 });
  });
});

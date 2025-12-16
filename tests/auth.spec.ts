/**
 * @fileoverview Authentication E2E tests.
 *
 * Tests the complete authentication flow:
 * - Login page display and form handling
 * - Valid/invalid credential handling
 * - Redirect parameter support
 * - Protected route access control
 * - Session persistence across navigation
 * - Logout functionality
 * - All user role logins
 * - Auth API endpoint responses
 *
 * @module tests/auth.spec
 * @see {@link module:pages/api/auth/login} - Login endpoint
 * @see {@link module:pages/api/auth/logout} - Logout endpoint
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */
import { test, expect, Page } from '@playwright/test';
import { TEST_CREDENTIALS, SITE_PASSWORD } from './fixtures/test-credentials';

/**
 * Helper to unlock the site-wide password gate if present
 */
async function unlockSiteGate(page: Page) {
  const gate = page.locator('#passwordGate');
  if (await gate.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.fill('#passwordInput', SITE_PASSWORD);
    await page.click('#passwordForm button[type="submit"]');
    // Wait for gate to be hidden
    await expect(gate).toBeHidden({ timeout: 5000 });
  }
}

// Alias for backward compatibility with existing tests
const TEST_USERS = TEST_CREDENTIALS;

test.describe('Login Page', () => {
  test('displays login form', async ({ page }) => {
    await page.goto('/login/');

    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login/');

    await page.fill('input[name="email"]', 'wrong@email.com');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('.error, [class*="error"]')).toBeVisible({ timeout: 5000 });
  });

  test('successful login redirects to home', async ({ page }) => {
    await page.goto('/login/');

    await page.fill('input[name="email"]', TEST_USERS.admin.email);
    await page.fill('input[name="password"]', TEST_USERS.admin.password);
    await page.click('button[type="submit"]');

    // Should redirect to home page
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  test('login with redirect parameter returns to original page', async ({ page }) => {
    await page.goto('/login/?redirect=/faq/introduction/');

    await page.fill('input[name="email"]', TEST_USERS.admin.email);
    await page.fill('input[name="password"]', TEST_USERS.admin.password);
    await page.click('button[type="submit"]');

    // Should redirect to the original page
    await expect(page).toHaveURL('/faq/introduction/', { timeout: 10000 });
  });
});

test.describe('Protected Routes', () => {
  test('unauthenticated user is redirected to login', async ({ page }) => {
    // Clear any existing cookies
    await page.context().clearCookies();

    await page.goto('/faq/introduction/');

    // Should redirect to login with redirect param
    await expect(page).toHaveURL(/\/login\/\?redirect=/, { timeout: 10000 });
  });

  test('home page redirects unauthenticated users', async ({ page }) => {
    await page.context().clearCookies();

    await page.goto('/');

    await expect(page).toHaveURL(/\/login\//, { timeout: 10000 });
  });

  test('users page redirects unauthenticated users', async ({ page }) => {
    await page.context().clearCookies();

    await page.goto('/users/');

    await expect(page).toHaveURL(/\/login\//, { timeout: 10000 });
  });

  test('disclaimer page is public (no redirect)', async ({ page }) => {
    await page.context().clearCookies();

    await page.goto('/disclaimer/');

    // Should stay on disclaimer page
    await expect(page).toHaveURL('/disclaimer/');
  });
});

test.describe('Session Persistence', () => {
  test('session persists across page navigation', async ({ page }) => {
    // Login first
    await page.goto('/login/');
    await page.fill('input[name="email"]', TEST_USERS.admin.email);
    await page.fill('input[name="password"]', TEST_USERS.admin.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Navigate to another page
    await page.goto('/faq/introduction/');

    // Should NOT redirect to login (session still valid)
    await expect(page).toHaveURL('/faq/introduction/');

    // Content should be visible (not auth gate)
    await expect(page.locator('#content, article')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Logout', () => {
  test('logout clears session and redirects to login', async ({ page }) => {
    // Login first
    await page.goto('/login/');
    await page.fill('input[name="email"]', TEST_USERS.admin.email);
    await page.fill('input[name="password"]', TEST_USERS.admin.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Handle site-wide password gate if present
    await unlockSiteGate(page);

    // Find and click logout (in user menu dropdown)
    await page.click('#user-menu');
    await page.click('#logout-button');

    // Should redirect to login
    await expect(page).toHaveURL('/login/', { timeout: 10000 });

    // Try to access protected page - should redirect
    await page.goto('/');
    await expect(page).toHaveURL(/\/login\//, { timeout: 10000 });
  });
});

test.describe('All User Roles', () => {
  for (const [role, creds] of Object.entries(TEST_USERS)) {
    test(`${role} can login successfully`, async ({ page }) => {
      await page.goto('/login/');

      await page.fill('input[name="email"]', creds.email);
      await page.fill('input[name="password"]', creds.password);
      await page.click('button[type="submit"]');

      // Should redirect to home
      await expect(page).toHaveURL('/', { timeout: 10000 });
    });
  }
});

test.describe('Auth API Endpoints', () => {
  test('GET /api/auth/me returns unauthenticated when no cookie', async ({ request }) => {
    const response = await request.get('/api/auth/me/');
    const data = await response.json();

    expect(response.status()).toBe(200);
    expect(data.authenticated).toBe(false);
    expect(data.user).toBeNull();
  });

  test('POST /api/auth/login returns user data on success', async ({ request }) => {
    const response = await request.post('/api/auth/login/', {
      data: {
        email: TEST_USERS.admin.email,
        password: TEST_USERS.admin.password,
      },
    });
    const data = await response.json();

    expect(response.status()).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user.email).toBe(TEST_USERS.admin.email);
    expect(data.user.role).toBe('admin');
  });

  test('POST /api/auth/login returns error on invalid credentials', async ({ request }) => {
    const response = await request.post('/api/auth/login/', {
      data: {
        email: 'invalid@email.com',
        password: 'wrongpass',
      },
    });
    const data = await response.json();

    expect(response.status()).toBe(401);
    expect(data.error).toBeTruthy();
  });

  test('POST /api/auth/logout clears session', async ({ request }) => {
    // Login first
    const loginResponse = await request.post('/api/auth/login/', {
      data: {
        email: TEST_USERS.admin.email,
        password: TEST_USERS.admin.password,
      },
    });
    expect(loginResponse.status()).toBe(200);

    // Logout
    const logoutResponse = await request.post('/api/auth/logout/');
    expect(logoutResponse.status()).toBe(200);

    const logoutData = await logoutResponse.json();
    expect(logoutData.success).toBe(true);
  });
});


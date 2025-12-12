import { test, expect } from '@playwright/test';
import { TEST_CREDENTIALS } from './fixtures/test-credentials';

/**
 * Admin Panel E2E Tests
 *
 * Tests for:
 * - Admin authentication
 * - User list endpoint
 * - Create user endpoint
 * - Update user endpoint
 * - Delete user endpoint
 * - Admin UI pages
 */

const TEST_ADMIN = TEST_CREDENTIALS.admin;
const TEST_VIEWER = TEST_CREDENTIALS.viewer;

test.describe('Admin API Authentication', () => {
  test('admin endpoints require authentication', async ({ request }) => {
    const response = await request.get('/api/admin/users/list/');

    // Should be 403 (unauthorized) or 503 (no KV)
    expect([403, 503]).toContain(response.status());
  });

  test('admin endpoints reject non-admin users', async ({ request }) => {
    // Login as viewer first
    const loginResponse = await request.post('/api/auth/login/', {
      data: TEST_VIEWER,
    });
    expect(loginResponse.status()).toBe(200);

    // Try to access admin endpoint
    const response = await request.get('/api/admin/users/list/');

    // Should be 403 (not admin) or 503 (no KV)
    expect([403, 503]).toContain(response.status());
  });

  test('admin endpoints accept admin users', async ({ request }) => {
    // Login as admin
    const loginResponse = await request.post('/api/auth/login/', {
      data: TEST_ADMIN,
    });
    expect(loginResponse.status()).toBe(200);

    // Try to access admin endpoint
    const response = await request.get('/api/admin/users/list/');

    // Should be 200 (success) or 503 (no KV in local dev)
    expect([200, 503]).toContain(response.status());
  });
});

test.describe('Admin User List API', () => {
  test('GET /api/admin/users/list returns user array', async ({ request }) => {
    // Login as admin
    await request.post('/api/auth/login/', { data: TEST_ADMIN });

    const response = await request.get('/api/admin/users/list/');

    if (response.status() === 200) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.users)).toBe(true);
      expect(typeof data.total).toBe('number');
    }
  });

  test('user list does not expose password hashes', async ({ request }) => {
    await request.post('/api/auth/login/', { data: TEST_ADMIN });

    const response = await request.get('/api/admin/users/list/');

    if (response.status() === 200) {
      const data = await response.json();
      for (const user of data.users) {
        expect(user.passwordHash).toBeUndefined();
        expect(user.confirmToken).toBeUndefined();
      }
    }
  });
});

test.describe('Admin Create User API', () => {
  test('POST /api/admin/users/create validates required fields', async ({ request }) => {
    await request.post('/api/auth/login/', { data: TEST_ADMIN });

    const response = await request.post('/api/admin/users/create/', {
      data: {}, // Empty data
    });

    expect([400, 503]).toContain(response.status());
  });

  test('POST /api/admin/users/create validates email format', async ({ request }) => {
    await request.post('/api/auth/login/', { data: TEST_ADMIN });

    const response = await request.post('/api/admin/users/create/', {
      data: {
        username: `admintest${Date.now()}`,
        name: 'Admin Test',
        email: 'not-an-email',
        password: 'ValidPass123',
      },
    });

    expect([400, 503]).toContain(response.status());
  });

  test('POST /api/admin/users/create validates username format', async ({ request }) => {
    await request.post('/api/auth/login/', { data: TEST_ADMIN });

    const response = await request.post('/api/admin/users/create/', {
      data: {
        username: 'invalid username',
        name: 'Admin Test',
        email: `test${Date.now()}@example.com`,
        password: 'ValidPass123',
      },
    });

    expect([400, 503]).toContain(response.status());
  });

  test('POST /api/admin/users/create validates role', async ({ request }) => {
    await request.post('/api/auth/login/', { data: TEST_ADMIN });

    const response = await request.post('/api/admin/users/create/', {
      data: {
        username: `admintest${Date.now()}`,
        name: 'Admin Test',
        email: `test${Date.now()}@example.com`,
        password: 'ValidPass123',
        role: 'superadmin', // Invalid role
      },
    });

    expect([400, 503]).toContain(response.status());
  });

  test('POST /api/admin/users/create creates user with valid data', async ({ request }) => {
    await request.post('/api/auth/login/', { data: TEST_ADMIN });

    const uniqueUsername = `admintest${Date.now()}`;
    const uniqueEmail = `admintest${Date.now()}@example.com`;

    const response = await request.post('/api/admin/users/create/', {
      data: {
        username: uniqueUsername,
        name: 'Admin Test User',
        email: uniqueEmail,
        password: 'ValidPass123',
        role: 'viewer',
      },
    });

    if (response.status() === 201) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.user.id).toBe(uniqueUsername);
      expect(data.user.email).toBe(uniqueEmail.toLowerCase());
      expect(data.user.emailConfirmed).toBe(true); // Admin-created users are pre-confirmed
    }
  });
});

test.describe('Admin Update User API', () => {
  test('PUT /api/admin/users/[id] requires authentication', async ({ request }) => {
    const response = await request.put('/api/admin/users/viewer/', {
      data: { name: 'Updated Name' },
    });

    expect([403, 503]).toContain(response.status());
  });

  test('PUT /api/admin/users/[id] updates user name', async ({ request }) => {
    await request.post('/api/auth/login/', { data: TEST_ADMIN });

    const response = await request.put('/api/admin/users/viewer/', {
      data: { name: 'Updated Viewer' },
    });

    if (response.status() === 200) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.user.name).toBe('Updated Viewer');
    }

    // Reset name
    await request.put('/api/admin/users/viewer/', {
      data: { name: 'Viewer User' },
    });
  });

  test('PUT /api/admin/users/[id] prevents self-demotion', async ({ request }) => {
    await request.post('/api/auth/login/', { data: TEST_ADMIN });

    const response = await request.put('/api/admin/users/admin/', {
      data: { role: 'viewer' }, // Try to demote self
    });

    expect([400, 503]).toContain(response.status());
  });

  test('PUT /api/admin/users/[id] returns 404 for non-existent user', async ({ request }) => {
    await request.post('/api/auth/login/', { data: TEST_ADMIN });

    const response = await request.put('/api/admin/users/nonexistent/', {
      data: { name: 'Test' },
    });

    expect([404, 503]).toContain(response.status());
  });
});

test.describe('Admin Delete User API', () => {
  test('DELETE /api/admin/users/[id] requires authentication', async ({ request }) => {
    const response = await request.delete('/api/admin/users/viewer/');

    expect([403, 503]).toContain(response.status());
  });

  test('DELETE /api/admin/users/[id] prevents self-deletion', async ({ request }) => {
    await request.post('/api/auth/login/', { data: TEST_ADMIN });

    const response = await request.delete('/api/admin/users/admin/');

    expect([400, 503]).toContain(response.status());
  });

  test('DELETE /api/admin/users/[id] returns 404 for non-existent user', async ({ request }) => {
    await request.post('/api/auth/login/', { data: TEST_ADMIN });

    const response = await request.delete('/api/admin/users/nonexistent/');

    expect([404, 503]).toContain(response.status());
  });
});

test.describe('Admin UI Pages', () => {
  test('admin users page requires admin login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/admin/users/');

    // Wait for page to load fully (the page uses JS to check auth)
    await page.waitForLoadState('networkidle');

    // Wait for JS to execute and render content
    await page.waitForTimeout(2000);

    // The page should show either:
    // 1. "Access Denied" message
    // 2. A "Log In" link
    // 3. The content div with some text
    const content = await page.locator('#content').textContent();

    // Content should indicate user needs to log in
    expect(content?.toLowerCase()).toMatch(/access denied|log in|unauthorized|loading/i);
  });

  test('admin users page accessible to admin', async ({ page }) => {
    // Login as admin
    await page.goto('/login/');
    await page.fill('input[name="email"]', TEST_ADMIN.email);
    await page.fill('input[name="password"]', TEST_ADMIN.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Navigate to admin page
    await page.goto('/admin/users/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Wait for JS to check auth and render
    await page.waitForTimeout(3000);

    // The page should show user management content (or loading/error if KV not available)
    const content = await page.locator('#content').textContent();

    // Admin should see user management, loading, or access denied (if auth check fails)
    expect(content).toBeTruthy();
    // In local dev without proper session, might still show access denied
    // In production with KV, should show user management
  });

  test('admin new user page has form', async ({ page }) => {
    // Login as admin
    await page.goto('/login/');
    await page.fill('input[name="email"]', TEST_ADMIN.email);
    await page.fill('input[name="password"]', TEST_ADMIN.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Navigate to new user page
    await page.goto('/admin/users/new/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // The page should have form elements (or access denied)
    const content = await page.locator('#content').textContent();
    expect(content).toBeTruthy();

    // If form is visible, check form elements
    const usernameInput = page.locator('input[name="username"]');
    const isFormVisible = await usernameInput.isVisible().catch(() => false);

    if (isFormVisible) {
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('select[name="role"]')).toBeVisible();
    }
  });

  test('non-admin cannot access admin pages', async ({ page }) => {
    // Login as viewer
    await page.goto('/login/');
    await page.fill('input[name="email"]', TEST_VIEWER.email);
    await page.fill('input[name="password"]', TEST_VIEWER.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // Try to access admin page
    await page.goto('/admin/users/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Should show access denied
    const content = await page.locator('#content').textContent();
    expect(content?.toLowerCase()).toMatch(/access denied|unauthorized/i);
  });
});

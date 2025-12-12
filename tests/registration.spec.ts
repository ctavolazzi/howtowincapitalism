import { test, expect } from '@playwright/test';

/**
 * User Registration E2E Tests (TDD)
 *
 * Tests the complete registration flow:
 * - Registration form display
 * - Form validation
 * - Successful registration
 * - Duplicate email handling
 * - Email confirmation
 *
 * Test user: folktechnica@gmail.com
 */

const TEST_USER = {
  username: 'folktechnica',
  name: 'Folk Technica',
  email: 'folktechnica@gmail.com',
  password: 'UserPass1234',
};

test.describe('Registration Page', () => {
  test('displays registration form', async ({ page }) => {
    await page.goto('/register/');

    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('has link to login page', async ({ page }) => {
    await page.goto('/register/');

    const loginLink = page.locator('a[href="/login/"]');
    await expect(loginLink).toBeVisible();
  });
});

test.describe('Registration Form Validation', () => {
  test('shows error for empty fields', async ({ page }) => {
    await page.goto('/register/');

    // Submit empty form
    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(page.locator('.error, [class*="error"]')).toBeVisible({ timeout: 5000 });
  });

  test('shows error for invalid email', async ({ page }) => {
    await page.goto('/register/');

    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'notanemail');
    await page.fill('input[name="password"]', 'ValidPass123');
    await page.click('button[type="submit"]');

    // Should show email validation error
    await expect(page.locator('.error, [class*="error"]')).toBeVisible({ timeout: 5000 });
  });

  test('shows error for weak password', async ({ page }) => {
    await page.goto('/register/');

    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', '123'); // Too short
    await page.click('button[type="submit"]');

    // Should show password validation error
    await expect(page.locator('.error, [class*="error"]')).toBeVisible({ timeout: 5000 });
  });

  test('shows error for username with spaces', async ({ page }) => {
    await page.goto('/register/');

    await page.fill('input[name="username"]', 'invalid username');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'ValidPass123');
    await page.click('button[type="submit"]');

    // Should show username validation error
    await expect(page.locator('.error, [class*="error"]')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Successful Registration', () => {
  test('successful registration shows confirmation message', async ({ page }) => {
    await page.goto('/register/');

    await page.fill('input[name="username"]', TEST_USER.username);
    await page.fill('input[name="name"]', TEST_USER.name);
    await page.fill('input[name="email"]', TEST_USER.email);
    await page.fill('input[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    // Should show success message about checking email
    await expect(page.locator('.success, [class*="success"]')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/check your email/i)).toBeVisible();
  });
});

test.describe('Duplicate Registration', () => {
  test('shows error when email already registered', async ({ page }) => {
    // First, try to register an existing user (admin@email.com)
    await page.goto('/register/');

    await page.fill('input[name="username"]', 'newadmin');
    await page.fill('input[name="name"]', 'New Admin');
    await page.fill('input[name="email"]', 'admin@email.com'); // Already exists
    await page.fill('input[name="password"]', 'ValidPass123');
    await page.click('button[type="submit"]');

    // Should show duplicate error
    await expect(page.locator('.error, [class*="error"]')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/already registered|already exists/i)).toBeVisible();
  });
});

test.describe('Registration API Endpoints', () => {
  test('POST /api/auth/register validates required fields', async ({ request }) => {
    const response = await request.post('/api/auth/register/', {
      data: {}, // Empty data
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toBeTruthy();
  });

  test('POST /api/auth/register validates email format', async ({ request }) => {
    const response = await request.post('/api/auth/register/', {
      data: {
        username: 'testuser',
        name: 'Test User',
        email: 'not-an-email',
        password: 'ValidPass123',
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('email');
  });

  test('POST /api/auth/register validates password strength', async ({ request }) => {
    const response = await request.post('/api/auth/register/', {
      data: {
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        password: '123', // Too weak
      },
    });

    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('password');
  });

  test('POST /api/auth/register rejects duplicate email', async ({ request }) => {
    const response = await request.post('/api/auth/register/', {
      data: {
        username: 'newadmin',
        name: 'New Admin',
        email: 'admin@email.com', // Already exists
        password: 'ValidPass123',
      },
    });

    expect(response.status()).toBe(409);
    const data = await response.json();
    expect(data.error).toContain('already');
  });

  test('POST /api/auth/register succeeds with valid data', async ({ request }) => {
    // Use a unique email to avoid conflicts
    const uniqueEmail = `test-${Date.now()}@example.com`;

    const response = await request.post('/api/auth/register/', {
      data: {
        username: `testuser${Date.now()}`,
        name: 'Test User',
        email: uniqueEmail,
        password: 'ValidPass123',
      },
    });

    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toContain('email');
  });
});

test.describe('Email Confirmation', () => {
  test('GET /api/auth/confirm with invalid token returns error', async ({ request }) => {
    const response = await request.get('/api/auth/confirm/?token=invalid-token-12345');

    // Should redirect to error page or return error
    expect(response.status()).toBe(302); // Redirect
    expect(response.headers()['location']).toContain('/confirm/error');
  });

  test('confirmation success page exists', async ({ page }) => {
    await page.goto('/confirm/success/');

    // Should show success message
    await expect(page.getByText(/confirmed|verified/i)).toBeVisible();
  });

  test('confirmation error page exists', async ({ page }) => {
    await page.goto('/confirm/error/');

    // Should show error message
    await expect(page.getByText(/invalid|expired|error/i)).toBeVisible();
  });
});

test.describe('Unconfirmed User Cannot Login', () => {
  test('unconfirmed user sees message to check email', async ({ page }) => {
    // Register a new user
    const uniqueEmail = `unconfirmed-${Date.now()}@example.com`;

    await page.goto('/register/');
    await page.fill('input[name="username"]', `unconfirmed${Date.now()}`);
    await page.fill('input[name="name"]', 'Unconfirmed User');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', 'ValidPass123');
    await page.click('button[type="submit"]');

    // Wait for registration to complete
    await expect(page.getByText(/check your email/i)).toBeVisible({ timeout: 10000 });

    // Try to login with unconfirmed email
    await page.goto('/login/');
    await page.fill('input[name="email"]', uniqueEmail);
    await page.fill('input[name="password"]', 'ValidPass123');
    await page.click('button[type="submit"]');

    // Should show error about confirming email
    await expect(page.getByText(/confirm|verify/i)).toBeVisible({ timeout: 5000 });
  });
});

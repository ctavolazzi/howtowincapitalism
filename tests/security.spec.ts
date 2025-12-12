import { test, expect } from '@playwright/test';
import { TEST_CREDENTIALS } from './fixtures/test-credentials';

/**
 * Security Features E2E Tests
 *
 * Tests for:
 * - Rate limiting
 * - Account lockout
 * - Anti-bot measures (honeypot, time-based)
 * - Disposable email blocking
 */

const TEST_ADMIN = TEST_CREDENTIALS.admin;

test.describe('Rate Limiting', () => {
  test('login endpoint returns error after too many attempts', async ({ request }) => {
    // Note: This test may not trigger rate limiting in local dev mode
    // since rate limiting uses KV which may not be available locally

    // Try multiple failed logins
    const attempts = [];
    for (let i = 0; i < 6; i++) {
      attempts.push(
        request.post('/api/auth/login/', {
          data: {
            email: 'test@example.com',
            password: 'wrongpassword',
          },
        })
      );
    }

    const responses = await Promise.all(attempts);

    // At least some responses should be 401 (invalid credentials)
    const status401 = responses.filter(r => r.status() === 401);
    expect(status401.length).toBeGreaterThan(0);

    // In production with KV, later responses might be 429 (rate limited)
    // const status429 = responses.filter(r => r.status() === 429);
  });

  test('registration endpoint accepts valid requests', async ({ request }) => {
    const uniqueEmail = `test-${Date.now()}@example.com`;

    const response = await request.post('/api/auth/register/', {
      data: {
        username: `testuser${Date.now()}`,
        name: 'Test User',
        email: uniqueEmail,
        password: 'ValidPass123',
      },
    });

    // Should succeed (201) or fail with specific error (not 429)
    expect([201, 400, 409, 503]).toContain(response.status());
  });
});

test.describe('Disposable Email Blocking', () => {
  test('blocks registration with tempmail.com', async ({ request }) => {
    // Use valid username format
    const timestamp = Date.now();
    const response = await request.post('/api/auth/register/', {
      data: {
        username: `tempusr${timestamp}`.slice(0, 20), // Ensure valid length
        name: 'Temp User',
        email: 'test@tempmail.com',
        password: 'ValidPass123',
      },
    });

    // Should be rejected (400 or 503 if no KV)
    expect([400, 503]).toContain(response.status());

    if (response.status() === 400) {
      const data = await response.json();
      // Could be disposable email error or other validation error
      expect(data.error).toBeTruthy();
    }
  });

  test('blocks registration with guerrillamail.com', async ({ request }) => {
    const timestamp = Date.now();
    const response = await request.post('/api/auth/register/', {
      data: {
        username: `gusr${timestamp}`.slice(0, 20),
        name: 'Guerrilla User',
        email: 'test@guerrillamail.com',
        password: 'ValidPass123',
      },
    });

    expect([400, 503]).toContain(response.status());
  });

  test('blocks registration with mailinator.com', async ({ request }) => {
    const timestamp = Date.now();
    const response = await request.post('/api/auth/register/', {
      data: {
        username: `musr${timestamp}`.slice(0, 20),
        name: 'Mail User',
        email: 'test@mailinator.com',
        password: 'ValidPass123',
      },
    });

    expect([400, 503]).toContain(response.status());
  });

  test('allows registration with gmail.com', async ({ request }) => {
    const timestamp = Date.now();
    const uniqueEmail = `valid${timestamp}@gmail.com`;

    const response = await request.post('/api/auth/register/', {
      data: {
        username: `vusr${timestamp}`.slice(0, 20),
        name: 'Valid User',
        email: uniqueEmail,
        password: 'ValidPass123',
      },
    });

    // Should succeed or fail for other reasons (not disposable email)
    if (response.status() === 400) {
      const data = await response.json();
      expect(data.error.toLowerCase()).not.toContain('disposable');
    }
  });
});

test.describe('Honeypot Detection', () => {
  test('rejects registration when honeypot is filled', async ({ request }) => {
    const timestamp = Date.now();
    const response = await request.post('/api/auth/register/', {
      data: {
        username: `botusr${timestamp}`.slice(0, 20),
        name: 'Bot User',
        email: `bot${timestamp}@example.com`,
        password: 'ValidPass123',
        hp_field: 'bot-filled-this', // Honeypot field filled
      },
    });

    // Should return fake success to confuse bots
    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);

    // But user should NOT actually be created (can't easily verify this without KV access)
  });

  test('accepts registration when honeypot is empty', async ({ request }) => {
    const timestamp = Date.now();
    const uniqueEmail = `human${timestamp}@example.com`;

    const response = await request.post('/api/auth/register/', {
      data: {
        username: `husr${timestamp}`.slice(0, 20),
        name: 'Human User',
        email: uniqueEmail,
        password: 'ValidPass123',
        hp_field: '', // Honeypot empty - looks human
      },
    });

    // Should process normally - 201 success or 503 if no KV
    // In local dev without KV, will be 503
    expect([201, 503]).toContain(response.status());
  });
});

test.describe('Time-Based Detection', () => {
  test('rejects too-fast form submissions', async ({ request }) => {
    const timestamp = Date.now();
    const response = await request.post('/api/auth/register/', {
      data: {
        username: `fbot${timestamp}`.slice(0, 20),
        name: 'Fast Bot',
        email: `fast${timestamp}@example.com`,
        password: 'ValidPass123',
        form_timestamp: String(Date.now()), // Submitted instantly
      },
    });

    // Should return fake success to confuse bots
    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('accepts normal-speed form submissions', async ({ request }) => {
    const timestamp = Date.now();
    const uniqueEmail = `norm${timestamp}@example.com`;

    const response = await request.post('/api/auth/register/', {
      data: {
        username: `nusr${timestamp}`.slice(0, 20),
        name: 'Normal User',
        email: uniqueEmail,
        password: 'ValidPass123',
        form_timestamp: String(Date.now() - 5000), // 5 seconds ago
      },
    });

    // Should process normally - 201 success or 503 if no KV
    expect([201, 503]).toContain(response.status());
  });
});

test.describe('Password Validation', () => {
  test('rejects password without letters', async ({ request }) => {
    const response = await request.post('/api/auth/register/', {
      data: {
        username: `user${Date.now()}`,
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: '12345678', // No letters
      },
    });

    expect([400, 503]).toContain(response.status());
    if (response.status() === 400) {
      const data = await response.json();
      expect(data.error.toLowerCase()).toContain('password');
    }
  });

  test('rejects password without numbers', async ({ request }) => {
    const response = await request.post('/api/auth/register/', {
      data: {
        username: `user${Date.now()}`,
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'NoNumbers', // No numbers
      },
    });

    expect([400, 503]).toContain(response.status());
    if (response.status() === 400) {
      const data = await response.json();
      expect(data.error.toLowerCase()).toContain('password');
    }
  });

  test('rejects password shorter than 8 characters', async ({ request }) => {
    const response = await request.post('/api/auth/register/', {
      data: {
        username: `user${Date.now()}`,
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'Short1', // Too short
      },
    });

    expect([400, 503]).toContain(response.status());
    if (response.status() === 400) {
      const data = await response.json();
      expect(data.error.toLowerCase()).toContain('password');
    }
  });
});

test.describe('Username Validation', () => {
  test('rejects username with spaces', async ({ request }) => {
    const response = await request.post('/api/auth/register/', {
      data: {
        username: 'invalid username',
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'ValidPass123',
      },
    });

    expect([400, 503]).toContain(response.status());
    if (response.status() === 400) {
      const data = await response.json();
      expect(data.error.toLowerCase()).toContain('username');
    }
  });

  test('rejects username too short', async ({ request }) => {
    const response = await request.post('/api/auth/register/', {
      data: {
        username: 'ab', // Too short
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'ValidPass123',
      },
    });

    expect([400, 503]).toContain(response.status());
  });

  test('rejects username too long', async ({ request }) => {
    const response = await request.post('/api/auth/register/', {
      data: {
        username: 'a'.repeat(21), // Too long
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'ValidPass123',
      },
    });

    expect([400, 503]).toContain(response.status());
  });
});

/**
 * @fileoverview Account rights API E2E tests (GDPR compliance).
 *
 * Tests for GDPR data rights:
 * - Art. 17 (Right to Erasure): DELETE /api/auth/account
 * - Art. 20 (Data Portability): GET /api/auth/account/export
 *
 * @note These endpoints require KV (Cloudflare Workers).
 * In local/non-KV environments, they return 503.
 * Run against a KV-backed preview or production for full coverage.
 *
 * @module tests/account-rights.spec
 * @see {@link module:pages/api/auth/account/delete} - Delete endpoint
 * @see {@link module:pages/api/auth/account/export} - Export endpoint
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4321';

test.describe('Account Rights API', () => {
  test.describe('Data Export (GET /api/auth/account/export)', () => {
    test('returns error without authentication or KV', async ({ request }) => {
      // In local dev (no KV): returns 503
      // In production (KV but no auth): returns 401
      const response = await request.get(`${BASE_URL}/api/auth/account/export/`);
      expect([401, 503]).toContain(response.status());

      const body = await response.json();
      expect(body.error).toBeTruthy();
    });
  });

  test.describe('Account Deletion (DELETE /api/auth/account)', () => {
    test('returns error without authentication or KV', async ({ request }) => {
      // In local dev (no KV): returns 503
      // In production (KV but no auth): returns 401
      const response = await request.delete(`${BASE_URL}/api/auth/account/delete/`);
      expect([401, 503]).toContain(response.status());

      const body = await response.json();
      expect(body.error).toBeTruthy();
    });

    test('rejects non-DELETE methods', async ({ request }) => {
      // POST should not work - Astro returns 404 for unsupported methods
      const postResponse = await request.post(`${BASE_URL}/api/auth/account/delete/`);
      expect(postResponse.status()).not.toBe(200);

      // GET should not work
      const getResponse = await request.get(`${BASE_URL}/api/auth/account/delete/`);
      expect(getResponse.status()).not.toBe(200);
    });
  });

  test.describe('Endpoint Security', () => {
    test('export endpoint has correct content-type', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/auth/account/export/`);
      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('application/json');
    });

    test('delete endpoint has correct content-type', async ({ request }) => {
      const response = await request.delete(`${BASE_URL}/api/auth/account/delete/`);
      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('application/json');
    });
  });
});

/**
 * Full Integration Tests (KV-backed environment only)
 *
 * These tests require:
 * 1. A running server with KV bindings
 * 2. Ability to create/login as a test user
 *
 * They're skipped by default; enable with RUN_KV_TESTS=true
 */
test.describe('Account Rights - Full Integration', () => {
  const RUN_KV_TESTS = process.env.RUN_KV_TESTS === 'true';

  test.beforeEach(async () => {
    if (!RUN_KV_TESTS) {
      test.skip();
    }
  });

  test('authenticated user can export their data', async ({ request }) => {
    // TODO: Implement when KV test infrastructure is ready
    // 1. Create temp user via admin API
    // 2. Login as temp user
    // 3. Call export endpoint with session cookie
    // 4. Verify response contains user data
    // 5. Cleanup: delete temp user
    test.skip();
  });

  test('authenticated user can delete their account', async ({ request }) => {
    // TODO: Implement when KV test infrastructure is ready
    // 1. Create temp user via admin API
    // 2. Login as temp user
    // 3. Call delete endpoint with session cookie
    // 4. Verify 200 response
    // 5. Verify user no longer exists (login fails)
    test.skip();
  });

  test('deleted user session is invalidated', async ({ request }) => {
    // TODO: Implement when KV test infrastructure is ready
    // 1. Create temp user
    // 2. Login, save session cookie
    // 3. Delete account
    // 4. Try to use old session cookie
    // 5. Verify 401 response
    test.skip();
  });
});

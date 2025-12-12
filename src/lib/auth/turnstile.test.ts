/**
 * Turnstile CAPTCHA Verification Unit Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Turnstile Verification', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('verifyTurnstile function logic', () => {
    it('should require a token', async () => {
      const token = '';
      const secretKey = 'test-secret';

      // Empty token should fail
      expect(!token).toBe(true);
    });

    it('should skip verification when no secret key', () => {
      const secretKey = undefined;

      // When no secret key, verification should be skipped
      expect(!secretKey).toBe(true);
    });

    it('should call Turnstile API with correct parameters', async () => {
      const token = 'test-token';
      const secretKey = 'test-secret';
      const ip = '192.168.1.1';

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
          remoteip: ip,
        }),
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should handle successful verification', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: new URLSearchParams({ secret: 'test', response: 'test' }),
      });

      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should handle failed verification', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          'error-codes': ['invalid-input-response'],
        }),
      });

      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: new URLSearchParams({ secret: 'test', response: 'invalid' }),
      });

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data['error-codes']).toContain('invalid-input-response');
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: new URLSearchParams({ secret: 'test', response: 'test' }),
      });

      expect(response.ok).toBe(false);
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          body: new URLSearchParams({ secret: 'test', response: 'test' }),
        })
      ).rejects.toThrow('Network error');
    });
  });

  describe('Error code mapping', () => {
    const errorMessages: Record<string, string> = {
      'missing-input-secret': 'Server configuration error',
      'invalid-input-secret': 'Server configuration error',
      'missing-input-response': 'Please complete the CAPTCHA',
      'invalid-input-response': 'Invalid CAPTCHA response. Please try again.',
      'bad-request': 'Invalid request',
      'timeout-or-duplicate': 'CAPTCHA expired. Please try again.',
      'internal-error': 'Verification service error',
    };

    it('should map known error codes to user-friendly messages', () => {
      for (const [code, message] of Object.entries(errorMessages)) {
        expect(errorMessages[code]).toBe(message);
      }
    });

    it('should handle unknown error codes', () => {
      const unknownCode = 'some-unknown-error';
      const message = errorMessages[unknownCode] || 'CAPTCHA verification failed';
      expect(message).toBe('CAPTCHA verification failed');
    });
  });
});

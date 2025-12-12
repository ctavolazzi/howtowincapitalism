/**
 * Cloudflare Turnstile CAPTCHA Verification
 *
 * Server-side verification of Turnstile tokens.
 * https://developers.cloudflare.com/turnstile/
 */

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

interface TurnstileResult {
  success: boolean;
  error?: string;
}

/**
 * Verify a Turnstile token server-side
 *
 * @param token - The Turnstile token from the client
 * @param secretKey - The Turnstile secret key
 * @param ip - Optional: The client IP address for additional validation
 * @returns Verification result
 */
export async function verifyTurnstile(
  token: string,
  secretKey: string,
  ip?: string
): Promise<TurnstileResult> {
  if (!token) {
    return { success: false, error: 'Turnstile token required' };
  }

  if (!secretKey) {
    // If no secret key configured, skip verification (for local dev)
    console.warn('TURNSTILE_SECRET_KEY not configured, skipping verification');
    return { success: true };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (ip) {
      formData.append('remoteip', ip);
    }

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      console.error('Turnstile API error:', response.status, response.statusText);
      return { success: false, error: 'Turnstile verification failed' };
    }

    const data: TurnstileVerifyResponse = await response.json();

    if (data.success) {
      return { success: true };
    }

    // Log error codes for debugging
    if (data['error-codes']?.length) {
      console.warn('Turnstile verification failed:', data['error-codes']);
    }

    // Map error codes to user-friendly messages
    const errorMessages: Record<string, string> = {
      'missing-input-secret': 'Server configuration error',
      'invalid-input-secret': 'Server configuration error',
      'missing-input-response': 'Please complete the CAPTCHA',
      'invalid-input-response': 'Invalid CAPTCHA response. Please try again.',
      'bad-request': 'Invalid request',
      'timeout-or-duplicate': 'CAPTCHA expired. Please try again.',
      'internal-error': 'Verification service error',
    };

    const errorCode = data['error-codes']?.[0] || 'unknown';
    const errorMessage = errorMessages[errorCode] || 'CAPTCHA verification failed';

    return { success: false, error: errorMessage };
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return { success: false, error: 'Turnstile verification failed' };
  }
}

/**
 * Get the Turnstile site key for client-side rendering
 * This is safe to expose publicly
 */
export function getTurnstileSiteKey(): string | undefined {
  // This would come from environment variables
  // In Cloudflare Pages, use TURNSTILE_SITE_KEY
  return undefined; // Set via environment
}

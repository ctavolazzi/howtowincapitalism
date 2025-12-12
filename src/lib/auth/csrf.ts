/**
 * CSRF Protection Module
 *
 * Generates and validates encrypted CSRF tokens using AES-GCM.
 * Tokens include IP, country, user-agent, and expiry for validation.
 */

interface CSRFTokenPayload {
  ip: string;
  country: string;
  ua: string;
  exp: number;
}

// Token expiry in milliseconds (60 seconds)
const TOKEN_EXPIRY_MS = 60 * 1000;

// AES-GCM parameters
const ALGORITHM = 'AES-GCM';
const IV_LENGTH = 12; // 96 bits recommended for GCM

/**
 * Derive an AES-256 key from the CSRF secret
 */
async function deriveKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('csrf-salt-htwc'),
      iterations: 10000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Convert ArrayBuffer to hex string
 */
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to ArrayBuffer
 */
function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
}

/**
 * Generate an encrypted CSRF token
 */
export async function generateCSRFToken(
  secret: string,
  ip: string,
  country: string,
  userAgent: string
): Promise<string> {
  const payload: CSRFTokenPayload = {
    ip,
    country,
    ua: userAgent.slice(0, 200), // Truncate long UAs
    exp: Date.now() + TOKEN_EXPIRY_MS,
  };

  const encoder = new TextEncoder();
  const key = await deriveKey(secret);

  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Encrypt the payload
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(JSON.stringify(payload))
  );

  // Combine IV and ciphertext: iv:ciphertext (both hex)
  return `${bufferToHex(iv.buffer)}:${bufferToHex(encrypted)}`;
}

/**
 * Validate a CSRF token
 */
export async function validateCSRFToken(
  token: string,
  secret: string,
  ip: string,
  country: string,
  userAgent: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const [ivHex, ciphertextHex] = token.split(':');
    if (!ivHex || !ciphertextHex) {
      return { valid: false, error: 'Invalid token format' };
    }

    const key = await deriveKey(secret);
    const iv = new Uint8Array(hexToBuffer(ivHex));
    const ciphertext = hexToBuffer(ciphertextHex);

    // Decrypt the payload
    const decrypted = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      ciphertext
    );

    const decoder = new TextDecoder();
    const payload: CSRFTokenPayload = JSON.parse(decoder.decode(decrypted));

    // Check expiry
    if (Date.now() > payload.exp) {
      return { valid: false, error: 'Token expired' };
    }

    // Check IP match
    if (payload.ip !== ip) {
      return { valid: false, error: 'IP mismatch' };
    }

    // Check country match (if available)
    if (payload.country && country && payload.country !== country) {
      return { valid: false, error: 'Country mismatch' };
    }

    // Check user agent match (partial, since UAs can vary slightly)
    const truncatedUA = userAgent.slice(0, 200);
    if (payload.ua !== truncatedUA) {
      return { valid: false, error: 'User agent mismatch' };
    }

    return { valid: true };
  } catch (error) {
    console.error('CSRF validation error:', error);
    return { valid: false, error: 'Token validation failed' };
  }
}

/**
 * Extract request metadata for CSRF token generation/validation
 */
export function getRequestMetadata(request: Request): {
  ip: string;
  country: string;
  userAgent: string;
} {
  return {
    ip: request.headers.get('CF-Connecting-IP') ||
        request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
        'unknown',
    country: request.headers.get('CF-IPCountry') || 'unknown',
    userAgent: request.headers.get('User-Agent') || 'unknown',
  };
}

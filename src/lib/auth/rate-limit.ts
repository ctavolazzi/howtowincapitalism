/**
 * Rate Limiting Module
 *
 * Uses Cloudflare KV to track and limit login/registration attempts.
 * Protects against brute force and credential stuffing attacks.
 */

// Rate limit configuration
const RATE_LIMITS = {
  login: {
    ip: { max: 5, windowMs: 15 * 60 * 1000 }, // 5 per IP per 15 minutes
    email: { max: 10, windowMs: 60 * 60 * 1000 }, // 10 per email per hour
  },
  register: {
    ip: { max: 3, windowMs: 60 * 60 * 1000 }, // 3 per IP per hour
    global: { max: 100, windowMs: 24 * 60 * 60 * 1000 }, // 100 per day globally
  },
};

// Account lockout configuration
const LOCKOUT_CONFIG = {
  maxAttempts: 20, // Lock after 20 failed attempts
  lockoutDuration: 60 * 60 * 1000, // 1 hour lockout
};

interface RateEntry {
  count: number;
  windowStart: number;
}

interface LockoutEntry {
  until: number;
  reason: string;
  attempts: number;
}

/**
 * Check if an action is rate limited
 */
export async function checkRateLimit(
  kv: KVNamespace,
  action: 'login' | 'register',
  identifier: { ip: string; email?: string }
): Promise<{ allowed: boolean; retryAfter?: number; reason?: string }> {
  const limits = RATE_LIMITS[action];
  const now = Date.now();

  // Check IP rate limit
  const ipKey = `rate:${action}:ip:${identifier.ip}`;
  const ipEntry = await getOrCreateRateEntry(kv, ipKey);

  if (isWindowExpired(ipEntry, limits.ip.windowMs)) {
    // Reset window
    ipEntry.count = 0;
    ipEntry.windowStart = now;
  }

  if (ipEntry.count >= limits.ip.max) {
    const retryAfter = Math.ceil((ipEntry.windowStart + limits.ip.windowMs - now) / 1000);
    return {
      allowed: false,
      retryAfter,
      reason: `Too many ${action} attempts from this IP. Try again in ${Math.ceil(retryAfter / 60)} minutes.`,
    };
  }

  // Check email rate limit (for login)
  if (action === 'login' && identifier.email) {
    const emailKey = `rate:login:email:${identifier.email.toLowerCase()}`;
    const emailEntry = await getOrCreateRateEntry(kv, emailKey);

    if (isWindowExpired(emailEntry, limits.email.windowMs)) {
      emailEntry.count = 0;
      emailEntry.windowStart = now;
    }

    if (emailEntry.count >= limits.email.max) {
      const retryAfter = Math.ceil((emailEntry.windowStart + limits.email.windowMs - now) / 1000);
      return {
        allowed: false,
        retryAfter,
        reason: `Too many login attempts for this account. Try again in ${Math.ceil(retryAfter / 60)} minutes.`,
      };
    }
  }

  // Check global rate limit (for registration)
  if (action === 'register') {
    const globalKey = `rate:register:daily`;
    const globalEntry = await getOrCreateRateEntry(kv, globalKey);

    if (isWindowExpired(globalEntry, RATE_LIMITS.register.global.windowMs)) {
      globalEntry.count = 0;
      globalEntry.windowStart = now;
    }

    if (globalEntry.count >= RATE_LIMITS.register.global.max) {
      return {
        allowed: false,
        reason: 'Registration temporarily unavailable. Please try again later.',
      };
    }
  }

  return { allowed: true };
}

/**
 * Record a rate-limited action (call after checkRateLimit returns allowed: true)
 */
export async function recordRateLimitedAction(
  kv: KVNamespace,
  action: 'login' | 'register',
  identifier: { ip: string; email?: string },
  success: boolean
): Promise<void> {
  const limits = RATE_LIMITS[action];
  const now = Date.now();

  // Always increment IP counter
  const ipKey = `rate:${action}:ip:${identifier.ip}`;
  await incrementRateEntry(kv, ipKey, limits.ip.windowMs);

  // Increment email counter for failed login attempts
  if (action === 'login' && identifier.email && !success) {
    const emailKey = `rate:login:email:${identifier.email.toLowerCase()}`;
    await incrementRateEntry(kv, emailKey, limits.email.windowMs);

    // Track failed attempts for lockout
    await trackFailedAttempt(kv, identifier.email);
  }

  // Increment global counter for registration
  if (action === 'register') {
    const globalKey = `rate:register:daily`;
    await incrementRateEntry(kv, globalKey, RATE_LIMITS.register.global.windowMs);
  }

  // Clear failed attempt counter on successful login
  if (action === 'login' && success && identifier.email) {
    await clearFailedAttempts(kv, identifier.email);
  }
}

/**
 * Check if an account is locked out
 */
export async function checkAccountLockout(
  kv: KVNamespace,
  email: string
): Promise<{ locked: boolean; until?: number; reason?: string }> {
  const lockoutKey = `lockout:${email.toLowerCase()}`;
  const lockoutData = await kv.get(lockoutKey);

  if (!lockoutData) {
    return { locked: false };
  }

  const lockout: LockoutEntry = JSON.parse(lockoutData);
  const now = Date.now();

  if (now >= lockout.until) {
    // Lockout expired, clear it
    await kv.delete(lockoutKey);
    return { locked: false };
  }

  const remainingMs = lockout.until - now;
  return {
    locked: true,
    until: lockout.until,
    reason: `Account locked due to too many failed attempts. Try again in ${Math.ceil(remainingMs / 60000)} minutes.`,
  };
}

/**
 * Track a failed login attempt and possibly lock the account
 */
async function trackFailedAttempt(kv: KVNamespace, email: string): Promise<void> {
  const failedKey = `failed:${email.toLowerCase()}`;
  const failedData = await kv.get(failedKey);

  let attempts = 1;
  if (failedData) {
    const data = JSON.parse(failedData);
    attempts = data.attempts + 1;
  }

  // Store updated attempt count (expires after 1 hour)
  await kv.put(
    failedKey,
    JSON.stringify({ attempts, lastAttempt: Date.now() }),
    { expirationTtl: 3600 }
  );

  // Check if we should lock the account
  if (attempts >= LOCKOUT_CONFIG.maxAttempts) {
    const lockoutKey = `lockout:${email.toLowerCase()}`;
    const lockout: LockoutEntry = {
      until: Date.now() + LOCKOUT_CONFIG.lockoutDuration,
      reason: 'Too many failed login attempts',
      attempts,
    };

    await kv.put(lockoutKey, JSON.stringify(lockout), {
      expirationTtl: Math.ceil(LOCKOUT_CONFIG.lockoutDuration / 1000),
    });

    // Clear the failed attempts counter
    await kv.delete(failedKey);

    console.warn(`Account locked: ${email} after ${attempts} failed attempts`);
  }
}

/**
 * Clear failed attempt counter (call on successful login)
 */
async function clearFailedAttempts(kv: KVNamespace, email: string): Promise<void> {
  const failedKey = `failed:${email.toLowerCase()}`;
  await kv.delete(failedKey);
}

/**
 * Get or create a rate entry
 */
async function getOrCreateRateEntry(kv: KVNamespace, key: string): Promise<RateEntry> {
  const data = await kv.get(key);
  if (data) {
    return JSON.parse(data);
  }
  return { count: 0, windowStart: Date.now() };
}

/**
 * Check if rate window has expired
 */
function isWindowExpired(entry: RateEntry, windowMs: number): boolean {
  return Date.now() - entry.windowStart > windowMs;
}

/**
 * Increment a rate entry
 */
async function incrementRateEntry(kv: KVNamespace, key: string, windowMs: number): Promise<void> {
  const now = Date.now();
  const entry = await getOrCreateRateEntry(kv, key);

  if (isWindowExpired(entry, windowMs)) {
    entry.count = 1;
    entry.windowStart = now;
  } else {
    entry.count++;
  }

  // Store with TTL matching the window (plus buffer)
  await kv.put(key, JSON.stringify(entry), {
    expirationTtl: Math.ceil((windowMs * 1.5) / 1000),
  });
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(retryAfter?: number): Record<string, string> {
  const headers: Record<string, string> = {};
  if (retryAfter) {
    headers['Retry-After'] = String(retryAfter);
    headers['X-RateLimit-Reset'] = String(Math.ceil(Date.now() / 1000) + retryAfter);
  }
  return headers;
}

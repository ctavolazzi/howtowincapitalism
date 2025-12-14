# Security Documentation

> Complete security documentation for How To Win Capitalism
>
> Last Updated: 2025-12-14

---

## Table of Contents

1. [Security Overview](#security-overview)
2. [Authentication Security](#authentication-security)
3. [Password Security](#password-security)
4. [Session Security](#session-security)
5. [CSRF Protection](#csrf-protection)
6. [Rate Limiting](#rate-limiting)
7. [Input Validation](#input-validation)
8. [Bot Protection](#bot-protection)
9. [HTTP Security Headers](#http-security-headers)
10. [Threat Model](#threat-model)
11. [Security Checklist](#security-checklist)
12. [Incident Response](#incident-response)

---

## Security Overview

### Security Posture Summary

| Category | Measure | Status |
|----------|---------|--------|
| Password Storage | PBKDF2 (100k iterations) | ✅ Implemented |
| Session Management | httpOnly cookies | ✅ Implemented |
| CSRF Protection | AES-GCM encrypted tokens | ✅ Implemented |
| Rate Limiting | IP + email-based | ✅ Implemented |
| Account Lockout | After 20 failed attempts | ✅ Implemented |
| Input Validation | Server-side validation | ✅ Implemented |
| Bot Protection | Honeypot + timing + CAPTCHA | ✅ Implemented |
| Email Verification | Required for new accounts | ✅ Implemented |
| Security Headers | CSP, HSTS, etc. | ✅ Implemented |

### Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SECURITY LAYERS                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  LAYER 1: NETWORK SECURITY                                          │    │
│  │  • Cloudflare DDoS protection                                       │    │
│  │  • HTTPS enforcement                                                │    │
│  │  • Security headers (CSP, HSTS, X-Frame-Options)                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  LAYER 2: APPLICATION SECURITY                                      │    │
│  │  • CSRF token validation                                            │    │
│  │  • Rate limiting (IP + email)                                       │    │
│  │  • Input validation and sanitization                                │    │
│  │  • Bot detection (honeypot, timing, CAPTCHA)                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  LAYER 3: AUTHENTICATION SECURITY                                   │    │
│  │  • PBKDF2 password hashing (100k iterations)                       │    │
│  │  • Constant-time comparison                                         │    │
│  │  • Email confirmation required                                      │    │
│  │  • Account lockout after failed attempts                           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  LAYER 4: SESSION SECURITY                                          │    │
│  │  • httpOnly cookies (XSS-resistant)                                │    │
│  │  • Secure flag (HTTPS only)                                        │    │
│  │  • SameSite=Strict (CSRF protection)                               │    │
│  │  • 24-hour auto-expiration                                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  LAYER 5: DATA SECURITY                                             │    │
│  │  • Cloudflare KV encryption at rest                                │    │
│  │  • Sensitive fields stripped from responses                        │    │
│  │  • No secrets in client-side code                                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Authentication Security

### Multi-Factor Verification

```
┌──────────────────────────────────────────────────────────────────┐
│                    LOGIN SECURITY FLOW                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. CSRF Token Validation                                         │
│     └─▶ AES-GCM encrypted, 60-second expiry                      │
│                                                                   │
│  2. Account Lockout Check                                         │
│     └─▶ Blocked after 20 failed attempts                         │
│                                                                   │
│  3. Rate Limit Check                                              │
│     └─▶ 5 per IP/15min, 10 per email/hour                        │
│                                                                   │
│  4. Credential Validation                                         │
│     └─▶ PBKDF2 verification with constant-time comparison        │
│                                                                   │
│  5. Email Confirmation Check                                      │
│     └─▶ Must be confirmed before login                           │
│                                                                   │
│  6. Session Creation                                              │
│     └─▶ 32-byte random token, httpOnly cookie                    │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### Registration Security

| Protection | Implementation |
|------------|----------------|
| Honeypot Field | Hidden field that bots fill |
| Timing Detection | Forms < 3 seconds = rejected |
| CAPTCHA | Cloudflare Turnstile |
| Email Validation | Format + disposable domain blocking |
| Password Strength | Min 8 chars, letters + numbers |
| Rate Limiting | 3 per IP/hour, 100/day global |

---

## Password Security

### Hashing Configuration

```typescript
// src/lib/auth/kv-auth.ts:35-38

const PBKDF2_ITERATIONS = 100000;   // 100,000 iterations
const PBKDF2_SALT_LENGTH = 16;      // 128-bit salt
const PBKDF2_KEY_LENGTH = 32;       // 256-bit key
```

### Hash Format

```
v2:100000:e3b0c44298fc1c14:27ae41e4649b934c
│   │         │                │
│   │         │                └─ Derived key (hex)
│   │         └─ Random salt (hex)
│   └─ Iteration count
└─ Version identifier
```

### Security Features

| Feature | Implementation | Purpose |
|---------|----------------|---------|
| **Per-user salt** | 16 random bytes | Prevents rainbow table attacks |
| **High iterations** | 100,000 | Slows brute force attacks |
| **Constant-time comparison** | XOR-based | Prevents timing attacks |
| **Version prefix** | `v2:` | Enables hash upgrades |

### Constant-Time Comparison

```typescript
// src/lib/auth/kv-auth.ts:148-156

// Prevents timing attacks
if (computedHashHex.length !== storedHashHex.length) {
  return false;
}
let result = 0;
for (let i = 0; i < computedHashHex.length; i++) {
  result |= computedHashHex.charCodeAt(i) ^ storedHashHex.charCodeAt(i);
}
return result === 0;
```

### Password Requirements

| Requirement | Rule |
|-------------|------|
| Minimum length | 8 characters |
| Letters | At least 1 letter (a-z, A-Z) |
| Numbers | At least 1 number (0-9) |

---

## Session Security

### Cookie Configuration

```typescript
// src/lib/auth/kv-auth.ts:310-312

export function createSessionCookie(token: string, expiresAt: Date): string {
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${expiresAt.toUTCString()}`;
}
```

### Cookie Attributes

| Attribute | Value | Security Benefit |
|-----------|-------|------------------|
| `HttpOnly` | Yes | Prevents JavaScript access (XSS protection) |
| `Secure` | Yes | Only sent over HTTPS |
| `SameSite` | Strict | Prevents CSRF attacks |
| `Path` | / | Available site-wide |
| `Expires` | 24 hours | Limits session lifetime |

### Session Token Generation

```typescript
// src/lib/auth/kv-auth.ts:209-217

export function generateSessionToken(): string {
  const array = new Uint8Array(32);  // 256 bits
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
```

### Session Storage

- **Location:** Cloudflare KV
- **Key format:** `session:{token}`
- **TTL:** 24 hours (auto-expiration)
- **Data:** `{userId, createdAt, expiresAt}`

---

## CSRF Protection

### Token Generation

CSRF tokens are AES-GCM encrypted payloads containing client metadata:

```typescript
// src/lib/auth/csrf.ts:8-13

interface CSRFTokenPayload {
  ip: string;      // Client IP address
  country: string; // Country code (Cloudflare header)
  ua: string;      // User agent (truncated)
  exp: number;     // Expiration timestamp
}
```

### Token Configuration

| Setting | Value |
|---------|-------|
| Algorithm | AES-GCM |
| Key derivation | PBKDF2 (10,000 iterations) |
| IV length | 12 bytes (96 bits) |
| Expiry | 60 seconds |

### Token Validation

```typescript
// src/lib/auth/csrf.ts:105-158

export async function validateCSRFToken(
  token: string,
  secret: string,
  ip: string,
  country: string,
  userAgent: string
): Promise<{ valid: boolean; error?: string }> {
  // Validation checks:
  // 1. Token format (iv:ciphertext)
  // 2. Decryption success
  // 3. Expiration (60 seconds)
  // 4. IP match
  // 5. Country match
  // 6. User agent match
}
```

### Validation Rules

| Check | Behavior |
|-------|----------|
| Expiration | Token rejected after 60 seconds |
| IP mismatch | Token rejected |
| Country mismatch | Token rejected (if both available) |
| User agent mismatch | Token rejected |
| Decryption failure | Token rejected |

---

## Rate Limiting

### Configuration

```typescript
// src/lib/auth/rate-limit.ts:8-18

const RATE_LIMITS = {
  login: {
    ip: { max: 5, windowMs: 15 * 60 * 1000 },      // 5 per IP per 15 min
    email: { max: 10, windowMs: 60 * 60 * 1000 }, // 10 per email per hour
  },
  register: {
    ip: { max: 3, windowMs: 60 * 60 * 1000 },           // 3 per IP per hour
    global: { max: 100, windowMs: 24 * 60 * 60 * 1000 }, // 100 per day
  },
};

const LOCKOUT_CONFIG = {
  maxAttempts: 20,
  lockoutDuration: 60 * 60 * 1000,  // 1 hour
};
```

### Rate Limit Summary

| Action | Limit | Window | Key |
|--------|-------|--------|-----|
| Login (IP) | 5 attempts | 15 minutes | IP address |
| Login (Email) | 10 attempts | 1 hour | Email address |
| Register (IP) | 3 attempts | 1 hour | IP address |
| Register (Global) | 100 total | 24 hours | Global |

### Account Lockout

| Setting | Value |
|---------|-------|
| Max failed attempts | 20 |
| Lockout duration | 1 hour |
| Auto-unlock | Yes (after 1 hour) |
| Clear on success | Yes |

### Response Headers

```http
Retry-After: 900
X-RateLimit-Reset: 1702500900
```

---

## Input Validation

### Email Validation

```typescript
// src/pages/api/auth/register.ts:75-77

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

### Username Validation

```typescript
// src/pages/api/auth/register.ts:79-82

function isValidUsername(username: string): boolean {
  // Alphanumeric, underscores, 3-20 chars
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}
```

### Password Validation

```typescript
// src/pages/api/auth/register.ts:84-87

function isValidPassword(password: string): boolean {
  return password.length >= 8 &&
         /[a-zA-Z]/.test(password) &&
         /[0-9]/.test(password);
}
```

### Disposable Email Blocking

41 disposable email domains are blocked:

```typescript
const BLOCKED_DOMAINS = [
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'mailinator.com',
  'yopmail.com',
  // ... 36 more
];
```

---

## Bot Protection

### Honeypot Field

Hidden field in registration form. If filled, request is silently rejected:

```typescript
// src/pages/api/auth/register.ts:94-105

if (hp_field) {
  console.warn('Honeypot triggered - bot detected');
  // Return fake success to confuse bots
  return new Response(
    JSON.stringify({
      success: true,
      message: 'Registration successful...'
    }),
    { status: 201 }
  );
}
```

### Timing Detection

Forms submitted in less than 3 seconds are rejected:

```typescript
// src/pages/api/auth/register.ts:107-125

const MIN_FORM_TIME_MS = 3000;
if (form_timestamp) {
  const timeDiff = Date.now() - parseInt(form_timestamp, 10);
  if (timeDiff < MIN_FORM_TIME_MS) {
    console.warn(`Form submitted in ${timeDiff}ms - bot suspected`);
    // Return fake success
    return new Response(...);
  }
}
```

### Cloudflare Turnstile

CAPTCHA verification on registration:

```typescript
// src/pages/api/auth/register.ts:170-188

const turnstileResult = await verifyTurnstile(
  turnstile_token,
  turnstileSecretKey,
  ip
);

if (!turnstileResult.success) {
  return new Response(
    JSON.stringify({ error: 'CAPTCHA verification failed' }),
    { status: 400 }
  );
}
```

---

## HTTP Security Headers

### Cloudflare Headers Configuration

```
# public/_headers

/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Content Security Policy

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' https://challenges.cloudflare.com;
  frame-src https://challenges.cloudflare.com;
```

### Header Summary

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | nosniff | Prevent MIME sniffing |
| `X-Frame-Options` | DENY | Prevent clickjacking |
| `X-XSS-Protection` | 1; mode=block | XSS filter |
| `Referrer-Policy` | strict-origin-when-cross-origin | Control referer |
| `Permissions-Policy` | camera=(), etc. | Disable features |

---

## Threat Model

### Identified Threats and Mitigations

| Threat | Risk | Mitigation | Status |
|--------|------|------------|--------|
| **Brute Force** | High | Rate limiting, account lockout | ✅ |
| **Credential Stuffing** | High | Rate limiting, CAPTCHA | ✅ |
| **Password Cracking** | Medium | PBKDF2 (100k iterations) | ✅ |
| **Session Hijacking** | Medium | httpOnly, Secure cookies | ✅ |
| **XSS** | Medium | httpOnly cookies, CSP | ✅ |
| **CSRF** | Medium | SameSite cookies, CSRF tokens | ✅ |
| **Bot Registration** | Medium | Honeypot, timing, CAPTCHA | ✅ |
| **Email Enumeration** | Low | Uniform error messages | ✅ |
| **Timing Attacks** | Low | Constant-time comparison | ✅ |
| **Rainbow Tables** | Low | Per-user random salt | ✅ |

### Attack Surface

```
┌─────────────────────────────────────────────────────────────────┐
│                      ATTACK SURFACE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PUBLIC ENDPOINTS (no auth required)                             │
│  ├── POST /api/auth/login          Protected by: rate limit     │
│  ├── POST /api/auth/register       Protected by: CAPTCHA, rate  │
│  ├── POST /api/auth/confirm        Protected by: token expiry   │
│  ├── POST /api/auth/forgot-password Protected by: rate limit    │
│  └── POST /api/auth/reset-password Protected by: token expiry   │
│                                                                  │
│  AUTHENTICATED ENDPOINTS                                         │
│  ├── GET  /api/auth/me             Protected by: session cookie │
│  ├── POST /api/auth/logout         Protected by: session cookie │
│  ├── POST /api/auth/account/delete Protected by: password       │
│  └── GET  /api/auth/account/export Protected by: session cookie │
│                                                                  │
│  ADMIN ENDPOINTS                                                 │
│  ├── GET  /api/admin/users/list    Protected by: admin role     │
│  ├── POST /api/admin/users/create  Protected by: admin role     │
│  ├── GET  /api/admin/users/[id]    Protected by: admin role     │
│  └── DELETE /api/admin/users/[id]  Protected by: admin role     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Security Checklist

### Authentication

- [x] Passwords hashed with PBKDF2 (100k iterations)
- [x] Per-user random salt (16 bytes)
- [x] Constant-time password comparison
- [x] Email confirmation required
- [x] Password strength requirements enforced

### Session Management

- [x] httpOnly cookies
- [x] Secure flag (HTTPS only)
- [x] SameSite=Strict
- [x] 24-hour session expiration
- [x] Cryptographically random tokens (32 bytes)

### Attack Prevention

- [x] Rate limiting on login (5/15min per IP)
- [x] Rate limiting on registration (3/hour per IP)
- [x] Account lockout after 20 failed attempts
- [x] CSRF token validation
- [x] Bot protection (honeypot, timing, CAPTCHA)

### Input Validation

- [x] Email format validation
- [x] Username format validation
- [x] Password strength validation
- [x] Disposable email blocking

### HTTP Security

- [x] X-Content-Type-Options: nosniff
- [x] X-Frame-Options: DENY
- [x] X-XSS-Protection header
- [x] Referrer-Policy header
- [x] Permissions-Policy header

### Data Protection

- [x] Sensitive fields stripped from API responses
- [x] No secrets in client-side code
- [x] No plaintext passwords stored
- [x] Session data stored server-side

---

## Incident Response

### Suspected Breach Checklist

1. **Immediate Actions**
   - Rotate CSRF_SECRET environment variable
   - Invalidate all sessions (clear SESSIONS KV namespace)
   - Review Cloudflare logs for suspicious activity

2. **User Protection**
   - Force password reset for affected users
   - Send notification emails
   - Review account lockout logs

3. **Investigation**
   - Check rate limit logs for unusual patterns
   - Review failed login attempts
   - Check for unauthorized admin access

4. **Recovery**
   - Patch identified vulnerabilities
   - Update affected passwords
   - Document incident and response

### Security Contacts

- **Repository:** https://github.com/ctavolazzi/howtowincapitalism
- **Issues:** https://github.com/ctavolazzi/howtowincapitalism/issues

---

## Related Documentation

- [Authentication](./AUTHENTICATION.md) - Auth system details
- [API Reference](./API_REFERENCE.md) - Endpoint documentation
- [Data Models](./DATA_MODELS.md) - Data storage details

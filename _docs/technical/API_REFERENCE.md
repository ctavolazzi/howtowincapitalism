# API Reference

> Complete API documentation for How To Win Capitalism
>
> Last Updated: 2025-12-14

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Request/Response Format](#requestresponse-format)
4. [Error Handling](#error-handling)
5. [Auth Endpoints](#auth-endpoints)
6. [Admin Endpoints](#admin-endpoints)
7. [Account Endpoints](#account-endpoints)
8. [Rate Limiting](#rate-limiting)
9. [CSRF Protection](#csrf-protection)

---

## Overview

The API is built on Astro's API routes running on Cloudflare Workers. All endpoints return JSON responses.

### Base URL

| Environment | Base URL |
|-------------|----------|
| Production | `https://howtowincapitalism.com/api` |
| Local Dev | `http://localhost:4321/api` |

### API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/login` | User login | No |
| `POST` | `/api/auth/register` | User registration | No |
| `POST` | `/api/auth/logout` | User logout | Yes (cookie) |
| `GET` | `/api/auth/me` | Get current user | Yes (cookie) |
| `POST` | `/api/auth/confirm` | Confirm email | No |
| `POST` | `/api/auth/forgot-password` | Request password reset | No |
| `POST` | `/api/auth/reset-password` | Reset password | No |
| `GET` | `/api/admin/users/list` | List all users | Admin |
| `POST` | `/api/admin/users/create` | Create user | Admin |
| `GET` | `/api/admin/users/[id]` | Get user by ID | Admin |
| `DELETE` | `/api/admin/users/[id]` | Delete user | Admin |
| `POST` | `/api/auth/account/delete` | Delete own account | Yes |
| `GET` | `/api/auth/account/export` | Export account data | Yes |

---

## Authentication

### Cookie-Based Authentication

The API uses httpOnly cookies for session authentication:

```
Cookie: htwc_session=<64-character-hex-token>
```

### Cookie Attributes

| Attribute | Value | Purpose |
|-----------|-------|---------|
| `HttpOnly` | Yes | Prevents JavaScript access |
| `Secure` | Yes | HTTPS only |
| `SameSite` | Strict | CSRF protection |
| `Path` | / | Site-wide access |
| `Expires` | 24 hours | Auto-logout |

### Authentication Flow

```
1. Login Request → POST /api/auth/login
2. Response includes Set-Cookie header
3. Browser stores cookie automatically
4. Subsequent requests include cookie
5. Server validates session from cookie
```

---

## Request/Response Format

### Request Headers

```http
Content-Type: application/json
```

### Success Response

```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response

```json
{
  "error": "Error message here"
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| `200` | Success | Successful GET/POST |
| `201` | Created | Resource created (registration) |
| `400` | Bad Request | Invalid input |
| `401` | Unauthorized | Invalid credentials |
| `403` | Forbidden | Invalid CSRF, email not confirmed |
| `404` | Not Found | Resource not found |
| `409` | Conflict | Resource already exists |
| `423` | Locked | Account locked |
| `429` | Too Many Requests | Rate limited |
| `500` | Server Error | Internal error |
| `503` | Service Unavailable | Feature not available |

### Error Response Examples

```json
// 400 Bad Request
{ "error": "Email and password required" }

// 401 Unauthorized
{ "error": "Invalid email or password" }

// 403 Forbidden (email not confirmed)
{ "error": "Please confirm your email address before logging in.", "needsConfirmation": true }

// 429 Rate Limited
{ "error": "Too many login attempts from this IP. Try again in 15 minutes." }
```

---

## Auth Endpoints

### POST /api/auth/login

Authenticate a user and create a session.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "csrf_token": "encrypted-csrf-token"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User email address |
| `password` | string | Yes | User password |
| `csrf_token` | string | Production | CSRF token from form |

**Success Response (200):**

```json
{
  "success": true,
  "user": {
    "id": "username",
    "email": "user@example.com",
    "name": "Display Name",
    "role": "viewer",
    "accessLevel": 1,
    "avatar": "/favicon.svg",
    "bio": "",
    "emailConfirmed": true,
    "createdAt": "2025-12-14T00:00:00.000Z"
  }
}
```

**Response Headers:**

```http
Set-Cookie: htwc_session=<token>; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=<24h>
```

**Error Responses:**

| Status | Error | Cause |
|--------|-------|-------|
| 400 | "Email and password required" | Missing fields |
| 401 | "Invalid email or password" | Wrong credentials |
| 401 | "Please confirm your email..." | Unconfirmed email |
| 403 | "CSRF token required" | Missing CSRF |
| 403 | "Invalid CSRF token" | Invalid/expired CSRF |
| 429 | "Too many login attempts..." | Rate limited |
| 429 | "Account locked..." | Account lockout |

**Example:**

```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    csrf_token: csrfToken
  })
});

const data = await response.json();
if (data.success) {
  console.log('Logged in as:', data.user.name);
}
```

---

### POST /api/auth/register

Create a new user account.

**Request Body:**

```json
{
  "username": "newuser",
  "name": "Display Name",
  "email": "user@example.com",
  "password": "securepassword123",
  "csrf_token": "encrypted-csrf-token",
  "turnstile_token": "captcha-response-token",
  "hp_field": "",
  "form_timestamp": "1702500000000"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | Yes | 3-20 alphanumeric chars, underscores |
| `name` | string | Yes | Display name |
| `email` | string | Yes | Valid email address |
| `password` | string | Yes | Min 8 chars with letters and numbers |
| `csrf_token` | string | Production | CSRF token |
| `turnstile_token` | string | Production | Cloudflare Turnstile token |
| `hp_field` | string | No | Honeypot field (must be empty) |
| `form_timestamp` | string | No | Form load timestamp (bot detection) |

**Success Response (201):**

```json
{
  "success": true,
  "message": "Registration successful. Check your email to confirm your account."
}
```

**Validation Rules:**

| Field | Rule |
|-------|------|
| Username | 3-20 chars, alphanumeric + underscores only |
| Email | Valid email format, no disposable domains |
| Password | Min 8 chars, at least 1 letter and 1 number |

**Blocked Email Domains:**

41 disposable email providers are blocked including: tempmail.com, guerrillamail.com, 10minutemail.com, mailinator.com, yopmail.com, etc.

**Error Responses:**

| Status | Error | Cause |
|--------|-------|-------|
| 400 | "All fields are required" | Missing fields |
| 400 | "Invalid username..." | Bad username format |
| 400 | "Invalid email format" | Bad email |
| 400 | "Disposable email addresses are not allowed" | Blocked domain |
| 400 | "Invalid password..." | Weak password |
| 400 | "Please complete the CAPTCHA verification" | Missing Turnstile |
| 403 | "CSRF token required" | Missing CSRF |
| 409 | "Email already registered" | Duplicate email |
| 409 | "Username already taken" | Duplicate username |
| 429 | "Too many registrations..." | Rate limited |

---

### POST /api/auth/logout

End the current session.

**Request:**

No body required. Session is identified by cookie.

**Success Response (200):**

```json
{
  "success": true
}
```

**Response Headers:**

```http
Set-Cookie: htwc_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT
```

---

### GET /api/auth/me

Get the currently authenticated user.

**Request:**

No body. Session is identified by cookie.

**Authenticated Response (200):**

```json
{
  "authenticated": true,
  "user": {
    "id": "username",
    "email": "user@example.com",
    "name": "Display Name",
    "role": "viewer",
    "accessLevel": 1,
    "avatar": "/favicon.svg",
    "bio": "",
    "emailConfirmed": true,
    "createdAt": "2025-12-14T00:00:00.000Z"
  }
}
```

**Unauthenticated Response (200):**

```json
{
  "authenticated": false,
  "user": null
}
```

---

### POST /api/auth/confirm

Confirm email address using token.

**Request Body:**

```json
{
  "token": "64-character-hex-confirmation-token"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Email confirmed successfully. You can now log in."
}
```

**Error Responses:**

| Status | Error | Cause |
|--------|-------|-------|
| 400 | "Token required" | Missing token |
| 400 | "Invalid or expired confirmation token" | Bad/expired token |

---

### POST /api/auth/forgot-password

Request a password reset email.

**Request Body:**

```json
{
  "email": "user@example.com",
  "csrf_token": "encrypted-csrf-token"
}
```

**Success Response (200):**

Always returns success to prevent email enumeration:

```json
{
  "success": true,
  "message": "If an account exists with that email, you will receive a password reset link."
}
```

**Error Responses:**

| Status | Error | Cause |
|--------|-------|-------|
| 400 | "Email required" | Missing email |
| 403 | "Invalid CSRF token" | Bad CSRF |

---

### POST /api/auth/reset-password

Reset password using token from email.

**Request Body:**

```json
{
  "token": "64-character-hex-reset-token",
  "password": "newsecurepassword123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Password reset successfully. You can now log in."
}
```

**Error Responses:**

| Status | Error | Cause |
|--------|-------|-------|
| 400 | "Token and password required" | Missing fields |
| 400 | "Invalid password..." | Weak password |
| 400 | "Invalid or expired reset token" | Bad/expired token |

---

## Admin Endpoints

All admin endpoints require `admin` role (accessLevel >= 10).

### GET /api/admin/users/list

List all users.

**Success Response (200):**

```json
{
  "success": true,
  "users": [
    {
      "id": "admin",
      "email": "admin@email.com",
      "name": "Admin User",
      "role": "admin",
      "accessLevel": 10,
      "emailConfirmed": true,
      "createdAt": "2025-12-01T00:00:00.000Z"
    },
    // ... more users
  ]
}
```

**Error Responses:**

| Status | Error | Cause |
|--------|-------|-------|
| 401 | "Not authenticated" | No session |
| 403 | "Admin access required" | Not admin |

---

### POST /api/admin/users/create

Create a new user (admin only).

**Request Body:**

```json
{
  "username": "newuser",
  "name": "New User",
  "email": "newuser@example.com",
  "password": "securepassword123",
  "role": "viewer"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | Yes | User ID |
| `name` | string | Yes | Display name |
| `email` | string | Yes | Email address |
| `password` | string | Yes | Initial password |
| `role` | string | No | admin/editor/contributor/viewer (default: viewer) |

**Success Response (201):**

```json
{
  "success": true,
  "user": { ... }
}
```

---

### GET /api/admin/users/[id]

Get a specific user by ID.

**URL Parameters:**

| Parameter | Description |
|-----------|-------------|
| `id` | User ID (username) |

**Success Response (200):**

```json
{
  "success": true,
  "user": {
    "id": "username",
    "email": "user@example.com",
    "name": "User Name",
    "role": "viewer",
    "accessLevel": 1,
    // ... other fields
  }
}
```

**Error Responses:**

| Status | Error | Cause |
|--------|-------|-------|
| 404 | "User not found" | Invalid ID |

---

### DELETE /api/admin/users/[id]

Delete a user.

**URL Parameters:**

| Parameter | Description |
|-----------|-------------|
| `id` | User ID to delete |

**Success Response (200):**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Responses:**

| Status | Error | Cause |
|--------|-------|-------|
| 400 | "Cannot delete yourself" | Self-deletion attempt |
| 404 | "User not found" | Invalid ID |

---

## Account Endpoints

### POST /api/auth/account/delete

Delete your own account.

**Request Body:**

```json
{
  "password": "currentpassword",
  "confirmation": "DELETE MY ACCOUNT"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `password` | string | Yes | Current password for verification |
| `confirmation` | string | Yes | Must be exactly "DELETE MY ACCOUNT" |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

**Error Responses:**

| Status | Error | Cause |
|--------|-------|-------|
| 400 | "Password and confirmation required" | Missing fields |
| 400 | "Invalid confirmation" | Wrong confirmation text |
| 401 | "Invalid password" | Wrong password |

---

### GET /api/auth/account/export

Export your account data (GDPR compliance).

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "username",
      "email": "user@example.com",
      "name": "Display Name",
      "role": "viewer",
      "accessLevel": 1,
      "bio": "",
      "createdAt": "2025-12-14T00:00:00.000Z"
    },
    "activity": [
      { "type": "login", "timestamp": "2025-12-14T10:00:00.000Z" },
      // ... activity log
    ],
    "exportedAt": "2025-12-14T12:00:00.000Z"
  }
}
```

---

## Rate Limiting

### Rate Limit Configuration

| Action | Limit | Window | Key |
|--------|-------|--------|-----|
| Login (IP) | 5 attempts | 15 minutes | `rate:login:ip:{ip}` |
| Login (Email) | 10 attempts | 1 hour | `rate:login:email:{email}` |
| Register (IP) | 3 attempts | 1 hour | `rate:register:ip:{ip}` |
| Register (Global) | 100 total | 24 hours | `rate:register:daily` |

### Account Lockout

| Setting | Value |
|---------|-------|
| Max failed attempts | 20 |
| Lockout duration | 1 hour |

### Rate Limit Response Headers

```http
Retry-After: 900
X-RateLimit-Reset: 1702500900
```

### Rate Limit Response (429)

```json
{
  "error": "Too many login attempts from this IP. Try again in 15 minutes."
}
```

---

## CSRF Protection

### Token Format

CSRF tokens are AES-GCM encrypted payloads containing:
- Client IP address
- Country code (Cloudflare header)
- User agent
- Expiration timestamp (60 seconds)

### Token Generation

CSRF tokens are generated server-side and embedded in forms:

```html
<input type="hidden" name="csrf_token" value="iv:ciphertext">
```

### Token Validation

Tokens are validated on all state-changing operations:
- Login
- Registration
- Password reset request
- Account deletion

### Validation Rules

1. Token must not be expired (60 second lifetime)
2. Client IP must match
3. Country code must match (if available)
4. User agent must match

---

## Code Examples

### JavaScript/Fetch

```javascript
// Login
async function login(email, password, csrfToken) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin', // Include cookies
    body: JSON.stringify({ email, password, csrf_token: csrfToken })
  });
  return response.json();
}

// Check auth status
async function checkAuth() {
  const response = await fetch('/api/auth/me', {
    credentials: 'same-origin'
  });
  return response.json();
}

// Logout
async function logout() {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'same-origin'
  });
}
```

### cURL

```bash
# Login
curl -X POST https://howtowincapitalism.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}' \
  -c cookies.txt

# Check auth (with saved cookie)
curl https://howtowincapitalism.com/api/auth/me \
  -b cookies.txt

# Logout
curl -X POST https://howtowincapitalism.com/api/auth/logout \
  -b cookies.txt
```

---

## Related Documentation

- [Authentication](./AUTHENTICATION.md) - Auth system details
- [Security](./SECURITY.md) - Security measures
- [Data Models](./DATA_MODELS.md) - Data structures

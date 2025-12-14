# Testing Guide

> Complete testing documentation for How To Win Capitalism
>
> Last Updated: 2025-12-14

---

## Table of Contents

1. [Overview](#overview)
2. [Test Architecture](#test-architecture)
3. [Running Tests](#running-tests)
4. [E2E Tests (Playwright)](#e2e-tests-playwright)
5. [Unit Tests (Vitest)](#unit-tests-vitest)
6. [Test Coverage](#test-coverage)
7. [Writing Tests](#writing-tests)
8. [Test Data & Fixtures](#test-data--fixtures)
9. [CI/CD Integration](#cicd-integration)
10. [Debugging Tests](#debugging-tests)

---

## Overview

### Test Strategy

| Type | Framework | Location | Purpose |
|------|-----------|----------|---------|
| **E2E** | Playwright | `tests/*.spec.ts` | User flows, integration |
| **Unit** | Vitest | `src/**/*.test.ts` | Business logic, utilities |

### Test Metrics

| Metric | Value |
|--------|-------|
| Total test files | 16 |
| Total test lines | 3,478 |
| E2E test files | 11 |
| Unit test files | 5 |
| Primary coverage | Auth, decision matrix |

---

## Test Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          TEST ARCHITECTURE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     E2E TESTS (Playwright)                           │    │
│  │  Location: tests/*.spec.ts                                          │    │
│  │                                                                      │    │
│  │  • Browser automation                                               │    │
│  │  • Full user flows                                                  │    │
│  │  • API endpoint testing                                             │    │
│  │  • Visual regression (snapshots)                                    │    │
│  │  • Accessibility testing                                            │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     UNIT TESTS (Vitest)                              │    │
│  │  Location: src/**/*.test.ts                                         │    │
│  │                                                                      │    │
│  │  • Pure function testing                                            │    │
│  │  • Business logic validation                                        │    │
│  │  • Algorithm correctness                                            │    │
│  │  • Edge cases                                                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
howtowincapitalism/
├── tests/                        # E2E tests (Playwright)
│   ├── fixtures/                 # Test fixtures and helpers
│   │   └── test-credentials.ts   # Test user credentials
│   ├── auth.spec.ts              # Authentication tests
│   ├── registration.spec.ts      # Registration tests
│   ├── security.spec.ts          # Security tests
│   ├── admin.spec.ts             # Admin functionality
│   ├── account-rights.spec.ts    # Account CRUD tests
│   ├── users.spec.ts             # User directory tests
│   ├── content.spec.ts           # Content page tests
│   ├── navigation.spec.ts        # Navigation tests
│   ├── accessibility.spec.ts     # A11y tests
│   ├── security-and-smoke.spec.ts # Security headers, smoke tests
│   └── auth-snapshots.spec.ts    # Visual regression
├── src/lib/
│   └── tools/
│       └── decision-matrix.test.ts  # Unit tests
├── playwright.config.ts          # Playwright configuration
└── vitest.config.ts              # Vitest configuration
```

---

## Running Tests

### Quick Reference

```bash
# E2E Tests (Playwright)
npm test                    # Run all E2E tests
npm run test:ui            # Interactive Playwright UI
npm run test:report        # View HTML test report
npm run test:debug         # Debug mode

# Unit Tests (Vitest)
npm run test:unit          # Run unit tests
npm run test:unit:watch    # Watch mode
npm run test:unit:coverage # With coverage report

# All Tests
npm run test:all           # E2E + Unit tests
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:report": "playwright show-report",
    "test:debug": "playwright test --debug",
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:unit:coverage": "vitest run --coverage"
  }
}
```

---

## E2E Tests (Playwright)

### Configuration

```typescript
// playwright.config.ts

import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL || 'http://localhost:4321';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
```

### Test Files Overview

| File | Description | Tests |
|------|-------------|-------|
| `auth.spec.ts` | Authentication flows | Login, logout, session |
| `registration.spec.ts` | User registration | Form, validation, email |
| `security.spec.ts` | Security features | Rate limit, lockout |
| `admin.spec.ts` | Admin functionality | User management |
| `account-rights.spec.ts` | Account operations | Delete, export |
| `users.spec.ts` | User directory | List, profiles |
| `content.spec.ts` | Content pages | FAQ, notes |
| `navigation.spec.ts` | Site navigation | Links, routing |
| `accessibility.spec.ts` | Accessibility | A11y checks |
| `security-and-smoke.spec.ts` | Security headers | CSP, headers |
| `auth-snapshots.spec.ts` | Visual regression | Screenshots |

### Authentication Tests

```typescript
// tests/auth.spec.ts

test.describe('Login Page', () => {
  test('displays login form', async ({ page }) => {
    await page.goto('/login/');
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login/');
    await page.fill('input[name="email"]', 'wrong@email.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error')).toBeVisible({ timeout: 5000 });
  });

  test('successful login redirects to home', async ({ page }) => {
    await page.goto('/login/');
    await page.fill('input[name="email"]', TEST_USERS.admin.email);
    await page.fill('input[name="password"]', TEST_USERS.admin.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 10000 });
  });
});

test.describe('Protected Routes', () => {
  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/faq/introduction/');
    await expect(page).toHaveURL(/\/login\/\?redirect=/, { timeout: 10000 });
  });
});

test.describe('Session Persistence', () => {
  test('session persists across page navigation', async ({ page }) => {
    // Login
    await page.goto('/login/');
    await page.fill('input[name="email"]', TEST_USERS.admin.email);
    await page.fill('input[name="password"]', TEST_USERS.admin.password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');

    // Navigate and verify still logged in
    await page.goto('/faq/');
    await expect(page).not.toHaveURL(/\/login\//);
  });
});
```

### Running Against Different Environments

```bash
# Local development
npm test

# Production/staging
BASE_URL=https://howtowincapitalism.com npm test

# Preview deployment
BASE_URL=https://preview.howtowincapitalism.pages.dev npm test
```

---

## Unit Tests (Vitest)

### Configuration

```typescript
// vitest.config.ts

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist', 'tests/**/*'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**/*.ts'],
    },
  },
});
```

### Decision Matrix Tests

```typescript
// src/lib/tools/decision-matrix.test.ts

import { describe, it, expect } from 'vitest';
import { makeDecision, DecisionMatrix } from './decision-matrix';

describe('DecisionMatrix', () => {
  it('creates a valid matrix with basic input', () => {
    const result = makeDecision({
      options: ['A', 'B', 'C'],
      criteria: ['Cost', 'Speed'],
      scores: {
        'A': [7, 8],
        'B': [9, 5],
        'C': [6, 9],
      },
      weights: [0.6, 0.4],
    });

    expect(result.winner).toBeDefined();
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
    expect(result.confidenceScore).toBeLessThanOrEqual(100);
  });

  it('throws error for empty options', () => {
    expect(() => makeDecision({
      options: [],
      criteria: ['Cost'],
      scores: {},
      weights: [1],
    })).toThrow();
  });

  it('throws error for mismatched weights', () => {
    expect(() => makeDecision({
      options: ['A'],
      criteria: ['Cost', 'Speed'],
      scores: { 'A': [5, 5] },
      weights: [1],  // Should be [0.5, 0.5]
    })).toThrow();
  });
});

describe('Analysis Methods', () => {
  const baseConfig = {
    options: ['A', 'B'],
    criteria: ['Cost', 'Speed'],
    scores: { 'A': [8, 6], 'B': [6, 8] },
    weights: [0.5, 0.5],
  };

  it('weighted method produces valid results', () => {
    const result = makeDecision({ ...baseConfig, method: 'weighted' });
    expect(result.method).toBe('weighted');
  });

  it('normalized method produces valid results', () => {
    const result = makeDecision({ ...baseConfig, method: 'normalized' });
    expect(result.method).toBe('normalized');
  });

  it('ranking method produces valid results', () => {
    const result = makeDecision({ ...baseConfig, method: 'ranking' });
    expect(result.method).toBe('ranking');
  });
});
```

---

## Test Coverage

### Current Coverage

| Module | Tests | Coverage |
|--------|-------|----------|
| Decision Matrix | 52 tests | ~95% |
| Authentication | E2E only | N/A |
| Rate Limiting | E2E only | N/A |
| Permissions | E2E only | N/A |

### Running Coverage Report

```bash
npm run test:unit:coverage
```

Output locations:
- Terminal: Summary
- `coverage/index.html`: Detailed HTML report
- `coverage/coverage-final.json`: JSON for CI

### Coverage Goals

| Metric | Target | Current |
|--------|--------|---------|
| Statements | 80% | ~60% |
| Branches | 75% | ~50% |
| Functions | 80% | ~70% |
| Lines | 80% | ~60% |

---

## Writing Tests

### E2E Test Template

```typescript
import { test, expect, Page } from '@playwright/test';
import { TEST_CREDENTIALS } from './fixtures/test-credentials';

/**
 * Test Suite Description
 */
test.describe('Feature Name', () => {

  test.beforeEach(async ({ page }) => {
    // Common setup
  });

  test('should do something specific', async ({ page }) => {
    // Arrange
    await page.goto('/path/');

    // Act
    await page.click('button');

    // Assert
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

### Unit Test Template

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { functionUnderTest } from './module';

describe('Module Name', () => {

  describe('functionUnderTest', () => {

    it('should return expected result for valid input', () => {
      const result = functionUnderTest('valid input');
      expect(result).toBe('expected output');
    });

    it('should throw for invalid input', () => {
      expect(() => functionUnderTest('')).toThrow('Error message');
    });

    it('should handle edge case', () => {
      const result = functionUnderTest(null);
      expect(result).toBeNull();
    });
  });
});
```

### Test Naming Conventions

```typescript
// E2E: Action-based descriptions
test('displays login form')
test('shows error for invalid credentials')
test('successful login redirects to home')

// Unit: should-based descriptions
it('should create a valid matrix')
it('should throw for empty options')
it('should return null for missing user')
```

---

## Test Data & Fixtures

### Test Credentials

```typescript
// tests/fixtures/test-credentials.ts

export const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@email.com',
    password: 'Adm!n_Secure_2024#',
    role: 'admin',
  },
  editor: {
    email: 'editor@email.com',
    password: 'Ed!tor_Access_2024#',
    role: 'editor',
  },
  contributor: {
    email: 'contributor@email.com',
    password: 'Contr!b_Pass_2024#',
    role: 'contributor',
  },
  viewer: {
    email: 'viewer@email.com',
    password: 'V!ewer_Read_2024#',
    role: 'viewer',
  },
};

export const SITE_PASSWORD = 'test-site-password';
```

### Helper Functions

```typescript
// tests/fixtures/helpers.ts

import { Page } from '@playwright/test';
import { TEST_CREDENTIALS, SITE_PASSWORD } from './test-credentials';

/**
 * Unlock site-wide password gate if present
 */
export async function unlockSiteGate(page: Page) {
  const gate = page.locator('#passwordGate');
  if (await gate.isVisible({ timeout: 1000 }).catch(() => false)) {
    await page.fill('#passwordInput', SITE_PASSWORD);
    await page.click('#passwordForm button[type="submit"]');
    await expect(gate).toBeHidden({ timeout: 5000 });
  }
}

/**
 * Login as specific user role
 */
export async function loginAs(page: Page, role: keyof typeof TEST_CREDENTIALS) {
  const user = TEST_CREDENTIALS[role];
  await page.goto('/login/');
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/');
}

/**
 * Logout current user
 */
export async function logout(page: Page) {
  await page.goto('/');
  await page.click('[data-testid="user-menu"]');
  await page.click('[data-testid="logout-button"]');
  await page.waitForURL('/login/');
}
```

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml

name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run unit tests
        run: npm run test:unit

      - name: Run E2E tests
        run: npm test

      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
```

### Test Artifacts

| Artifact | Location | When |
|----------|----------|------|
| HTML Report | `playwright-report/` | Always |
| Screenshots | `test-results/` | On failure |
| Traces | `test-results/` | On retry |
| Coverage | `coverage/` | Unit tests |

---

## Debugging Tests

### Playwright Debug Mode

```bash
# Open Playwright inspector
npm run test:debug

# Run specific test file
npx playwright test tests/auth.spec.ts --debug

# Run specific test
npx playwright test -g "displays login form" --debug
```

### Playwright UI Mode

```bash
npm run test:ui
```

Features:
- Visual test runner
- Time-travel debugging
- DOM snapshots
- Network inspector

### Headed Mode

```bash
# Run with browser visible
npx playwright test --headed

# Run with slow motion
npx playwright test --headed --slow-mo=500
```

### Vitest Debug

```bash
# Run with verbose output
npm run test:unit -- --reporter=verbose

# Run specific test file
npx vitest run src/lib/tools/decision-matrix.test.ts

# Watch specific file
npx vitest src/lib/tools/decision-matrix.test.ts
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Tests timeout | Increase `timeout` in config |
| Element not found | Add `await page.waitForSelector()` |
| Flaky tests | Add explicit waits, use `toHaveURL` |
| Auth issues | Clear cookies in `beforeEach` |
| Server not ready | Increase `webServer.timeout` |

---

## Related Documentation

- [API Reference](./API_REFERENCE.md) - API endpoints for testing
- [Authentication](./AUTHENTICATION.md) - Auth flows to test
- [Security](./SECURITY.md) - Security features to verify

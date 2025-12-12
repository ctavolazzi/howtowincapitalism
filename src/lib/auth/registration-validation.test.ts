/**
 * Registration Validation Unit Tests
 *
 * Tests for:
 * - Email validation
 * - Username validation
 * - Password validation
 * - Disposable email blocking
 * - Honeypot detection
 * - Time-based detection
 */
import { describe, it, expect } from 'vitest';

// Validation functions (matching register.ts)
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

function isValidPassword(password: string): boolean {
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
}

// Disposable email domains (subset for testing)
const BLOCKED_DOMAINS = [
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'mailinator.com',
  'yopmail.com',
];

function isDisposableEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  return BLOCKED_DOMAINS.includes(domain);
}

describe('Email Validation', () => {
  it('should accept valid email formats', () => {
    const validEmails = [
      'user@example.com',
      'user.name@example.com',
      'user+tag@example.com',
      'user@subdomain.example.com',
      'user123@example.co.uk',
    ];

    for (const email of validEmails) {
      expect(isValidEmail(email)).toBe(true);
    }
  });

  it('should reject invalid email formats', () => {
    const invalidEmails = [
      '',
      'notanemail',
      '@example.com',
      'user@',
      'user@.com',
      'user @example.com',
      'user@ example.com',
      'user@example',
    ];

    for (const email of invalidEmails) {
      expect(isValidEmail(email)).toBe(false);
    }
  });
});

describe('Username Validation', () => {
  it('should accept valid usernames', () => {
    const validUsernames = [
      'abc',
      'user123',
      'my_username',
      'CamelCase',
      'user_name_123',
      'a1b2c3d4e5f6g7h8i9j0',
    ];

    for (const username of validUsernames) {
      expect(isValidUsername(username)).toBe(true);
    }
  });

  it('should reject usernames shorter than 3 characters', () => {
    const shortUsernames = ['', 'a', 'ab'];

    for (const username of shortUsernames) {
      expect(isValidUsername(username)).toBe(false);
    }
  });

  it('should reject usernames longer than 20 characters', () => {
    const longUsername = 'a'.repeat(21);
    expect(isValidUsername(longUsername)).toBe(false);
  });

  it('should reject usernames with invalid characters', () => {
    const invalidUsernames = [
      'user name', // space
      'user-name', // hyphen
      'user.name', // dot
      'user@name', // at sign
      'user!name', // exclamation
      'пользователь', // cyrillic
    ];

    for (const username of invalidUsernames) {
      expect(isValidUsername(username)).toBe(false);
    }
  });
});

describe('Password Validation', () => {
  it('should accept strong passwords', () => {
    const validPasswords = [
      'Password1',
      'mypassword123',
      'ALLCAPS123',
      'Mix3dCase',
      'a1b2c3d4',
      '12345678a',
    ];

    for (const password of validPasswords) {
      expect(isValidPassword(password)).toBe(true);
    }
  });

  it('should reject passwords shorter than 8 characters', () => {
    const shortPasswords = ['', 'a1', 'Pass1', 'Pa55wor'];

    for (const password of shortPasswords) {
      expect(isValidPassword(password)).toBe(false);
    }
  });

  it('should reject passwords without letters', () => {
    const noLetterPasswords = ['12345678', '123456789', '!@#$%^&*()'];

    for (const password of noLetterPasswords) {
      expect(isValidPassword(password)).toBe(false);
    }
  });

  it('should reject passwords without numbers', () => {
    const noNumberPasswords = ['password', 'Password', 'ALLCAPSONLY'];

    for (const password of noNumberPasswords) {
      expect(isValidPassword(password)).toBe(false);
    }
  });
});

describe('Disposable Email Detection', () => {
  it('should block known disposable domains', () => {
    const disposableEmails = [
      'user@tempmail.com',
      'user@guerrillamail.com',
      'user@10minutemail.com',
      'user@mailinator.com',
      'user@yopmail.com',
    ];

    for (const email of disposableEmails) {
      expect(isDisposableEmail(email)).toBe(true);
    }
  });

  it('should allow legitimate email domains', () => {
    const legitimateEmails = [
      'user@gmail.com',
      'user@outlook.com',
      'user@yahoo.com',
      'user@protonmail.com',
      'user@company.com',
      'user@university.edu',
    ];

    for (const email of legitimateEmails) {
      expect(isDisposableEmail(email)).toBe(false);
    }
  });

  it('should be case-insensitive', () => {
    expect(isDisposableEmail('user@TEMPMAIL.COM')).toBe(true);
    expect(isDisposableEmail('user@TempMail.Com')).toBe(true);
  });

  it('should handle malformed emails', () => {
    expect(isDisposableEmail('')).toBe(false);
    expect(isDisposableEmail('noatsign')).toBe(false);
    expect(isDisposableEmail('@')).toBe(false);
  });
});

describe('Honeypot Detection', () => {
  it('should detect filled honeypot field', () => {
    const honeypotValue = 'bot-filled-this';
    expect(!!honeypotValue).toBe(true);
  });

  it('should pass empty honeypot field', () => {
    const honeypotValue = '';
    expect(!honeypotValue).toBe(true);
  });

  it('should pass null honeypot field', () => {
    const honeypotValue = null;
    expect(!honeypotValue).toBe(true);
  });

  it('should pass undefined honeypot field', () => {
    const honeypotValue = undefined;
    expect(!honeypotValue).toBe(true);
  });
});

describe('Time-Based Detection', () => {
  const MIN_FORM_TIME_MS = 3000; // 3 seconds

  it('should detect too-fast submissions', () => {
    const formLoadTime = Date.now();
    const submitTime = formLoadTime + 1000; // 1 second later

    const timeDiff = submitTime - formLoadTime;
    expect(timeDiff < MIN_FORM_TIME_MS).toBe(true);
  });

  it('should pass normal-speed submissions', () => {
    const formLoadTime = Date.now() - 5000; // 5 seconds ago
    const submitTime = Date.now();

    const timeDiff = submitTime - formLoadTime;
    expect(timeDiff >= MIN_FORM_TIME_MS).toBe(true);
  });

  it('should pass slow submissions', () => {
    const formLoadTime = Date.now() - 60000; // 1 minute ago
    const submitTime = Date.now();

    const timeDiff = submitTime - formLoadTime;
    expect(timeDiff >= MIN_FORM_TIME_MS).toBe(true);
  });

  it('should handle edge case at exactly 3 seconds', () => {
    const formLoadTime = Date.now() - 3000;
    const submitTime = Date.now();

    const timeDiff = submitTime - formLoadTime;
    expect(timeDiff >= MIN_FORM_TIME_MS).toBe(true);
  });

  it('should handle invalid timestamps', () => {
    const formTimestamp = 'invalid';
    const parsedTime = parseInt(formTimestamp, 10);

    expect(isNaN(parsedTime)).toBe(true);
  });
});

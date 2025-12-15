/**
 * @fileoverview Astro middleware for request processing.
 *
 * Runs before every request to inject common data into locals.
 * Currently handles CSRF token generation for form protection.
 *
 * @module middleware
 * @see {@link module:lib/auth/csrf} - CSRF token utilities
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */

import type { MiddlewareHandler } from 'astro';
import { generateCSRFToken, getRequestMetadata } from './lib/auth/csrf';

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { request, locals } = context;

  // Get CSRF secret from environment
  const csrfSecret = (locals as Record<string, unknown>).runtime?.env?.CSRF_SECRET;

  // Generate CSRF token if secret is available
  if (csrfSecret) {
    const { ip, country, userAgent } = getRequestMetadata(request);
    try {
      const csrfToken = await generateCSRFToken(csrfSecret, ip, country, userAgent);
      // Store token in locals for use in components
      (locals as Record<string, unknown>).csrfToken = csrfToken;
    } catch (error) {
      console.error('Failed to generate CSRF token:', error);
    }
  }

  return next();
};

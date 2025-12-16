/**
 * @fileoverview Vitest unit test configuration.
 *
 * Unit test settings for library code:
 * - Node environment
 * - V8 coverage reporting
 * - Excludes Playwright E2E tests
 *
 * @module vitest.config
 *
 * @author How To Win Capitalism Team
 * @since 1.0.0
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    exclude: ['node_modules', 'dist', 'tests/**/*'], // Exclude Playwright tests
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**/*.ts'],
    },
  },
});

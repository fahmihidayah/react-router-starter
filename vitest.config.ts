import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    exclude: ['node_modules', 'dist', 'build', '.react-router', 'e2e/**'],
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      RATE_LIMIT_ENABLED: 'false',
      DATABASE_URL:
        process.env.TEST_DATABASE_URL ||
        process.env.DATABASE_URL ||
        'postgresql://localhost:5432/learning_tracker_test',
      BETTER_AUTH_SECRET: 'test-secret-key-for-testing-only',
      BETTER_AUTH_URL: 'http://localhost:3000',
      EMAIL_PROVIDER: 'smtp',
      EMAIL_DELIVERY_MODE: 'direct',
      EMAIL_FROM: 'test@example.com',
      EMAIL_FROM_NAME: 'Test App',
      EMAIL_REPLY_TO: 'test@example.com',
      EMAIL_SUPPORT_ADDRESS: 'test@example.com',
      EMAIL_APP_NAME: 'Test App',
      SMTP_HOST: 'localhost',
      SMTP_PORT: '587',
      SMTP_SECURE: 'false',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      reportOnFailure: true,
      include: ['app/**/*.{ts,tsx}'],
      exclude: [
        // Test files
        '**/*.test.{ts,tsx}',
        '**/*.d.ts',

        // Generated files
        'app/paraglide/**',
        '**/.react-router/**',
        '**/build/**',
        '**/dist/**',

        // Framework entry points (hard to test)
        'app/entry.server.tsx',
        'app/entry.client.tsx',
        'app/root.tsx',
        'app/routes.ts',

        // Route files (thin orchestration layers per AGENTS.md)
        'app/routes/**',

        // E2E tests (Playwright)
        'e2e/**',

        // Worker files
        'worker/**',
      ],

      // Global coverage thresholds to prevent regression
      thresholds: {
        lines: 34, // Current: 34.32%, prevent decrease
        functions: 30, // Current: 30.64%
        branches: 25, // Current: 25.12%
        statements: 33, // Current: 33.15%

        // Per-feature thresholds for critical security-sensitive areas
        'app/features/users/services/**': {
          lines: 80,
          functions: 80,
          branches: 70,
        },
        'app/features/users/queries/**': {
          lines: 70,
          functions: 70,
        },
        'app/features/users/middlewares/**': {
          lines: 60,
          functions: 60,
        },
        'app/features/auth/**': {
          lines: 60,
          functions: 60,
        },
        'app/features/security/**': {
          lines: 60,
          functions: 60,
        },
        'app/features/permissions/**': {
          lines: 60,
          functions: 60,
        },
      },
    },
  },
})

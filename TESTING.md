# Testing Guide

This document provides a quick start guide for running tests in the Learning Tracker application.

## Quick Start

### Unit Tests

```bash
# Run all unit tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run with coverage report
bun run test:coverage

# Run specific feature tests
bunx vitest run app/features/users
```

**Current Status:** ✅ 92 passing / 4 failing (minor issues)

### End-to-End Tests

```bash
# First time setup - install browsers
bunx playwright install

# Run all E2E tests
bun run test:e2e

# Run with interactive UI (recommended)
bun run test:e2e:ui

# Debug mode
bun run test:e2e:debug

# Generate new tests by recording
bun run test:e2e:codegen
```

**Current Status:** ✅ 34 E2E tests implemented (5 test files)

## Test Structure

```
├── app/features/*/                  # Unit tests (co-located with code)
│   ├── actions/*.test.ts
│   ├── services/*.test.ts
│   ├── queries/*.test.ts
│   └── components/*.test.tsx
│
├── e2e/                             # End-to-end tests
│   ├── auth/                        # Authentication tests
│   ├── users/                       # User management tests
│   ├── admin/                       # Admin functionality tests
│   ├── fixtures/                    # Test helpers
│   └── utils/                       # Utilities
│
└── docs/testing/                    # Testing documentation
    ├── users-feature-testing-plan.md
    ├── TESTING_UPDATE.md
    └── SUMMARY.md
```

## Prerequisites for E2E Tests

E2E tests require test users in the database:

**Admin User:**
- Email: `admin@test.local`
- Password: `Test1234!@#$`
- Role: admin

**Regular User:**
- Email: `user@test.local`
- Password: `Test1234!@#$`
- Role: user

## Test Coverage

### Unit Tests
- ✅ Actions - HTTP request handlers
- ✅ Services - Business logic
- ✅ Queries - Database operations
- ✅ Loaders - Route data fetching
- ✅ Middlewares - Authentication & authorization
- ✅ Components - UI interactions

### E2E Tests
- ✅ Login & Logout (8 tests)
- ✅ User Registration (8 tests)
- ✅ Access Control (9 tests)
- ✅ Profile Management (5 tests)
- ✅ Admin User Management (3 tests)

## Documentation

### Comprehensive Guides
- **`e2e/README.md`** - Complete E2E testing guide
- **`docs/testing/users-feature-testing-plan.md`** - Detailed testing plan
- **`docs/testing/TESTING_UPDATE.md`** - Implementation status
- **`docs/testing/SUMMARY.md`** - Executive summary

### Project Guidelines
- **`AGENTS.md`** - Architecture and testing best practices
- **`.vitest.config.ts`** - Unit test configuration
- **`playwright.config.ts`** - E2E test configuration

## Code Coverage

### Current Coverage Status

**Overall:** ~34% (Lines), ~25% (Branches), ~30% (Functions)

The project uses Vitest with V8 coverage provider. Coverage thresholds are enforced to prevent regression.

### Running Coverage

```bash
# Generate coverage report
bun run test:coverage

# Watch mode with coverage
bun run test:coverage:watch

# Interactive UI with coverage
bun run test:coverage:ui

# Coverage for specific feature
bun run test:coverage:users
```

### Coverage Reports

After running `bun run test:coverage`, reports are generated in the `coverage/` directory:

- **HTML Report:** `coverage/index.html` - Open in browser for interactive view
- **LCOV Report:** `coverage/lcov.info` - For CI/IDE integration
- **JSON Summary:** `coverage/coverage-summary.json` - Machine-readable metrics

### Coverage Thresholds

The project enforces minimum coverage thresholds:

**Global Minimums:**
- Lines: 34%
- Functions: 30%
- Branches: 25%
- Statements: 33%

**Per-Feature Thresholds (Critical Areas):**
- Users Services: 80% lines, 80% functions
- Users Queries: 70% lines, 70% functions
- Auth Features: 60% lines, 60% functions
- Security Features: 60% lines, 60% functions

Tests will fail if coverage drops below these thresholds, preventing quality regression.

### Excluded from Coverage

The following are excluded from coverage metrics:
- Test files (`**/*.test.{ts,tsx}`)
- Generated files (`.react-router/`, `app/paraglide/`)
- Framework entry points (`app/entry.*.tsx`, `app/root.tsx`)
- Route files (`app/routes/**`) - thin orchestration per AGENTS.md
- E2E tests (`e2e/**`)
- Build output (`build/`, `dist/`)

### Improving Coverage

Focus areas for improvement:
1. **Critical** - Users feature (services, queries, middlewares)
2. **High** - Security and authentication features
3. **Medium** - UI components (`app/components/ui/`)
4. **Low** - Utility functions

To improve coverage for a specific area:
```bash
# Check current coverage for users feature
bun run test:coverage:users

# Write tests for uncovered files
# Run coverage again to verify improvement
```

## Common Commands

```bash
# Unit Tests
bun run test                              # Run all unit tests
bun run test:watch                        # Watch mode
bun run test:coverage                     # With coverage report
bun run test:coverage:ui                  # Interactive coverage UI
bun run test:coverage:watch               # Watch mode with coverage
bun run test:coverage:users               # Coverage for users feature

# E2E Tests
bun run test:e2e                          # Run all E2E tests
bun run test:e2e:ui                       # Interactive mode
bun run test:e2e:debug                    # Debug mode
bunx playwright test e2e/auth/    # Run specific directory

# Type Checking
bun run typecheck                         # Type check all files

# Linting & Formatting
bun run check                             # Check code style
bun run check:fix                         # Fix code style issues
```

## Troubleshooting

### Unit Tests Fail with Environment Errors
- Ensure test environment variables are set in `vitest.config.ts`
- Check `app/env.ts` for test mode handling

### E2E Tests Fail with "Cannot find admin@test.local"
- Create test users in your database (see Prerequisites above)
- Or set up test database with seed script

### E2E Tests Timeout
- Ensure dev server is running on port 5173
- Check `playwright.config.ts` for baseURL configuration
- Increase timeout if needed

## Next Steps

1. **Run tests locally** to familiarize yourself with the setup
2. **Review failing tests** and fix minor assertion issues
3. **Set up test database** for isolated E2E testing
4. **Add tests to CI** for automated testing

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React Router Testing](https://reactrouter.com/en/main/guides/testing)
- [Testing Library](https://testing-library.com/)

---

**For detailed information, see:**
- E2E Tests: `e2e/README.md`
- Testing Plan: `docs/testing/users-feature-testing-plan.md`
- Status Report: `docs/testing/TESTING_UPDATE.md`

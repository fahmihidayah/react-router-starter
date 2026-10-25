# End-to-End (E2E) Tests

This directory contains Playwright-based end-to-end tests for the Learning Tracker application, with a focus on the users feature and authentication flows.

## Overview

E2E tests verify the application works correctly from a user's perspective by simulating real user interactions in a browser environment.

## Test Structure

```
e2e/
├── auth/                  # Authentication flow tests
│   ├── login-logout.spec.ts
│   ├── registration.spec.ts
│   └── (future: password-reset.spec.ts, email-verification.spec.ts)
├── users/                 # User management tests
│   └── profile-management.spec.ts
├── admin/                 # Admin functionality tests
│   ├── user-management.spec.ts
│   └── access-control.spec.ts
├── fixtures/              # Test data and helpers
│   └── auth.ts           # Authentication utilities
└── utils/                 # Utility functions
    ├── database.ts       # Database helpers (TODO: implement)
    └── email.ts          # Email testing helpers (TODO: implement)
```

## Running Tests

### Prerequisites

1. Install Playwright browsers:
   ```bash
   pnpm exec playwright install
   ```

2. Ensure the application is running or will be started automatically (configured in `playwright.config.ts`)

### Running All E2E Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run tests with UI mode (interactive)
pnpm test:e2e:ui

# Run tests in debug mode
pnpm test:e2e:debug

# Run specific test file
pnpm exec playwright test e2e/auth/login-logout.spec.ts
```

### Test Scripts

- `pnpm test:e2e` - Run all E2E tests in headless mode
- `pnpm test:e2e:ui` - Open Playwright UI for interactive testing
- `pnpm test:e2e:debug` - Run tests in debug mode with browser visible
- `pnpm test:e2e:codegen` - Generate test code by recording browser interactions

## Test Coverage

### ✅ Implemented Tests

#### Authentication (`e2e/auth/`)
- **Login & Logout** (`login-logout.spec.ts`)
  - Display login form
  - Login with valid credentials
  - Show error for invalid email
  - Show error for wrong password
  - Show error for non-existent user
  - Logout successfully
  - Clear session after logout
  - Redirect to intended page after login

- **Registration** (`registration.spec.ts`)
  - Display registration form
  - Register new user successfully
  - Validate email format
  - Validate password strength
  - Validate required fields
  - Prevent duplicate email registration
  - Link to login page

#### Access Control (`e2e/admin/`)
- **Access Control** (`access-control.spec.ts`)
  - Allow public access to public routes
  - Require authentication for user routes
  - Require admin role for admin routes
  - Enforce API authentication (401)
  - Enforce API admin requirements (403)
  - Not leak sensitive data
  - Redirect when session expires

#### User Management (`e2e/users/`)
- **Profile Management** (`profile-management.spec.ts`)
  - Display settings page
  - Update profile name
  - Validate empty name
  - Display current email
  - Email change process (skipped - needs implementation)
  - Password change (skipped - needs implementation)
  - Account deletion confirmation

- **Admin User Management** (`admin/user-management.spec.ts`)
  - Display users list
  - Create user button exists
  - Create new user (skipped - needs UI)
  - Edit user details (skipped - needs UI)
  - Change user role (skipped - needs UI)
  - Delete user (skipped - needs UI)
  - Display pagination/count
  - Search/filter functionality

### 🚧 Tests Marked as `.skip()`

Some tests are skipped because they require:
- UI implementation not yet complete
- Email verification flow setup
- Test database/email infrastructure

To enable these tests:
1. Implement the required UI features
2. Set up test email handling
3. Remove `.skip()` from the test
4. Run the test to verify it works

### ❌ Not Yet Implemented

Tests that should be added for complete coverage (per `docs/testing/users-feature-testing-plan.md`):

1. **Email Verification** (`e2e/auth/email-verification.spec.ts`)
   - Verify email with valid token
   - Reject expired token
   - Resend verification email
   - Rate limiting on resend

2. **Password Reset** (`e2e/auth/password-reset.spec.ts`)
   - Request password reset
   - Reset password with valid token
   - Reject expired/invalid token
   - Login with new password

3. **Email Change** (`e2e/users/email-change.spec.ts`)
   - Request email change
   - Confirm from old email
   - Verify new email
   - Complete email change

4. **Account Deletion** (`e2e/users/account-deletion.spec.ts`)
   - Delete own account
   - Require email confirmation
   - Verify cannot login after deletion

## Test Utilities

### Fixtures (`e2e/fixtures/auth.ts`)

Common authentication helpers:

```typescript
import { loginAsUser, loginAsAdmin, logout, clearAuth } from '../fixtures/auth'

test('my test', async ({ page }) => {
  // Login as regular user
  await loginAsUser(page)

  // Or login as admin
  await loginAsAdmin(page)

  // Logout
  await logout(page)

  // Clear auth (before each test)
  await clearAuth(page)
})
```

### Test Users

Predefined test users (defined in `e2e/fixtures/auth.ts`):

- **Admin**: `admin@test.local` / `Test1234!@#$`
- **User**: `user@test.local` / `Test1234!@#$`
- **New User**: For registration tests

**Important**: These users must exist in your test database or be created during test setup.

## Configuration

E2E tests are configured in `playwright.config.ts`:

```typescript
{
  testDir: './e2e',
  baseURL: 'http://localhost:5173',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
}
```

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Use `clearAuth(page)` in `beforeEach` to start clean
- Don't rely on test execution order

### 2. Waiting for Elements
```typescript
// ✅ Good - use built-in waiting
await expect(page.locator('button')).toBeVisible()

// ❌ Bad - hard-coded waits
await page.waitForTimeout(1000)
```

### 3. Selectors
```typescript
// ✅ Good - semantic selectors
page.locator('button[type="submit"]')
page.locator('input[name="email"]')
page.locator('button:has-text("Login")')

// ❌ Bad - brittle selectors
page.locator('.css-class-123')
```

### 4. Assertions
```typescript
// ✅ Good - auto-retrying assertions
await expect(page).toHaveURL(/dashboard/)
await expect(page.locator('h1')).toContainText('Welcome')

// ❌ Bad - non-retrying assertions
const text = await page.locator('h1').textContent()
expect(text).toContain('Welcome')
```

## Troubleshooting

### Tests Fail with "Timeout"
- Increase timeout in `playwright.config.ts`
- Check if the dev server is running
- Verify the baseURL is correct

### Tests Pass Locally but Fail in CI
- Check test data exists in CI database
- Ensure retries are configured
- Check for timing issues

### Authentication Tests Fail
- Verify test users exist in database
- Check session cookie settings
- Ensure auth middleware is working

## TODO: Test Infrastructure

The following infrastructure needs to be implemented for complete E2E testing:

### 1. Test Database
- [ ] Create separate test database
- [ ] Script to reset database before tests
- [ ] Seed script for test data (admin, user, roles)
- [ ] Automatic cleanup after tests

### 2. Test Email Transport
- [ ] Set up email testing (Mailhog, in-memory, or test API)
- [ ] Implement `getVerificationLink()` in `e2e/utils/email.ts`
- [ ] Implement `getPasswordResetLink()`
- [ ] Implement `clearTestEmails()`

### 3. Test Setup/Teardown
- [ ] Global setup script (`e2e/global-setup.ts`)
- [ ] Global teardown script (`e2e/global-teardown.ts`)
- [ ] Per-test database isolation (transactions or reset)

### 4. CI Integration
- [ ] Add E2E tests to CI pipeline
- [ ] Configure test database for CI
- [ ] Store test reports and screenshots
- [ ] Parallel test execution

## Contributing

When adding new E2E tests:

1. Follow existing test structure and naming
2. Add tests to appropriate directory (`auth/`, `users/`, `admin/`)
3. Use existing fixtures and utilities
4. Mark incomplete tests as `.skip()` with a TODO comment
5. Update this README with new test coverage

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Plan](../docs/testing/users-feature-testing-plan.md)
- [Project Test Guidelines](../AGENTS.md#tests-and-verification)

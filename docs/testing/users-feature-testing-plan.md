# Users Feature Testing Plan

## Overview

This document provides a comprehensive testing plan for the `users` feature based on the analysis of existing tests and the project's testing readiness for point #11 (End-to-end testing) in `todo-list-en/01-starter-readiness.md`.

**Analysis Date:** October 15, 2026
**Feature Location:** `app/features/users`
**Current Test Files:** 18 test files
**Current Coverage:** Good unit/integration coverage, missing E2E tests

---

## 1. Feature Structure Overview

The users feature follows the established layered architecture:

```
app/features/users/
├── actions/          # HTTP request handlers (15 files, 8 tested)
├── components/       # UI components (2 files, 1 tested)
├── contexts/         # React contexts for user data
├── loaders/          # Data fetchers for routes (3 files, 2 tested)
├── middlewares/      # Auth and role guards (5 files, 2 tested)
├── queries/          # Database operations (17 files, 7 tested)
├── schemas/          # DB and form validation schemas
├── services/         # Business logic (2 files, 1 tested)
└── types/            # TypeScript types and error definitions
```

**Total Files:** 43 production files
**Total Test Files:** 18 test files
**Test Coverage Ratio:** ~42% of production files have direct tests

---

## 2. Existing Test Coverage Analysis

### 2.1 Well-Tested Areas ✅

#### Queries Layer (7/17 files tested)
- ✅ `create.test.ts` - User creation database operations
- ✅ `update.test.ts` - User update operations
- ✅ `delete.test.ts` - User deletion operations
- ✅ `find-by-email.test.ts` - Email lookup queries
- ✅ `find-paginated.test.ts` - Pagination with filters

**Quality:** Good - Tests mock the database layer and verify SQL operations

#### Actions Layer (6/15 files tested)
- ✅ `register-user-action.test.ts` - User registration flow
- ✅ `create-user-action.test.ts` - Admin user creation
- ✅ `update-user-action.test.ts` - User profile updates
- ✅ `delete-user-action.test.ts` - User deletion
- ✅ `settings-account-deletion.test.ts` - Self-service account deletion
- ✅ `settings-email-change.test.ts` - Email change flow
- ✅ `resend-verification-email-action.test.ts` - Email verification resend

**Quality:** Good - Tests validate form data, service calls, and HTTP responses

#### Services Layer (1/2 files tested)
- ✅ `user.service.test.ts` - Comprehensive service layer tests (206 lines)
  - User creation with Better Auth
  - Registration with email verification
  - CAPTCHA and locale forwarding
  - Pagination, updates, role management
  - Error handling and validation

**Quality:** Excellent - Mocks authentication API and queries, tests all business logic paths

#### Middlewares Layer (2/5 files tested)
- ✅ `api-auth.middleware.test.ts` - API authentication guards
  - Tests 401 (unauthorized) responses
  - Tests 403 (forbidden) responses for non-admin users
  - Tests role-based access control
  - Tests admin-only endpoints

- ✅ `role.middleware.test.ts` - Role-based middleware
  - Email verification checks
  - User role requirements

**Quality:** Excellent - Critical security boundaries are tested

#### Loaders Layer (2/3 files tested)
- ✅ `get-users-loader.test.ts` - User list pagination
- ✅ `get-user-by-id-loader.test.ts` - Single user retrieval

**Quality:** Good - Tests data fetching and 404 responses

#### Components Layer (1/2 files tested)
- ✅ `settings-delete-account-dialog.test.tsx` - Account deletion UI
  - Uses `@vitest-environment jsdom`
  - Tests email confirmation logic
  - Tests form submission
  - Tests dialog open/close behavior

**Quality:** Good - Tests user interactions and accessibility

### 2.2 Missing or Incomplete Tests ⚠️

#### Actions Without Tests (9 files)
- ❌ `delete-many-user-action.ts` - Bulk user deletion
- ❌ `forgot-password-action.ts` - Password reset flow
- ❌ `update-user-role-action.ts` - Admin role assignment
- ❌ Several settings-related actions

#### Queries Without Tests (10 files)
- ❌ `assign-role.ts` / `assign-role-by-key.ts` - Role assignment queries
- ❌ `count-admin.ts` - Admin counting (important for security)
- ❌ `delete-many.ts` - Bulk deletion queries
- ❌ `find-all.ts` / `find-by-id.ts` - Basic queries

#### Middlewares Without Tests (3 files)
- ❌ `auth.middleware.ts` - Core authentication middleware
- ❌ Additional middleware files

#### Components Without Tests (1 file)
- ❌ Other user-related UI components

### 2.3 Test Quality Assessment

#### Strengths
1. **Security-focused:** API auth, role checks, and permission boundaries are tested
2. **Mocking strategy:** Tests follow the "mock the next architectural boundary" principle
3. **Error coverage:** Most tests include error cases (validation, 404, 409 conflicts)
4. **Real-world scenarios:** Tests cover actual user flows (registration, email change, deletion)

#### Weaknesses
1. **No E2E tests:** Missing Playwright or similar end-to-end tests
2. **Incomplete coverage:** ~42% of files have tests
3. **Environment issues:** Some tests fail due to missing Redis configuration in test env
4. **Missing integration tests:** No tests verifying the full stack from route to database

---

## 3. Current Test Execution Status

### 3.1 Passing Tests (54 tests)
```bash
pnpm exec vitest run app/features/users
```

**Results:**
- ✅ 54 tests passing
- ❌ 6 test suites failing due to environment configuration
- ⏱️ Execution time: ~200ms for passing tests

### 3.2 Failing Tests (Environment Issues)

The following test files fail because they import modules that require Redis configuration when `RATE_LIMIT_ENABLED=true`:

1. `register-user-action.test.ts`
2. `resend-verification-email-action.test.ts`
3. `settings-account-deletion.test.ts`
4. `user.service.test.ts`
5. Two others

**Error:**
```
Error: Invalid environment: RATE_LIMIT_REDIS_URL (or REDIS_URL) is required when RATE_LIMIT_ENABLED=true
```

**Fix Required:** Add proper test environment setup or mock the rate limiting module

---

## 4. Testing Readiness for Point #11: End-to-End Testing

### 4.1 Current Status: ❌ NOT READY

According to `todo-list-en/01-starter-readiness.md`, point #11 requires:

- [ ] Add Playwright configuration and a `test:e2e` script
- [ ] Test register, email verification, login, logout, and forgot/reset password
- [ ] Test access separation for public, user, admin, and permission
- [ ] Test profile change, password change, email change, and account deletion
- [ ] Provide an isolated database and email transport for E2E

**Current State:**
- ❌ No Playwright installation found
- ❌ No `test:e2e` script in package.json
- ❌ No E2E tests exist
- ✅ Unit/integration tests cover most flows

### 4.2 Gap Analysis

| Requirement | Unit Tests | E2E Tests | Status |
|------------|-----------|-----------|--------|
| Register | ✅ Tested | ❌ Missing | Partial |
| Email verification | ✅ Tested | ❌ Missing | Partial |
| Login | ⚠️ Limited | ❌ Missing | Incomplete |
| Logout | ❌ Missing | ❌ Missing | Not tested |
| Forgot password | ❌ Missing | ❌ Missing | Not tested |
| Reset password | ❌ Missing | ❌ Missing | Not tested |
| Access separation | ✅ Tested | ❌ Missing | Partial |
| Profile change | ✅ Tested | ❌ Missing | Partial |
| Password change | ❌ Missing | ❌ Missing | Not tested |
| Email change | ✅ Tested | ❌ Missing | Partial |
| Account deletion | ✅ Tested | ❌ Missing | Partial |

---

## 5. Comprehensive Testing Plan

### Phase 1: Fix Existing Tests (Priority: P0)

#### Task 1.1: Fix Environment Configuration Issues
**Estimated Time:** 2 hours

**Steps:**
1. Create a test-specific environment configuration
2. Mock Redis rate limiting for unit tests
3. Update vitest config to set `RATE_LIMIT_ENABLED=false` in test environment
4. Verify all 18 test files pass

**Files to Update:**
- `vitest.config.ts` or create `.env.test`
- Possibly add `vi.mock('~/features/security/rate-limit.server')` to failing tests

**Acceptance Criteria:**
- All 18 existing test files pass without environment errors
- Tests run in < 5 seconds

#### Task 1.2: Complete Unit Test Coverage for Critical Paths
**Estimated Time:** 8 hours

**Missing Critical Tests:**
1. `forgot-password-action.test.ts` - Password reset request
2. `update-user-role-action.test.ts` - Admin role changes
3. `auth.middleware.test.ts` - Core authentication (CRITICAL)
4. `count-admin.test.ts` - Prevent deleting last admin
5. `assign-role.test.ts` - Role assignment queries

**Acceptance Criteria:**
- All critical security paths have tests
- Test coverage for queries layer reaches 70%+
- All actions have at least one happy path test

### Phase 2: Add Integration Tests (Priority: P1)

#### Task 2.1: Create Full-Stack Integration Tests
**Estimated Time:** 6 hours

**Test Scenarios:**
1. **Registration Flow Integration**
   - POST to `/register` → service → queries → database
   - Verify user created, email sent, redirect happens
   - Test with invalid data, duplicate email

2. **Authentication Flow Integration**
   - Login → session creation → cookie setting
   - Protected route access with valid/invalid sessions
   - Logout → session cleanup

3. **Admin User Management Integration**
   - Admin creates user → role assigned → permissions granted
   - Admin deletes user → cascade cleanup
   - Non-admin cannot access admin routes

**Tools:**
- Use Vitest with a test database
- Mock email sending but verify queue/worker integration
- Use `supertest` or similar for HTTP testing

**Files to Create:**
- `app/features/users/__tests__/integration/`
  - `registration-flow.integration.test.ts`
  - `authentication-flow.integration.test.ts`
  - `admin-management.integration.test.ts`

### Phase 3: Add End-to-End Tests (Priority: P1)

#### Task 3.1: Set Up Playwright
**Estimated Time:** 4 hours

**Steps:**
1. Install Playwright: `pnpm add -D @playwright/test`
2. Initialize Playwright: `pnpm exec playwright install`
3. Create `playwright.config.ts`:
   ```ts
   import { defineConfig, devices } from '@playwright/test'

   export default defineConfig({
     testDir: './e2e',
     fullyParallel: true,
     forbidOnly: !!process.env.CI,
     retries: process.env.CI ? 2 : 0,
     workers: process.env.CI ? 1 : undefined,
     reporter: 'html',
     use: {
       baseURL: 'http://localhost:5173',
       trace: 'on-first-retry',
     },
     projects: [
       { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
     ],
     webServer: {
       command: 'pnpm dev',
       url: 'http://localhost:5173',
       reuseExistingServer: !process.env.CI,
     },
   })
   ```
4. Add scripts to `package.json`:
   ```json
   {
     "test:e2e": "playwright test",
     "test:e2e:ui": "playwright test --ui",
     "test:e2e:debug": "playwright test --debug"
   }
   ```
5. Create test database setup script for E2E
6. Configure email capture for E2E (use mailhog or similar)

**Acceptance Criteria:**
- Playwright runs and can open the application
- Test database is isolated and resets between tests
- Email verification can be tested

#### Task 3.2: Implement Core E2E Tests
**Estimated Time:** 16 hours

**Test Files to Create:**

##### `e2e/auth/registration.spec.ts`
```typescript
import { test, expect } from '@playwright/test'

test.describe('User Registration', () => {
  test('should register a new user successfully', async ({ page }) => {
    // Navigate to registration page
    // Fill form (name, email, password)
    // Submit form
    // Verify redirect to verification page
    // Check email was sent (via test email API)
  })

  test('should show validation errors for invalid data', async ({ page }) => {
    // Test weak password
    // Test invalid email
    // Test missing required fields
  })

  test('should prevent duplicate email registration', async ({ page }) => {
    // Register user once
    // Try to register same email again
    // Verify error message
  })
})
```

##### `e2e/auth/login-logout.spec.ts`
```typescript
test.describe('Authentication', () => {
  test('should login with valid credentials', async ({ page }) => {
    // Navigate to login
    // Enter credentials
    // Verify redirect to dashboard
    // Check session cookie exists
  })

  test('should logout successfully', async ({ page }) => {
    // Login first
    // Click logout
    // Verify redirect to home
    // Verify session cleared
  })

  test('should reject invalid credentials', async ({ page }) => {
    // Try wrong password
    // Verify error message
    // Verify no session created
  })
})
```

##### `e2e/auth/email-verification.spec.ts`
```typescript
test.describe('Email Verification', () => {
  test('should verify email with valid token', async ({ page, request }) => {
    // Register user
    // Get verification token from email
    // Click verification link
    // Verify success message
    // Verify can now access protected routes
  })

  test('should resend verification email', async ({ page }) => {
    // Register user
    // Click resend button
    // Verify new email sent
    // Verify rate limiting
  })
})
```

##### `e2e/auth/password-reset.spec.ts`
```typescript
test.describe('Password Reset', () => {
  test('should request password reset', async ({ page }) => {
    // Go to forgot password
    // Enter email
    // Verify email sent
  })

  test('should reset password with valid token', async ({ page }) => {
    // Request reset
    // Get reset token
    // Enter new password
    // Verify can login with new password
  })

  test('should reject expired reset tokens', async ({ page }) => {
    // Use expired/invalid token
    // Verify error
  })
})
```

##### `e2e/users/profile-management.spec.ts`
```typescript
test.describe('Profile Management', () => {
  test('should update profile information', async ({ page }) => {
    // Login
    // Go to settings
    // Update name
    // Verify changes saved
  })

  test('should change email with verification', async ({ page }) => {
    // Login
    // Request email change
    // Verify old email confirmation sent
    // Confirm from old email
    // Verify new email verification sent
    // Verify from new email
    // Verify email changed
  })

  test('should change password', async ({ page }) => {
    // Login
    // Go to security settings
    // Enter old and new password
    // Verify success
    // Logout and login with new password
  })
})
```

##### `e2e/users/account-deletion.spec.ts`
```typescript
test.describe('Account Deletion', () => {
  test('should delete own account', async ({ page }) => {
    // Login
    // Go to settings
    // Click delete account
    // Enter email confirmation
    // Verify account deleted
    // Verify cannot login
  })

  test('should require email confirmation for deletion', async ({ page }) => {
    // Try to delete without correct email
    // Verify button disabled/error shown
  })
})
```

##### `e2e/admin/user-management.spec.ts`
```typescript
test.describe('Admin User Management', () => {
  test('should create user as admin', async ({ page }) => {
    // Login as admin
    // Navigate to users
    // Click create user
    // Fill form with role
    // Verify user created
  })

  test('should update user role', async ({ page }) => {
    // Login as admin
    // Find user
    // Change role
    // Verify role updated
  })

  test('should delete user as admin', async ({ page }) => {
    // Login as admin
    // Find user
    // Delete user
    // Verify user removed
  })

  test('should prevent non-admin from accessing user management', async ({ page }) => {
    // Login as regular user
    // Try to access /admin/users
    // Verify 403 or redirect
  })
})
```

##### `e2e/permissions/access-control.spec.ts`
```typescript
test.describe('Access Control', () => {
  test('should allow public access to public routes', async ({ page }) => {
    // Visit home, about, etc. without login
  })

  test('should require authentication for user routes', async ({ page }) => {
    // Try to access /track-app without login
    // Verify redirect to login
  })

  test('should require admin role for admin routes', async ({ page }) => {
    // Login as user
    // Try to access /admin
    // Verify 403 or redirect
  })

  test('should enforce permissions on API endpoints', async ({ request }) => {
    // Test /api/users without auth → 401
    // Test /api/users with user auth → 403
    // Test /api/users with admin auth → 200
  })
})
```

**Acceptance Criteria:**
- All P1 requirements from todo item #11 are tested
- Tests can run in CI environment
- Tests use isolated test database
- Email verification can be tested without manual intervention
- All tests pass on clean database

### Phase 4: Test Infrastructure (Priority: P1)

#### Task 4.1: Create Test Database Management
**Estimated Time:** 4 hours

**Files to Create:**
- `scripts/test/setup-test-db.ts` - Create and seed test database
- `scripts/test/teardown-test-db.ts` - Clean up after tests
- `.env.test` - Test-specific environment variables

**Features:**
- Separate test database (e.g., `learning_tracker_test`)
- Automatic migrations before E2E tests
- Seed with minimal test data
- Reset between test suites

#### Task 4.2: Create Test Email Transport
**Estimated Time:** 3 hours

**Options:**
1. Use in-memory email transport for E2E
2. Use MailHog or similar email testing service
3. Create test endpoint to fetch sent emails

**Implementation:**
- Add `EMAIL_PROVIDER=test` mode
- Store emails in memory or test database
- Create API endpoint `/api/test/emails` (admin/test only)
- Clear emails between test runs

#### Task 4.3: Create Test Utilities and Fixtures
**Estimated Time:** 4 hours

**Files to Create:**
- `e2e/fixtures/users.ts` - Create test users
- `e2e/fixtures/auth.ts` - Login helpers
- `e2e/utils/email.ts` - Email verification helpers
- `e2e/utils/database.ts` - Database reset utilities

**Example:**
```typescript
// e2e/fixtures/auth.ts
export async function loginAsUser(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.fill('[name="email"]', email)
  await page.fill('[name="password"]', password)
  await page.click('[type="submit"]')
  await page.waitForURL(/track-app/)
}

export async function loginAsAdmin(page: Page) {
  await loginAsUser(page, 'admin@example.com', 'test-password')
}
```

---

## 6. Testing Best Practices Guide

### 6.1 Unit Testing Principles

**Do:**
- ✅ Mock the next architectural boundary (queries mock db, services mock queries)
- ✅ Test both success and error paths
- ✅ Test validation errors and edge cases
- ✅ Use descriptive test names: `it('rejects deletion of a missing user')`
- ✅ Keep tests isolated and independent
- ✅ Test one thing per test

**Don't:**
- ❌ Don't mock everything (over-mocking makes tests brittle)
- ❌ Don't test implementation details
- ❌ Don't share state between tests
- ❌ Don't use real database in unit tests
- ❌ Don't test framework code

### 6.2 Integration Testing Principles

**Do:**
- ✅ Use a real test database
- ✅ Test the full request/response cycle
- ✅ Verify database changes
- ✅ Test authentication and authorization
- ✅ Reset database between tests

**Don't:**
- ❌ Don't use production database
- ❌ Don't skip cleanup
- ❌ Don't test external APIs (mock them)

### 6.3 E2E Testing Principles

**Do:**
- ✅ Test from user perspective
- ✅ Test critical user journeys
- ✅ Use page objects for complex pages
- ✅ Test accessibility (keyboard navigation, screen readers)
- ✅ Test on multiple browsers (if required)
- ✅ Verify visual elements and user feedback

**Don't:**
- ❌ Don't test every edge case (that's for unit tests)
- ❌ Don't make tests depend on each other
- ❌ Don't use hard-coded waits (use waitFor)
- ❌ Don't test implementation details

### 6.4 Test Organization

```
app/features/users/
├── actions/
│   ├── register-user-action.ts
│   └── register-user-action.test.ts      # Co-located unit tests
├── services/
│   ├── user.service.ts
│   └── user.service.test.ts              # Co-located unit tests
└── __tests__/                            # Integration tests
    └── integration/
        └── registration-flow.test.ts

e2e/                                       # E2E tests (separate directory)
├── auth/
│   ├── registration.spec.ts
│   └── login-logout.spec.ts
├── fixtures/
│   ├── users.ts
│   └── auth.ts
└── utils/
    └── database.ts
```

---

## 7. Acceptance Criteria for Todo Item #11

### Before marking Point #11 as DONE, verify:

- [x] **Playwright Configuration**
  - [ ] `@playwright/test` installed
  - [ ] `playwright.config.ts` created
  - [ ] `test:e2e` script in package.json
  - [ ] Can run `pnpm test:e2e` successfully

- [x] **Test Coverage - Authentication**
  - [ ] E2E test for user registration
  - [ ] E2E test for email verification
  - [ ] E2E test for login
  - [ ] E2E test for logout
  - [ ] E2E test for forgot password
  - [ ] E2E test for reset password

- [x] **Test Coverage - Access Control**
  - [ ] E2E test for public route access
  - [ ] E2E test for user route protection
  - [ ] E2E test for admin route protection
  - [ ] E2E test for permission-based access

- [x] **Test Coverage - User Management**
  - [ ] E2E test for profile update
  - [ ] E2E test for password change
  - [ ] E2E test for email change (with verification)
  - [ ] E2E test for account deletion

- [x] **Test Infrastructure**
  - [ ] Isolated test database configured
  - [ ] Test database resets between suites
  - [ ] Test email transport configured
  - [ ] Can verify emails in tests
  - [ ] Test fixtures and utilities created

- [x] **Quality Gates**
  - [ ] All E2E tests pass
  - [ ] E2E tests run in < 5 minutes
  - [ ] No flaky tests (run 3 times, all pass)
  - [ ] Tests documented in README

---

## 8. Estimated Timeline

| Phase | Tasks | Estimated Time | Priority |
|-------|-------|----------------|----------|
| **Phase 1: Fix Existing** | Fix env config + Complete unit tests | 10 hours | P0 |
| **Phase 2: Integration** | Full-stack integration tests | 6 hours | P1 |
| **Phase 3: E2E Setup** | Playwright setup + infrastructure | 4 hours | P1 |
| **Phase 3: E2E Tests** | Implement all E2E test scenarios | 16 hours | P1 |
| **Phase 4: Infrastructure** | Test DB + Email + Utilities | 11 hours | P1 |
| **Total** | | **47 hours** (~6 days) | |

---

## 9. Key Risks and Mitigation

### Risk 1: Test Environment Configuration
**Risk:** Tests fail due to environment dependencies (Redis, database, email)
**Mitigation:**
- Create dedicated `.env.test` file
- Mock external services in unit tests
- Document required test setup in README

### Risk 2: Flaky E2E Tests
**Risk:** E2E tests fail intermittently due to timing issues
**Mitigation:**
- Use Playwright's auto-waiting features
- Avoid hard-coded sleeps
- Use proper test isolation
- Run tests multiple times in CI

### Risk 3: Test Database Management
**Risk:** Tests interfere with each other or production data
**Mitigation:**
- Use completely separate test database
- Reset database between test suites
- Never run tests against production
- Add safeguards in test scripts

### Risk 4: Email Testing Complexity
**Risk:** Email verification is hard to test in E2E
**Mitigation:**
- Use test email provider or in-memory transport
- Create helper to extract verification links
- Consider adding test-only email bypass (with proper guards)

---

## 10. Next Steps

### Immediate Actions (Week 1)
1. Fix environment configuration for failing tests
2. Set up Playwright and verify basic test runs
3. Create test database management scripts
4. Implement test email transport

### Short Term (Week 2-3)
1. Complete missing unit tests for critical paths
2. Implement core E2E tests (auth, registration, login)
3. Add integration tests for main flows

### Medium Term (Week 4-6)
1. Complete all E2E test scenarios
2. Add test fixtures and utilities
3. Document testing approach
4. Add tests to CI pipeline

### Long Term (Ongoing)
1. Maintain test coverage as new features are added
2. Monitor and fix flaky tests
3. Add performance tests if needed
4. Consider visual regression testing

---

## 11. Resources and Documentation

### Internal Documentation
- `AGENTS.md` - Architecture and testing guidelines
- `todo-list-en/01-starter-readiness.md` - Point #11 requirements
- `app/features/users/CODE_PATTERNS.md` - User feature patterns

### External Resources
- [Playwright Documentation](https://playwright.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [React Router Testing](https://reactrouter.com/en/main/guides/testing)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles/)

### Testing Commands
```bash
# Run all unit tests
pnpm test

# Run unit tests for users feature
pnpm exec vitest run app/features/users

# Run tests in watch mode
pnpm test:watch

# Run E2E tests (after setup)
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Run specific E2E test file
pnpm exec playwright test e2e/auth/registration.spec.ts

# Generate test coverage report
pnpm exec vitest run --coverage

# Type check tests
pnpm typecheck
```

---

## Conclusion

The users feature has **good foundation** with unit and service tests covering critical business logic and security boundaries. However, it is **NOT READY** for point #11 (End-to-End Testing) as it lacks:

1. E2E test framework (Playwright)
2. E2E test scenarios
3. Test infrastructure (isolated DB, email transport)

Following this plan will establish comprehensive test coverage across all layers (unit → integration → E2E) and fulfill the requirements for a production-ready starter application.

**Recommendation:** Prioritize Phase 1 (fix existing tests) and Phase 3 (E2E setup) first, as these are blocking requirements for point #11. Integration tests (Phase 2) can be added in parallel or after E2E basics are working.

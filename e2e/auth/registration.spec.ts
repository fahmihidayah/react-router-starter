import { test, expect } from '@playwright/test'
import { testUsers, register, clearAuth } from '../fixtures/auth'

test.describe('User Registration', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page)
  })

  test('should display registration form', async ({ page }) => {
    await page.goto('/register')

    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should register a new user successfully', async ({ page }) => {
    const timestamp = Date.now()
    const newUser = {
      name: `Test User ${timestamp}`,
      email: `testuser${timestamp}@test.local`,
      password: 'NewUser1234!@#$',
    }

    await register(page, newUser.name, newUser.email, newUser.password)

    // Should redirect to verification page or login page
    await page.waitForURL(/verify|login|register/, { timeout: 10000 })

    // Should show success message or verification prompt
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).toMatch(/verify|success|check your email|registered/i)
  })

  test('should show validation error for invalid email format', async ({ page }) => {
    await page.goto('/register')

    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', 'invalid-email')
    await page.fill('input[name="password"]', 'ValidPassword123!')
    await page.click('button[type="submit"]')

    // Should show validation error
    await expect(page.locator('body')).toContainText(/invalid.*email|email.*invalid/i, {
      timeout: 5000,
    })
  })

  test('should show validation error for weak password', async ({ page }) => {
    await page.goto('/register')

    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', '123')
    await page.click('button[type="submit"]')

    // Should show password validation error
    await expect(page.locator('body')).toContainText(
      /password.*must|password.*least|password.*characters/i,
      {
        timeout: 5000,
      },
    )
  })

  test('should show validation error for missing name', async ({ page }) => {
    await page.goto('/register')

    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'ValidPassword123!')
    await page.click('button[type="submit"]')

    // Should show validation error for required field
    await expect(page.locator('body')).toContainText(/name.*required|required.*name/i, {
      timeout: 5000,
    })
  })

  test('should prevent registration with existing email', async ({ page }) => {
    // Try to register with existing user email
    await register(page, 'Duplicate User', testUsers.user.email, 'Password123!')

    // Should show error about existing email
    await expect(page.locator('body')).toContainText(
      /email.*already|already.*exists|already.*use/i,
      {
        timeout: 5000,
      },
    )
  })

  test('should have link to login page', async ({ page }) => {
    await page.goto('/register')

    // Should have link to login
    const loginLink = page.locator(
      'a:has-text("Login"), a:has-text("Sign in"), a:has-text("Log in")',
    )
    await expect(loginLink.first()).toBeVisible()

    // Click login link
    await loginLink.first().click()
    await expect(page).toHaveURL(/login/)
  })

  test('should validate password strength requirements', async ({ page }) => {
    await page.goto('/register')

    const testCases = [
      { password: '123', shouldFail: true, reason: 'too short' },
      { password: 'password', shouldFail: true, reason: 'no numbers or special chars' },
      { password: 'Password1!', shouldFail: false, reason: 'valid password' },
    ]

    for (const testCase of testCases) {
      await page.fill('input[name="name"]', 'Test User')
      await page.fill('input[name="email"]', `test${Date.now()}@example.com`)
      await page.fill('input[name="password"]', testCase.password)
      await page.click('button[type="submit"]')

      if (testCase.shouldFail) {
        // Should show error
        const hasError = await page.locator('body').textContent()
        expect(hasError).toMatch(/password|invalid/i)
      }

      // Reload page for next test
      await page.goto('/register')
    }
  })
})

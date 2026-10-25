import { test, expect } from '@playwright/test'
import { testUsers, login, loginAsUser, logout, clearAuth } from '../fixtures/auth'

test.describe('Login and Logout', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page)
  })

  test('should display login form', async ({ page }) => {
    await page.goto('/login')

    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should login with valid credentials and redirect to dashboard', async ({ page }) => {
    await login(page, testUsers.user.email, testUsers.user.password)

    // Should redirect to account (user dashboard)
    await expect(page).toHaveURL(/account/)

    // Should see user-specific content
    await expect(page.locator('body')).toContainText(testUsers.user.name, { timeout: 5000 })
  })

  test('should show error message for invalid email', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[name="email"]', 'invalid-email')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Should show validation error or stay on login page
    const url = page.url()
    expect(url).toContain('login')
  })

  test('should show error message for wrong password', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[name="email"]', testUsers.user.email)
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // Should show error message
    await expect(page.locator('body')).toContainText(/invalid|incorrect|wrong/i, { timeout: 5000 })
  })

  test('should show error message for non-existent user', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[name="email"]', 'nonexistent@test.local')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Should show error message
    await expect(page.locator('body')).toContainText(/invalid|not found|doesn't exist/i, {
      timeout: 5000,
    })
  })

  test('should logout successfully', async ({ page }) => {
    // First login
    await loginAsUser(page)
    await expect(page).toHaveURL(/account/)

    // Then logout
    await logout(page)

    // Should redirect to home or login page
    const url = page.url()
    expect(url).toMatch(/\/(|login)$/)

    // Trying to access protected route should redirect to login
    await page.goto('/account')
    await expect(page).toHaveURL(/login/, { timeout: 5000 })
  })

  test('should clear session after logout', async ({ page }) => {
    await loginAsUser(page)

    // Get session cookies before logout
    const cookiesBefore = await page.context().cookies()
    expect(cookiesBefore.length).toBeGreaterThan(0)

    await logout(page)

    // Session cookies should be cleared or expired
    const cookiesAfter = await page.context().cookies()
    const sessionCookie = cookiesAfter.find(
      (c) => c.name.includes('session') || c.name.includes('auth'),
    )

    // Session cookie should not exist or be expired
    expect(sessionCookie).toBeFalsy()
  })

  test('should redirect to intended page after login', async ({ page }) => {
    // Try to access protected page while logged out
    await page.goto('/account/settings')

    // Should redirect to login with return URL
    await expect(page).toHaveURL(/login/)

    // Login
    await page.fill('input[name="email"]', testUsers.user.email)
    await page.fill('input[name="password"]', testUsers.user.password)
    await page.click('button[type="submit"]')

    // Should redirect back to intended page (or dashboard)
    await page.waitForURL(/account/, { timeout: 5000 })
  })
})

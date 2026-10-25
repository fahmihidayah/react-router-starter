import type { Page } from '@playwright/test'

/**
 * Test user credentials for E2E tests
 */
export const testUsers = {
  admin: {
    email: 'admin@test.local',
    password: 'Test1234!@#$',
    name: 'Test Admin',
  },
  user: {
    email: 'user@test.local',
    password: 'Test1234!@#$',
    name: 'Test User',
  },
  newUser: {
    email: 'newuser@test.local',
    password: 'NewUser1234!@#$',
    name: 'New Test User',
  },
}

/**
 * Login as a user with email and password
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login')
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')

  // Wait for navigation after login
  await page.waitForURL(/track-app|admin/, { timeout: 10000 })
}

/**
 * Login as admin user
 */
export async function loginAsAdmin(page: Page) {
  await login(page, testUsers.admin.email, testUsers.admin.password)
}

/**
 * Login as regular user
 */
export async function loginAsUser(page: Page) {
  await login(page, testUsers.user.email, testUsers.user.password)
}

/**
 * Logout from the application
 */
export async function logout(page: Page) {
  // Look for logout button/link
  await page.click(
    'button:has-text("Logout"), a:has-text("Logout"), button:has-text("Sign out"), a:has-text("Sign out")',
  )

  // Wait for redirect to home or login page
  await page.waitForURL(/\/($|login)/, { timeout: 5000 })
}

/**
 * Register a new user
 */
export async function register(page: Page, name: string, email: string, password: string) {
  await page.goto('/register')
  await page.fill('input[name="name"]', name)
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await page.click('button[type="submit"]')
}

/**
 * Check if user is logged in by checking for common logged-in elements
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    // Check for dashboard or track-app in URL
    const url = page.url()
    return url.includes('track-app') || url.includes('admin')
  } catch {
    return false
  }
}

/**
 * Clear all cookies and local storage
 */
export async function clearAuth(page: Page) {
  await page.context().clearCookies()
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
}

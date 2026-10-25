import { test, expect } from '@playwright/test'
import { loginAsAdmin, loginAsUser, clearAuth } from '../fixtures/auth'

test.describe('Access Control', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page)
  })

  test('should allow public access to public routes', async ({ page }) => {
    const publicRoutes = ['/', '/login', '/register']

    for (const route of publicRoutes) {
      await page.goto(route)

      // Should load without redirect to login
      expect(page.url()).toContain(route)

      // Should not show "Unauthorized" or "Forbidden"
      const bodyText = await page.locator('body').textContent()
      expect(bodyText).not.toMatch(/unauthorized|forbidden|403|401/i)
    }
  })

  test('should require authentication for user routes', async ({ page }) => {
    const userRoutes = ['/track-app', '/track-app/settings']

    for (const route of userRoutes) {
      await page.goto(route)

      // Should redirect to login
      await expect(page).toHaveURL(/login/, { timeout: 5000 })
    }
  })

  test('should require admin role for admin routes', async ({ page }) => {
    // Try to access admin route as regular user
    await loginAsUser(page)
    await page.goto('/admin')

    // Should show 403 Forbidden or redirect
    const url = page.url()
    const bodyText = await page.locator('body').textContent()

    expect(url.includes('admin') ? bodyText : url).toMatch(
      /forbidden|403|not authorized|track-app/i,
    )
  })

  test('should allow admin access to admin routes', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin')

    // Should stay on admin page
    await expect(page).toHaveURL(/admin/, { timeout: 5000 })

    // Should see admin content
    await expect(page.locator('body')).not.toContainText(/forbidden|403/i)
  })

  test('should enforce API authentication', async ({ page, request }) => {
    // Test unauthenticated API request
    const response = await request.get('/api/users')

    // Should return 401 Unauthorized
    expect(response.status()).toBe(401)

    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toMatch(/unauthorized/i)
  })

  test('should enforce API admin requirements', async ({ page, request }) => {
    // Login as regular user
    await loginAsUser(page)

    // Get cookies for authenticated request
    const cookies = await page.context().cookies()
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ')

    // Try to access admin API as regular user
    const response = await request.get('/api/users', {
      headers: {
        Cookie: cookieHeader,
      },
    })

    // Should return 403 Forbidden
    expect([401, 403]).toContain(response.status())
  })

  test('should allow admin API access with admin role', async ({ page, request }) => {
    // Login as admin
    await loginAsAdmin(page)

    // Get cookies for authenticated request
    const cookies = await page.context().cookies()
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ')

    // Access admin API
    const response = await request.get('/api/users', {
      headers: {
        Cookie: cookieHeader,
      },
    })

    // Should return 200 OK
    expect(response.status()).toBe(200)
  })

  test('should not leak sensitive data in unauthorized responses', async ({ request }) => {
    const response = await request.get('/api/users')

    const data = await response.json()

    // Should not contain user data
    expect(data.users).toBeUndefined()
    expect(data.docs).toBeUndefined()

    // Should only contain error message
    expect(data.success).toBe(false)
    expect(data.error).toBeTruthy()
  })

  test('should redirect to login when session expires', async ({ page }) => {
    await loginAsUser(page)
    await expect(page).toHaveURL(/track-app/)

    // Clear session cookies to simulate expiration
    await page.context().clearCookies()

    // Try to access protected route
    await page.goto('/track-app/settings')

    // Should redirect to login
    await expect(page).toHaveURL(/login/, { timeout: 5000 })
  })
})

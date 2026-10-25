import { test, expect } from '@playwright/test'
import { loginAsUser, clearAuth, testUsers } from '../fixtures/auth'

test.describe('Profile Management', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page)
    await loginAsUser(page)
  })

  test('should display user settings page', async ({ page }) => {
    await page.goto('/track-app/settings')

    await expect(page.locator('body')).toContainText(/settings|profile/i)
  })

  test('should update profile name', async ({ page }) => {
    await page.goto('/track-app/settings')

    const newName = `Updated Name ${Date.now()}`

    // Find and fill name input
    const nameInput = page.locator('input[name="name"]').first()
    await nameInput.clear()
    await nameInput.fill(newName)

    // Submit form
    await page.locator('button[type="submit"]').first().click()

    // Should show success message
    await expect(page.locator('body')).toContainText(/success|updated|saved/i, {
      timeout: 5000,
    })

    // Reload page and verify change persisted
    await page.reload()
    await expect(nameInput).toHaveValue(newName)
  })

  test('should validate empty name', async ({ page }) => {
    await page.goto('/track-app/settings')

    // Try to submit empty name
    const nameInput = page.locator('input[name="name"]').first()
    await nameInput.clear()

    await page.locator('button[type="submit"]').first().click()

    // Should show validation error
    await expect(page.locator('body')).toContainText(/required|name.*required/i, {
      timeout: 5000,
    })
  })

  test('should display current email', async ({ page }) => {
    await page.goto('/track-app/settings')

    // Should show current user email
    await expect(page.locator('body')).toContainText(testUsers.user.email)
  })

  test.skip('should initiate email change process', async ({ page }) => {
    await page.goto('/track-app/settings')

    // Look for email change button/section
    const emailSection = page.locator('text=Email').or(page.locator('text=Change email'))

    if ((await emailSection.count()) > 0) {
      await emailSection.first().click()

      // Should show email change form or modal
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
    }
  })

  test.skip('should change password successfully', async ({ page }) => {
    await page.goto('/track-app/settings')

    // Look for password/security section
    const passwordSection = page.locator('text=Password, text=Security, text=Change password')

    if ((await passwordSection.count()) > 0) {
      await passwordSection.first().click()

      // Fill password change form
      const currentPassword = testUsers.user.password
      const newPassword = 'NewPassword123!@#$'

      await page.fill('input[name="currentPassword"], input[name="oldPassword"]', currentPassword)
      await page.fill('input[name="newPassword"], input[name="password"]', newPassword)
      await page.fill(
        'input[name="confirmPassword"], input[name="passwordConfirmation"]',
        newPassword,
      )

      await page.locator('button[type="submit"]').click()

      // Should show success message
      await expect(page.locator('body')).toContainText(
        /success|password.*changed|password.*updated/i,
        {
          timeout: 5000,
        },
      )
    }
  })

  test('should have account deletion option', async ({ page }) => {
    await page.goto('/track-app/settings')

    // Should have delete account option (usually at bottom or in danger zone)
    const deleteButton = page.locator(
      'button:has-text("Delete"), button:has-text("Delete account"), button:has-text("Close account")',
    )

    await expect(deleteButton.first()).toBeVisible({ timeout: 5000 })
  })

  test.skip('should require confirmation for account deletion', async ({ page }) => {
    await page.goto('/track-app/settings')

    // Click delete account button
    const deleteButton = page.locator('button:has-text("Delete account")').first()
    await deleteButton.click()

    // Should show confirmation dialog
    await expect(page.locator('dialog, [role="dialog"], [role="alertdialog"]')).toBeVisible()

    // Should require email confirmation
    const confirmInput = page.locator(
      'input[type="email"], input[name="email"], input[name="confirmation"]',
    )
    await expect(confirmInput.first()).toBeVisible()

    // Cancel deletion
    await page.locator('button:has-text("Cancel")').click()

    // Dialog should close
    await expect(page.locator('dialog, [role="dialog"]')).not.toBeVisible()
  })
})

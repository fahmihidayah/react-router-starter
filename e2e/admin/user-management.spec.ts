import { test, expect } from '@playwright/test'
import { loginAsAdmin, clearAuth } from '../fixtures/auth'

test.describe('Admin User Management', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page)
    await loginAsAdmin(page)
  })

  test('should display users list page', async ({ page }) => {
    await page.goto('/admin/users')

    // Should show users table/list
    await expect(page.locator('body')).toContainText(/users|user list/i, {
      timeout: 5000,
    })
  })

  test('should have create user button', async ({ page }) => {
    await page.goto('/admin/users')

    // Should have create/add user button
    const createButton = page.locator(
      'button:has-text("Create"), button:has-text("Add"), button:has-text("New"), a:has-text("Create user")',
    )

    await expect(createButton.first()).toBeVisible({ timeout: 5000 })
  })

  test.skip('should create a new user', async ({ page }) => {
    await page.goto('/admin/users')

    // Click create user button
    const createButton = page.locator('button:has-text("Create"), a:has-text("Create")').first()
    await createButton.click()

    // Fill user form
    const timestamp = Date.now()
    await page.fill('input[name="name"]', `Admin Created User ${timestamp}`)
    await page.fill('input[name="email"]', `adminuser${timestamp}@test.local`)
    await page.fill('input[name="password"]', 'AdminUser123!')

    // Select role if available
    const roleSelect = page.locator('select[name="role"], select[name="roleId"]')
    if ((await roleSelect.count()) > 0) {
      await roleSelect.first().selectOption({ index: 1 })
    }

    // Submit form
    await page.locator('button[type="submit"]').click()

    // Should show success message
    await expect(page.locator('body')).toContainText(/success|created|added/i, {
      timeout: 5000,
    })

    // Should see new user in list
    await expect(page.locator('body')).toContainText(`adminuser${timestamp}@test.local`)
  })

  test.skip('should edit user details', async ({ page }) => {
    await page.goto('/admin/users')

    // Click edit button on first user (not admin)
    const editButton = page.locator('button:has-text("Edit"), a:has-text("Edit")').nth(1)
    await editButton.click()

    // Update name
    const nameInput = page.locator('input[name="name"]').first()
    await nameInput.fill(`Updated Name ${Date.now()}`)

    // Submit
    await page.locator('button[type="submit"]').click()

    // Should show success
    await expect(page.locator('body')).toContainText(/success|updated/i, {
      timeout: 5000,
    })
  })

  test.skip('should change user role', async ({ page }) => {
    await page.goto('/admin/users')

    // Find a user and click role/edit button
    const editButton = page.locator('button:has-text("Edit"), a:has-text("Edit")').nth(1)
    await editButton.click()

    // Change role
    const roleSelect = page.locator('select[name="role"], select[name="roleId"]')
    if ((await roleSelect.count()) > 0) {
      await roleSelect.first().selectOption({ index: 1 })

      // Submit
      await page.locator('button[type="submit"]').click()

      // Should show success
      await expect(page.locator('body')).toContainText(/success|updated/i, {
        timeout: 5000,
      })
    }
  })

  test.skip('should delete a user', async ({ page }) => {
    // First create a user to delete
    await page.goto('/admin/users')

    const createButton = page.locator('button:has-text("Create"), a:has-text("Create")').first()
    await createButton.click()

    const timestamp = Date.now()
    const testEmail = `deleteme${timestamp}@test.local`

    await page.fill('input[name="name"]', 'Delete Me')
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', 'DeleteMe123!')
    await page.locator('button[type="submit"]').click()

    // Wait for success
    await expect(page.locator('body')).toContainText(/success/i, { timeout: 5000 })

    // Now delete the user
    const userRow = page.locator(`tr:has-text("${testEmail}")`)
    const deleteButton = userRow.locator('button:has-text("Delete")')
    await deleteButton.click()

    // Confirm deletion if prompted
    const confirmButton = page.locator(
      'button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")',
    )
    if ((await confirmButton.count()) > 0) {
      await confirmButton.last().click()
    }

    // Should show success
    await expect(page.locator('body')).toContainText(/success|deleted/i, {
      timeout: 5000,
    })

    // User should not be in list
    await expect(page.locator('body')).not.toContainText(testEmail)
  })

  test('should display user count or pagination', async ({ page }) => {
    await page.goto('/admin/users')

    // Should show total count or pagination
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).toMatch(/\d+\s+(users?|total|results?)|page\s+\d+/i)
  })

  test('should have search or filter functionality', async ({ page }) => {
    await page.goto('/admin/users')

    // Should have search input or filter
    const hasSearch =
      (await page
        .locator('input[type="search"], input[placeholder*="Search"], input[name="search"]')
        .count()) > 0
    const hasFilter = (await page.locator('select, button:has-text("Filter")').count()) > 0

    expect(hasSearch || hasFilter).toBeTruthy()
  })
})

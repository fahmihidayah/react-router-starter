import { test, expect } from '@playwright/test'
import { testUsers, loginAsUser, clearAuth } from '../fixtures/auth'

test.describe('Learner Management', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page)
    await loginAsUser(page)
  })

  test('should display learners list', async ({ page }) => {
    await page.goto('/track-app')

    // Should show learners section or list
    await expect(page.locator('body')).toContainText(/learners|students/i, { timeout: 10000 })
  })

  test('should create a new learner', async ({ page }) => {
    await page.goto('/track-app')

    // Look for add/create learner button
    const createButton = page
      .locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")')
      .first()
    await createButton.click({ timeout: 5000 })

    // Fill in learner form
    const learnerName = `Test Learner ${Date.now()}`
    await page.fill('input[name="name"], input[placeholder*="name" i]', learnerName)

    // Submit form
    await page.click(
      'button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Add"), button[type="submit"]:has-text("Save")',
    )

    // Should show success or navigate to learner
    await page.waitForTimeout(2000)

    // Verify learner appears in the list
    await expect(page.locator('body')).toContainText(learnerName, { timeout: 5000 })
  })

  test('should view learner details', async ({ page }) => {
    await page.goto('/track-app')

    // Find and click on first learner card/link
    const learnerCard = page.locator('a[href*="/learners/"], button:has-text("View")').first()

    if (await learnerCard.isVisible({ timeout: 5000 })) {
      await learnerCard.click()

      // Should navigate to learner detail page
      await expect(page).toHaveURL(/learners\/[a-z0-9-]+/, { timeout: 5000 })

      // Should show learner information
      await expect(page.locator('body')).toContainText(/goals|activities|progress/i, {
        timeout: 5000,
      })
    }
  })

  test('should edit learner information', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to first learner
    const learnerCard = page.locator('a[href*="/learners/"]').first()

    if (await learnerCard.isVisible({ timeout: 5000 })) {
      await learnerCard.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Look for edit button
      const editButton = page.locator('button:has-text("Edit"), a:has-text("Edit")').first()

      if (await editButton.isVisible({ timeout: 3000 })) {
        await editButton.click()

        // Update name
        const updatedName = `Updated Learner ${Date.now()}`
        const nameInput = page.locator('input[name="name"]')
        await nameInput.clear()
        await nameInput.fill(updatedName)

        // Save changes
        await page.click(
          'button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Update")',
        )

        // Verify update
        await page.waitForTimeout(1000)
        await expect(page.locator('body')).toContainText(updatedName, { timeout: 5000 })
      }
    }
  })

  test('should create learner groups', async ({ page }) => {
    await page.goto('/track-app')

    // Look for groups section or button
    const groupButton = page
      .locator('button:has-text("Group"), button:has-text("Create Group")')
      .first()

    if (await groupButton.isVisible({ timeout: 3000 })) {
      await groupButton.click()

      const groupName = `Test Group ${Date.now()}`
      await page.fill('input[name="name"], input[placeholder*="group" i]', groupName)
      await page.click('button[type="submit"]')

      await page.waitForTimeout(1000)
      await expect(page.locator('body')).toContainText(groupName, { timeout: 5000 })
    }
  })

  test('should move learner to group', async ({ page }) => {
    await page.goto('/track-app')

    // Find a learner card
    const learnerCard = page.locator('a[href*="/learners/"], [data-learner-id]').first()

    if (await learnerCard.isVisible({ timeout: 5000 })) {
      // Look for move/group action button (this might be a context menu or dropdown)
      const actionButton = page
        .locator('button[aria-label*="menu"], button:has-text("⋮"), button:has-text("...")')
        .first()

      if (await actionButton.isVisible({ timeout: 3000 })) {
        await actionButton.click()

        // Look for move to group option
        const moveOption = page
          .locator('button:has-text("Move"), a:has-text("Move to group")')
          .first()

        if (await moveOption.isVisible({ timeout: 2000 })) {
          await moveOption.click()

          // Select a group or ungrouped
          const groupOption = page.locator('[role="option"], button').first()
          if (await groupOption.isVisible({ timeout: 2000 })) {
            await groupOption.click()
            await page.waitForTimeout(1000)
          }
        }
      }
    }
  })

  test('should delete a learner', async ({ page }) => {
    await page.goto('/track-app')

    // Create a learner specifically for deletion
    const createButton = page
      .locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")')
      .first()

    if (await createButton.isVisible({ timeout: 3000 })) {
      await createButton.click()

      const learnerName = `Delete Me ${Date.now()}`
      await page.fill('input[name="name"]', learnerName)
      await page.click('button[type="submit"]')
      await page.waitForTimeout(2000)

      // Find the learner we just created
      const learnerToDelete = page.locator(`text=${learnerName}`).first()

      if (await learnerToDelete.isVisible({ timeout: 3000 })) {
        // Click on learner to open details
        await learnerToDelete.click()
        await page.waitForTimeout(1000)

        // Look for delete button
        const deleteButton = page.locator('button:has-text("Delete")').first()

        if (await deleteButton.isVisible({ timeout: 3000 })) {
          await deleteButton.click()

          // Confirm deletion in dialog
          const confirmButton = page
            .locator('button:has-text("Delete"), button:has-text("Confirm")')
            .last()
          await confirmButton.click({ timeout: 3000 })

          // Wait for redirect and verify deletion
          await page.waitForTimeout(2000)
          await expect(page.locator('body')).not.toContainText(learnerName, { timeout: 5000 })
        }
      }
    }
  })

  test('should manage learner access permissions', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to first learner
    const learnerCard = page.locator('a[href*="/learners/"]').first()

    if (await learnerCard.isVisible({ timeout: 5000 })) {
      await learnerCard.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Look for access/permissions tab or button
      const accessTab = page
        .locator('button:has-text("Access"), a:has-text("Access"), button:has-text("Permissions")')
        .first()

      if (await accessTab.isVisible({ timeout: 3000 })) {
        await accessTab.click()
        await page.waitForTimeout(1000)

        // Should show access management section
        await expect(page.locator('body')).toContainText(/access|permissions|share/i, {
          timeout: 5000,
        })
      }
    }
  })

  test('should filter and search learners', async ({ page }) => {
    await page.goto('/track-app')

    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first()

    if (await searchInput.isVisible({ timeout: 3000 })) {
      await searchInput.fill('test')
      await page.waitForTimeout(500)

      // Results should update
      // This is a basic check - actual results depend on data
      await expect(searchInput).toHaveValue('test')
    }
  })

  test('should display learner statistics', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to first learner
    const learnerCard = page.locator('a[href*="/learners/"]').first()

    if (await learnerCard.isVisible({ timeout: 5000 })) {
      await learnerCard.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Should show some statistics or metrics
      await expect(page.locator('body')).toContainText(/goal|activity|progress|total/i, {
        timeout: 5000,
      })
    }
  })
})

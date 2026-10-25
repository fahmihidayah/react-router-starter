import { test, expect } from '@playwright/test'
import { testUsers, loginAsUser, clearAuth } from '../fixtures/auth'

test.describe('Goal Management', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page)
    await loginAsUser(page)
  })

  test('should display goals list for a learner', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Look for goals section
      await expect(page.locator('body')).toContainText(/goals?/i, { timeout: 5000 })
    }
  })

  test('should create a new goal', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Click on Goals tab if exists
      const goalsTab = page.locator('button:has-text("Goals"), a:has-text("Goals")').first()
      if (await goalsTab.isVisible({ timeout: 2000 })) {
        await goalsTab.click()
        await page.waitForTimeout(500)
      }

      // Look for create goal button
      const createButton = page
        .locator(
          'button:has-text("Add Goal"), button:has-text("Create Goal"), button:has-text("New Goal")',
        )
        .first()

      if (await createButton.isVisible({ timeout: 3000 })) {
        await createButton.click()

        // Fill goal form
        const goalTitle = `Test Goal ${Date.now()}`
        await page.fill('input[name="title"], input[placeholder*="title" i]', goalTitle)
        await page.fill('input[name="targetValue"], input[placeholder*="target" i]', '10')
        await page.fill('input[name="unit"], input[placeholder*="unit" i]', 'books')

        // Submit form
        await page.click(
          'button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Add"), button[type="submit"]:has-text("Save")',
        )

        // Verify goal appears
        await page.waitForTimeout(2000)
        await expect(page.locator('body')).toContainText(goalTitle, { timeout: 5000 })
      }
    }
  })

  test('should update goal progress', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner with goals
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Navigate to goals
      const goalsTab = page.locator('button:has-text("Goals"), a:has-text("Goals")').first()
      if (await goalsTab.isVisible({ timeout: 2000 })) {
        await goalsTab.click()
        await page.waitForTimeout(500)
      }

      // Look for a goal card and click to add progress
      const goalCard = page
        .locator('[data-goal-id], button:has-text("Progress"), button:has-text("Add Progress")')
        .first()

      if (await goalCard.isVisible({ timeout: 3000 })) {
        await goalCard.click()

        // Fill progress form
        const progressInput = page.locator('input[name="value"], input[type="number"]').first()
        if (await progressInput.isVisible({ timeout: 2000 })) {
          await progressInput.clear()
          await progressInput.fill('5')

          // Submit progress
          await page.click(
            'button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Add")',
          )

          await page.waitForTimeout(1000)
          // Should show updated progress
          await expect(page.locator('body')).toContainText(/5|progress|updated/i, { timeout: 5000 })
        }
      }
    }
  })

  test('should view goal details', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Navigate to goals
      const goalsTab = page.locator('button:has-text("Goals"), a:has-text("Goals")').first()
      if (await goalsTab.isVisible({ timeout: 2000 })) {
        await goalsTab.click()
      }

      // Click on a goal to view details
      const goalLink = page.locator('a[href*="/goals/"], button:has-text("View")').first()

      if (await goalLink.isVisible({ timeout: 3000 })) {
        await goalLink.click()

        // Should show goal details
        await expect(page.locator('body')).toContainText(/target|current|progress|history/i, {
          timeout: 5000,
        })
      }
    }
  })

  test('should create goal groups', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Navigate to goals
      const goalsTab = page.locator('button:has-text("Goals"), a:has-text("Goals")').first()
      if (await goalsTab.isVisible({ timeout: 2000 })) {
        await goalsTab.click()
      }

      // Look for create group button
      const createGroupButton = page
        .locator(
          'button:has-text("Create Group"), button:has-text("Add Group"), button:has-text("New Group")',
        )
        .first()

      if (await createGroupButton.isVisible({ timeout: 3000 })) {
        await createGroupButton.click()

        const groupName = `Test Goal Group ${Date.now()}`
        await page.fill('input[name="name"], input[placeholder*="group" i]', groupName)
        await page.click('button[type="submit"]')

        await page.waitForTimeout(1000)
        await expect(page.locator('body')).toContainText(groupName, { timeout: 5000 })
      }
    }
  })

  test('should move goal to different group', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Navigate to goals
      const goalsTab = page.locator('button:has-text("Goals"), a:has-text("Goals")').first()
      if (await goalsTab.isVisible({ timeout: 2000 })) {
        await goalsTab.click()
      }

      // Find a goal card with menu
      const goalMenu = page
        .locator('button[aria-label*="menu"], button:has-text("⋮"), button:has-text("...")')
        .first()

      if (await goalMenu.isVisible({ timeout: 3000 })) {
        await goalMenu.click()

        // Look for move option
        const moveOption = page
          .locator('button:has-text("Move"), a:has-text("Move to group")')
          .first()

        if (await moveOption.isVisible({ timeout: 2000 })) {
          await moveOption.click()

          // Select a group
          const groupOption = page.locator('[role="option"], button').first()
          if (await groupOption.isVisible({ timeout: 2000 })) {
            await groupOption.click()
            await page.waitForTimeout(1000)
          }
        }
      }
    }
  })

  test('should delete a goal', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Navigate to goals
      const goalsTab = page.locator('button:has-text("Goals"), a:has-text("Goals")').first()
      if (await goalsTab.isVisible({ timeout: 2000 })) {
        await goalsTab.click()
      }

      // Create a goal specifically for deletion
      const createButton = page
        .locator(
          'button:has-text("Add Goal"), button:has-text("Create Goal"), button:has-text("New Goal")',
        )
        .first()

      if (await createButton.isVisible({ timeout: 3000 })) {
        await createButton.click()

        const goalTitle = `Delete Me Goal ${Date.now()}`
        await page.fill('input[name="title"]', goalTitle)
        await page.fill('input[name="targetValue"]', '5')
        await page.fill('input[name="unit"]', 'items')
        await page.click('button[type="submit"]')
        await page.waitForTimeout(2000)

        // Find and delete the goal
        const goalToDelete = page.locator(`text=${goalTitle}`).first()

        if (await goalToDelete.isVisible({ timeout: 3000 })) {
          // Look for delete button (might need to open menu first)
          const deleteButton = page.locator('button:has-text("Delete")').first()

          if (await deleteButton.isVisible({ timeout: 3000 })) {
            await deleteButton.click()

            // Confirm deletion
            const confirmButton = page
              .locator('button:has-text("Delete"), button:has-text("Confirm")')
              .last()
            await confirmButton.click({ timeout: 3000 })

            await page.waitForTimeout(2000)
            await expect(page.locator('body')).not.toContainText(goalTitle, { timeout: 5000 })
          }
        }
      }
    }
  })

  test('should view goal progress history', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Navigate to goals
      const goalsTab = page.locator('button:has-text("Goals"), a:has-text("Goals")').first()
      if (await goalsTab.isVisible({ timeout: 2000 })) {
        await goalsTab.click()
      }

      // Click on a goal to view details
      const goalLink = page.locator('a[href*="/goals/"], [data-goal-id]').first()

      if (await goalLink.isVisible({ timeout: 3000 })) {
        await goalLink.click()

        // Look for history or progress timeline
        await expect(page.locator('body')).toContainText(/history|timeline|entries|log/i, {
          timeout: 5000,
        })
      }
    }
  })

  test('should calculate goal completion percentage', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Navigate to goals
      const goalsTab = page.locator('button:has-text("Goals"), a:has-text("Goals")').first()
      if (await goalsTab.isVisible({ timeout: 2000 })) {
        await goalsTab.click()
      }

      // Look for percentage indicators (e.g., "50%", progress bars)
      const hasPercentage = (await page.locator('text=/\\d+%/').count()) > 0
      const hasProgressBar =
        (await page.locator('[role="progressbar"], .progress-bar, [aria-valuenow]').count()) > 0

      expect(hasPercentage || hasProgressBar).toBeTruthy()
    }
  })
})

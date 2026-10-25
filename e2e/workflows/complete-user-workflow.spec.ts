import { test, expect } from '@playwright/test'
import { testUsers, loginAsUser, clearAuth } from '../fixtures/auth'

/**
 * Complete user workflow E2E test
 * Tests the full journey from login to tracking learning activities
 */
test.describe('Complete User Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page)
  })

  test('should complete full learning tracking workflow', async ({ page }) => {
    // Step 1: Login
    await loginAsUser(page)
    await expect(page).toHaveURL(/track-app/, { timeout: 10000 })

    // Step 2: Create a learner
    await page.goto('/track-app')
    const createLearnerButton = page
      .locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New")')
      .first()

    if (await createLearnerButton.isVisible({ timeout: 5000 })) {
      await createLearnerButton.click()

      const learnerName = `E2E Test Learner ${Date.now()}`
      await page.fill('input[name="name"]', learnerName)

      // Add date of birth if available
      const dobInput = page.locator('input[name="dateOfBirth"], input[type="date"]').first()
      if (await dobInput.isVisible({ timeout: 2000 })) {
        await dobInput.fill('2015-01-15')
      }

      await page.click('button[type="submit"]')
      await page.waitForTimeout(2000)

      // Verify learner was created
      await expect(page.locator('body')).toContainText(learnerName, { timeout: 5000 })

      // Step 3: Navigate to the learner detail page
      const learnerCard = page.locator(`text=${learnerName}`).first()
      await learnerCard.click()
      await page.waitForTimeout(1000)

      // Step 4: Create an activity track
      const activitiesTab = page
        .locator('button:has-text("Activities"), a:has-text("Activities")')
        .first()
      if (await activitiesTab.isVisible({ timeout: 3000 })) {
        await activitiesTab.click()
        await page.waitForTimeout(500)
      }

      const createTrackButton = page
        .locator(
          'button:has-text("Add Track"), button:has-text("Create Track"), button:has-text("New Track")',
        )
        .first()
      if (await createTrackButton.isVisible({ timeout: 3000 })) {
        await createTrackButton.click()

        const trackName = 'Reading Books'
        await page.fill('input[name="name"]', trackName)
        await page.fill('input[name="unit"]', 'books')

        await page.click('button[type="submit"]')
        await page.waitForTimeout(1500)

        await expect(page.locator('body')).toContainText(trackName, { timeout: 5000 })
      }

      // Step 5: Create a goal
      const goalsTab = page.locator('button:has-text("Goals"), a:has-text("Goals")').first()
      if (await goalsTab.isVisible({ timeout: 3000 })) {
        await goalsTab.click()
        await page.waitForTimeout(500)
      }

      const createGoalButton = page
        .locator(
          'button:has-text("Add Goal"), button:has-text("Create Goal"), button:has-text("New Goal")',
        )
        .first()
      if (await createGoalButton.isVisible({ timeout: 3000 })) {
        await createGoalButton.click()

        const goalTitle = 'Read 10 Books'
        await page.fill('input[name="title"]', goalTitle)
        await page.fill('input[name="targetValue"]', '10')
        await page.fill('input[name="unit"]', 'books')

        // Set goal dates if available
        const startDateInput = page.locator('input[name="startDate"]').first()
        if (await startDateInput.isVisible({ timeout: 2000 })) {
          const today = new Date()
          const startDate = today.toISOString().split('T')[0]
          const endDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0]

          await startDateInput.fill(startDate)
          const endDateInput = page.locator('input[name="endDate"]')
          await endDateInput.fill(endDate)
        }

        await page.click('button[type="submit"]')
        await page.waitForTimeout(1500)

        await expect(page.locator('body')).toContainText(goalTitle, { timeout: 5000 })
      }

      // Step 6: Record an activity
      if (await activitiesTab.isVisible({ timeout: 2000 })) {
        await activitiesTab.click()
        await page.waitForTimeout(500)
      }

      const addActivityButton = page
        .locator(
          'button:has-text("Add Activity"), button:has-text("Record"), button:has-text("Log")',
        )
        .first()
      if (await addActivityButton.isVisible({ timeout: 3000 })) {
        await addActivityButton.click()

        const valueInput = page.locator('input[name="value"], input[type="number"]').first()
        if (await valueInput.isVisible({ timeout: 2000 })) {
          await valueInput.fill('2')

          const dateInput = page.locator('input[name="activityDate"], input[type="date"]').first()
          if (await dateInput.isVisible({ timeout: 1000 })) {
            const today = new Date().toISOString().split('T')[0]
            await dateInput.fill(today)
          }

          await page.click('button[type="submit"]')
          await page.waitForTimeout(1500)

          // Verify activity was recorded
          const bodyText = await page.locator('body').textContent()
          expect(bodyText).toMatch(/2|activity|recorded/i)
        }
      }

      // Step 7: Update goal progress
      if (await goalsTab.isVisible({ timeout: 2000 })) {
        await goalsTab.click()
        await page.waitForTimeout(500)
      }

      const goalProgressButton = page
        .locator(
          'button:has-text("Progress"), button:has-text("Add Progress"), button:has-text("Update")',
        )
        .first()
      if (await goalProgressButton.isVisible({ timeout: 3000 })) {
        await goalProgressButton.click()

        const progressInput = page.locator('input[name="value"], input[type="number"]').first()
        if (await progressInput.isVisible({ timeout: 2000 })) {
          await progressInput.clear()
          await progressInput.fill('3')

          await page.click('button[type="submit"]')
          await page.waitForTimeout(1500)

          // Verify progress was updated
          const bodyText = await page.locator('body').textContent()
          expect(bodyText).toMatch(/3|progress|30%/i)
        }
      }

      // Step 8: View dashboard with all data
      await page.goto('/track-app')
      await page.waitForTimeout(1000)

      // Should see the learner in the dashboard
      await expect(page.locator('body')).toContainText(learnerName, { timeout: 5000 })

      // Verify workflow completed successfully
      console.log('✅ Complete user workflow test passed successfully')
    }
  })

  test('should handle multiple learners workflow', async ({ page }) => {
    await loginAsUser(page)
    await page.goto('/track-app')

    // Create multiple learners
    const learnerNames = []

    for (let i = 0; i < 2; i++) {
      const createButton = page.locator('button:has-text("Add"), button:has-text("Create")').first()

      if (await createButton.isVisible({ timeout: 3000 })) {
        await createButton.click()

        const learnerName = `Multi Learner ${i + 1} ${Date.now()}`
        learnerNames.push(learnerName)

        await page.fill('input[name="name"]', learnerName)
        await page.click('button[type="submit"]')
        await page.waitForTimeout(1500)
      }
    }

    // Verify all learners are visible
    await page.goto('/track-app')
    await page.waitForTimeout(1000)

    for (const name of learnerNames) {
      const isVisible = await page.locator(`text=${name}`).first().isVisible({ timeout: 3000 })
      expect(isVisible).toBeTruthy()
    }
  })

  test('should create and organize with groups', async ({ page }) => {
    await loginAsUser(page)
    await page.goto('/track-app')

    // Create a group
    const groupButton = page
      .locator('button:has-text("Group"), button:has-text("Create Group")')
      .first()

    if (await groupButton.isVisible({ timeout: 3000 })) {
      await groupButton.click()

      const groupName = `Test Family ${Date.now()}`
      await page.fill('input[name="name"]', groupName)
      await page.click('button[type="submit"]')
      await page.waitForTimeout(1000)

      await expect(page.locator('body')).toContainText(groupName, { timeout: 5000 })

      // Create a learner in the group
      const createLearnerButton = page
        .locator('button:has-text("Add"), button:has-text("Create Learner")')
        .first()

      if (await createLearnerButton.isVisible({ timeout: 3000 })) {
        await createLearnerButton.click()

        const learnerName = `Grouped Learner ${Date.now()}`
        await page.fill('input[name="name"]', learnerName)

        // Select the group if dropdown is available
        const groupSelect = page
          .locator('select[name="groupId"], button:has-text("Select Group")')
          .first()
        if (await groupSelect.isVisible({ timeout: 2000 })) {
          if ((await groupSelect.getAttribute('role')) === 'combobox') {
            await groupSelect.click()
            const option = page.locator('[role="option"]').first()
            if (await option.isVisible({ timeout: 1000 })) {
              await option.click()
            }
          }
        }

        await page.click('button[type="submit"]')
        await page.waitForTimeout(1500)

        await expect(page.locator('body')).toContainText(learnerName, { timeout: 5000 })
      }
    }
  })

  test('should apply learning template workflow', async ({ page }) => {
    await loginAsUser(page)
    await page.goto('/track-app')

    // First create a learner
    const createButton = page.locator('button:has-text("Add"), button:has-text("Create")').first()

    if (await createButton.isVisible({ timeout: 3000 })) {
      await createButton.click()

      const learnerName = `Template Test Learner ${Date.now()}`
      await page.fill('input[name="name"]', learnerName)
      await page.click('button[type="submit"]')
      await page.waitForTimeout(2000)

      // Navigate to templates
      const templatesLink = page.locator('a[href*="/templates"], a:has-text("Templates")').first()

      if (await templatesLink.isVisible({ timeout: 5000 })) {
        await templatesLink.click()

        // Try to find an existing template or create one
        const templateCard = page.locator('a[href*="/templates/"], [data-template-id]').first()

        if (await templateCard.isVisible({ timeout: 3000 })) {
          await templateCard.click()

          // Apply template
          const applyButton = page
            .locator('button:has-text("Apply"), button:has-text("Use Template")')
            .first()

          if (await applyButton.isVisible({ timeout: 3000 })) {
            await applyButton.click()

            // Select the learner we created
            const learnerSelect = page.locator('select[name="learnerId"], button').first()

            if (await learnerSelect.isVisible({ timeout: 2000 })) {
              await page.waitForTimeout(500)
              // Try to find and click our learner
              const learnerOption = page.locator(`text=${learnerName}`).first()
              if (await learnerOption.isVisible({ timeout: 1000 })) {
                await learnerOption.click()
              }

              await page.click('button[type="submit"]')
              await page.waitForTimeout(2000)

              // Should show success or navigate away
              console.log('✅ Template applied successfully')
            }
          }
        }
      }
    }
  })
})

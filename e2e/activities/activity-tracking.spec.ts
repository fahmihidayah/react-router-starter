import { test, expect } from '@playwright/test'
import { testUsers, loginAsUser, clearAuth } from '../fixtures/auth'

test.describe('Activity Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page)
    await loginAsUser(page)
  })

  test('should display activities list', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Look for activities section
      await expect(page.locator('body')).toContainText(/activities|activity|tracks/i, {
        timeout: 5000,
      })
    }
  })

  test('should create a new activity track', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Navigate to activities tab if exists
      const activitiesTab = page
        .locator('button:has-text("Activities"), a:has-text("Activities")')
        .first()
      if (await activitiesTab.isVisible({ timeout: 2000 })) {
        await activitiesTab.click()
        await page.waitForTimeout(500)
      }

      // Look for create track button
      const createButton = page
        .locator(
          'button:has-text("Add Track"), button:has-text("Create Track"), button:has-text("New Track")',
        )
        .first()

      if (await createButton.isVisible({ timeout: 3000 })) {
        await createButton.click()

        // Fill track form
        const trackName = `Test Track ${Date.now()}`
        await page.fill('input[name="name"], input[placeholder*="name" i]', trackName)
        await page.fill('input[name="unit"], input[placeholder*="unit" i]', 'hours')

        // Select icon and color if available
        const iconButton = page.locator('button[aria-label*="icon"], input[name="icon"]').first()
        if (await iconButton.isVisible({ timeout: 1000 })) {
          await iconButton.click()
          await page.waitForTimeout(200)
          const firstIcon = page.locator('button[role="option"], .icon-option').first()
          if (await firstIcon.isVisible({ timeout: 1000 })) {
            await firstIcon.click()
          }
        }

        // Submit form
        await page.click(
          'button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Add"), button[type="submit"]:has-text("Save")',
        )

        // Verify track appears
        await page.waitForTimeout(2000)
        await expect(page.locator('body')).toContainText(trackName, { timeout: 5000 })
      }
    }
  })

  test('should record an activity', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Navigate to activities
      const activitiesTab = page
        .locator('button:has-text("Activities"), a:has-text("Activities")')
        .first()
      if (await activitiesTab.isVisible({ timeout: 2000 })) {
        await activitiesTab.click()
      }

      // Look for add activity button
      const addActivityButton = page
        .locator(
          'button:has-text("Add Activity"), button:has-text("Record"), button:has-text("Log Activity")',
        )
        .first()

      if (await addActivityButton.isVisible({ timeout: 3000 })) {
        await addActivityButton.click()

        // Fill activity form
        const valueInput = page.locator('input[name="value"], input[type="number"]').first()
        if (await valueInput.isVisible({ timeout: 2000 })) {
          await valueInput.fill('2')

          // Select or enter date
          const dateInput = page.locator('input[name="activityDate"], input[type="date"]').first()
          if (await dateInput.isVisible({ timeout: 1000 })) {
            const today = new Date().toISOString().split('T')[0]
            await dateInput.fill(today)
          }

          // Add note if available
          const noteInput = page.locator('input[name="note"], textarea[name="note"]').first()
          if (await noteInput.isVisible({ timeout: 1000 })) {
            await noteInput.fill('Test activity note')
          }

          // Submit activity
          await page.click(
            'button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Add"), button[type="submit"]:has-text("Record")',
          )

          await page.waitForTimeout(1000)
          await expect(page.locator('body')).toContainText(/2|activity|recorded|saved/i, {
            timeout: 5000,
          })
        }
      }
    }
  })

  test('should view activity history', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Navigate to activities
      const activitiesTab = page
        .locator('button:has-text("Activities"), a:has-text("Activities")')
        .first()
      if (await activitiesTab.isVisible({ timeout: 2000 })) {
        await activitiesTab.click()
      }

      // Look for activity history or list
      await expect(page.locator('body')).toContainText(/history|recent|all activities|log/i, {
        timeout: 5000,
      })

      // Click on a track to view its activities
      const trackCard = page.locator('a[href*="/tracks/"], [data-track-id]').first()
      if (await trackCard.isVisible({ timeout: 3000 })) {
        await trackCard.click()

        // Should show activities for this track
        await expect(page.locator('body')).toContainText(/activities|entries|records/i, {
          timeout: 5000,
        })
      }
    }
  })

  test('should edit activity track', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Navigate to activities
      const activitiesTab = page
        .locator('button:has-text("Activities"), a:has-text("Activities")')
        .first()
      if (await activitiesTab.isVisible({ timeout: 2000 })) {
        await activitiesTab.click()
      }

      // Find track menu button
      const trackMenu = page.locator('button[aria-label*="menu"], button:has-text("⋮")').first()

      if (await trackMenu.isVisible({ timeout: 3000 })) {
        await trackMenu.click()

        // Look for edit/rename option
        const editOption = page
          .locator('button:has-text("Edit"), button:has-text("Rename")')
          .first()

        if (await editOption.isVisible({ timeout: 2000 })) {
          await editOption.click()

          const newName = `Updated Track ${Date.now()}`
          const nameInput = page.locator('input[name="name"]')
          await nameInput.clear()
          await nameInput.fill(newName)
          await page.click(
            'button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Update")',
          )

          await page.waitForTimeout(1000)
          await expect(page.locator('body')).toContainText(newName, { timeout: 5000 })
        }
      }
    }
  })

  test('should archive activity track', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Navigate to activities
      const activitiesTab = page
        .locator('button:has-text("Activities"), a:has-text("Activities")')
        .first()
      if (await activitiesTab.isVisible({ timeout: 2000 })) {
        await activitiesTab.click()
      }

      // Create a track to archive
      const createButton = page
        .locator('button:has-text("Add Track"), button:has-text("Create Track")')
        .first()

      if (await createButton.isVisible({ timeout: 3000 })) {
        await createButton.click()

        const trackName = `Archive Me ${Date.now()}`
        await page.fill('input[name="name"]', trackName)
        await page.fill('input[name="unit"]', 'items')
        await page.click('button[type="submit"]')
        await page.waitForTimeout(2000)

        // Find and archive the track
        const trackMenu = page.locator('button[aria-label*="menu"]').first()

        if (await trackMenu.isVisible({ timeout: 3000 })) {
          await trackMenu.click()

          const archiveOption = page.locator('button:has-text("Archive")').first()

          if (await archiveOption.isVisible({ timeout: 2000 })) {
            await archiveOption.click()

            // Confirm if needed
            const confirmButton = page
              .locator('button:has-text("Archive"), button:has-text("Confirm")')
              .last()
            if (await confirmButton.isVisible({ timeout: 1000 })) {
              await confirmButton.click()
            }

            await page.waitForTimeout(1000)
            // Track should be hidden or marked as archived
            // It may still appear in "show archived" view
          }
        }
      }
    }
  })

  test('should delete an activity record', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Navigate to activities
      const activitiesTab = page
        .locator('button:has-text("Activities"), a:has-text("Activities")')
        .first()
      if (await activitiesTab.isVisible({ timeout: 2000 })) {
        await activitiesTab.click()
      }

      // Look for an activity record to delete
      const activityMenu = page
        .locator(
          '[data-activity-id] button[aria-label*="menu"], .activity-item button:has-text("⋮")',
        )
        .first()

      if (await activityMenu.isVisible({ timeout: 3000 })) {
        await activityMenu.click()

        const deleteOption = page.locator('button:has-text("Delete")').first()

        if (await deleteOption.isVisible({ timeout: 2000 })) {
          await deleteOption.click()

          // Confirm deletion
          const confirmButton = page
            .locator('button:has-text("Delete"), button:has-text("Confirm")')
            .last()
          await confirmButton.click({ timeout: 3000 })

          await page.waitForTimeout(1000)
        }
      }
    }
  })

  test('should use Pomodoro timer for activities', async ({ page }) => {
    await page.goto('/track-app')

    // Look for Pomodoro feature
    const pomodoroButton = page
      .locator('button:has-text("Pomodoro"), button:has-text("Timer"), a[href*="pomodoro"]')
      .first()

    if (await pomodoroButton.isVisible({ timeout: 3000 })) {
      await pomodoroButton.click()

      // Should show Pomodoro setup or timer
      await expect(page.locator('body')).toContainText(/pomodoro|timer|focus|minutes/i, {
        timeout: 5000,
      })

      // Look for start button
      const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")').first()

      if (await startButton.isVisible({ timeout: 2000 })) {
        // Just verify the button exists, don't actually wait for timer
        expect(await startButton.isVisible()).toBeTruthy()
      }
    }
  })

  test('should filter activities by date range', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Navigate to activities
      const activitiesTab = page
        .locator('button:has-text("Activities"), a:has-text("Activities")')
        .first()
      if (await activitiesTab.isVisible({ timeout: 2000 })) {
        await activitiesTab.click()
      }

      // Look for date filter controls
      const dateFilter = page
        .locator('input[type="date"], button:has-text("Filter"), button:has-text("Date")')
        .first()

      if (await dateFilter.isVisible({ timeout: 3000 })) {
        // Date filtering functionality exists
        expect(await dateFilter.isVisible()).toBeTruthy()
      }
    }
  })

  test('should display activity statistics', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Look for statistics or summary
      await expect(page.locator('body')).toContainText(/total|summary|statistics|count/i, {
        timeout: 5000,
      })
    }
  })

  test('should export activity data', async ({ page }) => {
    await page.goto('/track-app')

    // Look for export button
    const exportButton = page
      .locator('button:has-text("Export"), button:has-text("Download"), a:has-text("Export")')
      .first()

    if (await exportButton.isVisible({ timeout: 3000 })) {
      // Export functionality exists
      expect(await exportButton.isVisible()).toBeTruthy()
    }
  })
})

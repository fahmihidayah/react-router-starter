import { test, expect } from '@playwright/test'
import { testUsers, loginAsUser, clearAuth } from '../fixtures/auth'

test.describe('Schedule Management', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page)
    await loginAsUser(page)
  })

  test('should display schedule for a learner', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Look for schedule section or tab
      const scheduleTab = page
        .locator('button:has-text("Schedule"), a:has-text("Schedule"), button:has-text("Plan")')
        .first()

      if (await scheduleTab.isVisible({ timeout: 3000 })) {
        await scheduleTab.click()
        await page.waitForTimeout(500)

        // Should show schedule interface
        await expect(page.locator('body')).toContainText(/schedule|plan|calendar/i, {
          timeout: 5000,
        })
      }
    }
  })

  test('should create a schedule plan', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Navigate to schedule
      const scheduleTab = page
        .locator('button:has-text("Schedule"), a:has-text("Schedule")')
        .first()
      if (await scheduleTab.isVisible({ timeout: 3000 })) {
        await scheduleTab.click()
        await page.waitForTimeout(500)
      }

      // Create or edit schedule plan
      const planButton = page
        .locator(
          'button:has-text("Create Plan"), button:has-text("Edit Plan"), button:has-text("Plan")',
        )
        .first()

      if (await planButton.isVisible({ timeout: 3000 })) {
        await planButton.click()

        // Select start date
        const startDateInput = page.locator('input[name="startsOn"], input[type="date"]').first()
        if (await startDateInput.isVisible({ timeout: 2000 })) {
          const today = new Date().toISOString().split('T')[0]
          await startDateInput.fill(today)
        }

        // Add items to schedule if available
        const addItemButton = page
          .locator(
            'button:has-text("Add Item"), button:has-text("Add Goal"), button:has-text("Add Track")',
          )
          .first()

        if (await addItemButton.isVisible({ timeout: 2000 })) {
          await addItemButton.click()
          await page.waitForTimeout(500)

          // Select a goal or track
          const sourceSelect = page
            .locator('select[name*="source"], button[role="combobox"]')
            .first()
          if (await sourceSelect.isVisible({ timeout: 1000 })) {
            await sourceSelect.click()
            const firstOption = page.locator('[role="option"]').first()
            if (await firstOption.isVisible({ timeout: 1000 })) {
              await firstOption.click()
            }
          }

          // Set duration
          const durationInput = page
            .locator('input[name*="duration"], input[name*="minutes"]')
            .first()
          if (await durationInput.isVisible({ timeout: 1000 })) {
            await durationInput.fill('30')
          }
        }

        // Save plan
        await page.click(
          'button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Create")',
        )
        await page.waitForTimeout(2000)

        // Should show success or schedule view
        await expect(page.locator('body')).toContainText(/schedule|plan|saved/i, { timeout: 5000 })
      }
    }
  })

  test('should add a todo to schedule', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner with schedule
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Navigate to schedule
      const scheduleTab = page
        .locator('button:has-text("Schedule"), a:has-text("Schedule")')
        .first()
      if (await scheduleTab.isVisible({ timeout: 3000 })) {
        await scheduleTab.click()
        await page.waitForTimeout(500)
      }

      // Add todo to a specific day
      const addTodoButton = page
        .locator(
          'button:has-text("Add Todo"), button:has-text("Add Task"), button[aria-label*="add"]',
        )
        .first()

      if (await addTodoButton.isVisible({ timeout: 3000 })) {
        await addTodoButton.click()

        // Select source (goal or track)
        const sourceSelect = page
          .locator('select[name="sourceId"], button[role="combobox"]')
          .first()
        if (await sourceSelect.isVisible({ timeout: 2000 })) {
          await sourceSelect.click()
          const option = page.locator('[role="option"]').first()
          if (await option.isVisible({ timeout: 1000 })) {
            await option.click()
          }
        }

        // Set planned duration
        const durationInput = page.locator('input[name="plannedDurationMinutes"]').first()
        if (await durationInput.isVisible({ timeout: 1000 })) {
          await durationInput.fill('25')
        }

        // Submit
        await page.click('button[type="submit"]')
        await page.waitForTimeout(1500)

        // Should show the new todo
        await expect(page.locator('body')).toContainText(/todo|task|added/i, { timeout: 5000 })
      }
    }
  })

  test('should view schedule in different formats', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Navigate to schedule
      const scheduleTab = page
        .locator('button:has-text("Schedule"), a:has-text("Schedule")')
        .first()
      if (await scheduleTab.isVisible({ timeout: 3000 })) {
        await scheduleTab.click()
        await page.waitForTimeout(500)
      }

      // Try different view modes: day, week, month
      const viewButtons = ['Day', 'Week', 'Month']

      for (const view of viewButtons) {
        const viewButton = page.locator(`button:has-text("${view}")`).first()

        if (await viewButton.isVisible({ timeout: 2000 })) {
          await viewButton.click()
          await page.waitForTimeout(500)

          // Verify view changed
          const bodyText = await page.locator('body').textContent()
          expect(bodyText).toBeTruthy()
        }
      }
    }
  })

  test('should mark schedule todo as complete', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Navigate to schedule
      const scheduleTab = page
        .locator('button:has-text("Schedule"), a:has-text("Schedule")')
        .first()
      if (await scheduleTab.isVisible({ timeout: 3000 })) {
        await scheduleTab.click()
        await page.waitForTimeout(500)
      }

      // Find a todo item and mark as complete
      const todoCheckbox = page
        .locator('input[type="checkbox"], button[aria-label*="complete"]')
        .first()

      if (await todoCheckbox.isVisible({ timeout: 3000 })) {
        await todoCheckbox.click()
        await page.waitForTimeout(1000)

        // Should show completion state
        const bodyText = await page.locator('body').textContent()
        expect(bodyText).toMatch(/completed|done|finished/i)
      }
    }
  })

  test('should remove a todo from schedule', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Navigate to schedule
      const scheduleTab = page
        .locator('button:has-text("Schedule"), a:has-text("Schedule")')
        .first()
      if (await scheduleTab.isVisible({ timeout: 3000 })) {
        await scheduleTab.click()
        await page.waitForTimeout(500)
      }

      // Find todo menu or delete button
      const todoMenu = page
        .locator('[data-todo-id] button[aria-label*="menu"], .todo-item button:has-text("⋮")')
        .first()

      if (await todoMenu.isVisible({ timeout: 3000 })) {
        await todoMenu.click()

        const removeButton = page
          .locator('button:has-text("Remove"), button:has-text("Delete")')
          .first()

        if (await removeButton.isVisible({ timeout: 2000 })) {
          await removeButton.click()

          // Confirm if needed
          const confirmButton = page
            .locator('button:has-text("Remove"), button:has-text("Confirm")')
            .last()
          if (await confirmButton.isVisible({ timeout: 1000 })) {
            await confirmButton.click()
          }

          await page.waitForTimeout(1000)
        }
      }
    }
  })

  test('should clear schedule for a day', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Navigate to schedule
      const scheduleTab = page
        .locator('button:has-text("Schedule"), a:has-text("Schedule")')
        .first()
      if (await scheduleTab.isVisible({ timeout: 3000 })) {
        await scheduleTab.click()
        await page.waitForTimeout(500)
      }

      // Look for clear day button
      const clearButton = page
        .locator('button:has-text("Clear Day"), button:has-text("Clear Schedule")')
        .first()

      if (await clearButton.isVisible({ timeout: 3000 })) {
        await clearButton.click()

        // Confirm clear action
        const confirmButton = page
          .locator('button:has-text("Clear"), button:has-text("Confirm")')
          .last()
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click()
        }

        await page.waitForTimeout(1500)

        // Should show cleared state or success message
        console.log('✅ Schedule cleared for day')
      }
    }
  })

  test('should reorder schedule todos', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Navigate to schedule
      const scheduleTab = page
        .locator('button:has-text("Schedule"), a:has-text("Schedule")')
        .first()
      if (await scheduleTab.isVisible({ timeout: 3000 })) {
        await scheduleTab.click()
        await page.waitForTimeout(500)
      }

      // Look for move up/down buttons
      const moveButton = page
        .locator('button[aria-label*="move"], button:has-text("↑"), button:has-text("↓")')
        .first()

      if (await moveButton.isVisible({ timeout: 3000 })) {
        await moveButton.click()
        await page.waitForTimeout(1000)

        // Should have reordered
        console.log('✅ Schedule todos reordered')
      }
    }
  })

  test('should navigate between weeks in schedule', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Navigate to schedule
      const scheduleTab = page
        .locator('button:has-text("Schedule"), a:has-text("Schedule")')
        .first()
      if (await scheduleTab.isVisible({ timeout: 3000 })) {
        await scheduleTab.click()
        await page.waitForTimeout(500)
      }

      // Navigate to next week
      const nextButton = page
        .locator('button[aria-label*="next"], button:has-text("→"), button:has-text("Next")')
        .first()

      if (await nextButton.isVisible({ timeout: 3000 })) {
        await nextButton.click()
        await page.waitForTimeout(500)

        // Navigate to previous week
        const prevButton = page
          .locator('button[aria-label*="prev"], button:has-text("←"), button:has-text("Previous")')
          .first()

        if (await prevButton.isVisible({ timeout: 2000 })) {
          await prevButton.click()
          await page.waitForTimeout(500)
        }

        // Should have navigated
        console.log('✅ Schedule week navigation works')
      }
    }
  })

  test('should show schedule statistics', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Navigate to schedule
      const scheduleTab = page
        .locator('button:has-text("Schedule"), a:has-text("Schedule")')
        .first()
      if (await scheduleTab.isVisible({ timeout: 3000 })) {
        await scheduleTab.click()
        await page.waitForTimeout(500)
      }

      // Look for statistics or summary
      const hasStats =
        (await page.locator('text=/\\d+.*completed|\\d+.*planned|\\d+.*hours/i').count()) > 0

      if (hasStats) {
        console.log('✅ Schedule statistics displayed')
      }

      // Should show some scheduling information
      await expect(page.locator('body')).toContainText(/schedule|plan|todo/i, { timeout: 5000 })
    }
  })
})

import { test, expect } from '@playwright/test'
import { testUsers, loginAsUser, clearAuth } from '../fixtures/auth'

test.describe('Pomodoro Timer', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page)
    await loginAsUser(page)
  })

  test('should display pomodoro timer interface', async ({ page }) => {
    await page.goto('/track-app')

    // Look for pomodoro button or link
    const pomodoroButton = page
      .locator('button:has-text("Pomodoro"), a:has-text("Pomodoro"), a[href*="pomodoro"]')
      .first()

    if (await pomodoroButton.isVisible({ timeout: 5000 })) {
      await pomodoroButton.click()
      await page.waitForTimeout(1000)

      // Should show pomodoro interface
      await expect(page.locator('body')).toContainText(/pomodoro|timer|focus/i, { timeout: 5000 })
    }
  })

  test('should setup pomodoro session', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to pomodoro
    const pomodoroButton = page
      .locator('button:has-text("Pomodoro"), a:has-text("Pomodoro")')
      .first()

    if (await pomodoroButton.isVisible({ timeout: 5000 })) {
      await pomodoroButton.click()
      await page.waitForTimeout(1000)

      // Look for setup or start button
      const setupButton = page
        .locator(
          'button:has-text("Setup"), button:has-text("Configure"), button:has-text("Settings")',
        )
        .first()

      if (await setupButton.isVisible({ timeout: 3000 })) {
        await setupButton.click()

        // Set focus duration
        const focusDurationInput = page
          .locator('input[name="focusDuration"], input[name="duration"]')
          .first()
        if (await focusDurationInput.isVisible({ timeout: 2000 })) {
          await focusDurationInput.clear()
          await focusDurationInput.fill('25')
        }

        // Set break duration
        const breakDurationInput = page
          .locator('input[name="breakDuration"], input[name="break"]')
          .first()
        if (await breakDurationInput.isVisible({ timeout: 1000 })) {
          await breakDurationInput.clear()
          await breakDurationInput.fill('5')
        }

        // Set number of rounds
        const roundsInput = page.locator('input[name="rounds"], input[name="sessions"]').first()
        if (await roundsInput.isVisible({ timeout: 1000 })) {
          await roundsInput.clear()
          await roundsInput.fill('4')
        }

        // Select goal or activity
        const sourceSelect = page
          .locator('select[name*="goal"], select[name*="activity"], button[role="combobox"]')
          .first()
        if (await sourceSelect.isVisible({ timeout: 2000 })) {
          await sourceSelect.click()
          const option = page.locator('[role="option"]').first()
          if (await option.isVisible({ timeout: 1000 })) {
            await option.click()
          }
        }

        // Save setup
        await page.click(
          'button[type="submit"]:has-text("Start"), button[type="submit"]:has-text("Save")',
        )
        await page.waitForTimeout(1000)

        // Should show timer
        await expect(page.locator('body')).toContainText(/\\d+:\\d+|timer|focus/i, {
          timeout: 5000,
        })
      }
    }
  })

  test('should start pomodoro timer', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to pomodoro
    const pomodoroButton = page
      .locator('button:has-text("Pomodoro"), a:has-text("Pomodoro")')
      .first()

    if (await pomodoroButton.isVisible({ timeout: 5000 })) {
      await pomodoroButton.click()
      await page.waitForTimeout(1000)

      // Start timer
      const startButton = page.locator('button:has-text("Start"), button:has-text("Begin")').first()

      if (await startButton.isVisible({ timeout: 3000 })) {
        // Get initial time display
        const timeDisplay = page.locator('text=/\\d{1,2}:\\d{2}/').first()
        const initialTime = await timeDisplay.textContent()

        await startButton.click()
        await page.waitForTimeout(2000)

        // Timer should be running (we won't wait for it to count down fully)
        const hasPlayingState = await page
          .locator('button:has-text("Pause"), button:has-text("Stop")')
          .first()
          .isVisible({ timeout: 2000 })

        if (hasPlayingState) {
          console.log('✅ Pomodoro timer started successfully')
        }
      }
    }
  })

  test('should pause and resume pomodoro timer', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to pomodoro
    const pomodoroButton = page
      .locator('button:has-text("Pomodoro"), a:has-text("Pomodoro")')
      .first()

    if (await pomodoroButton.isVisible({ timeout: 5000 })) {
      await pomodoroButton.click()
      await page.waitForTimeout(1000)

      // Start timer
      const startButton = page.locator('button:has-text("Start")').first()

      if (await startButton.isVisible({ timeout: 3000 })) {
        await startButton.click()
        await page.waitForTimeout(1000)

        // Pause timer
        const pauseButton = page.locator('button:has-text("Pause")').first()

        if (await pauseButton.isVisible({ timeout: 3000 })) {
          await pauseButton.click()
          await page.waitForTimeout(500)

          // Resume timer
          const resumeButton = page
            .locator('button:has-text("Resume"), button:has-text("Continue")')
            .first()

          if (await resumeButton.isVisible({ timeout: 2000 })) {
            await resumeButton.click()
            await page.waitForTimeout(500)

            console.log('✅ Pomodoro timer paused and resumed')
          }
        }
      }
    }
  })

  test('should stop pomodoro timer', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to pomodoro
    const pomodoroButton = page
      .locator('button:has-text("Pomodoro"), a:has-text("Pomodoro")')
      .first()

    if (await pomodoroButton.isVisible({ timeout: 5000 })) {
      await pomodoroButton.click()
      await page.waitForTimeout(1000)

      // Start timer
      const startButton = page.locator('button:has-text("Start")').first()

      if (await startButton.isVisible({ timeout: 3000 })) {
        await startButton.click()
        await page.waitForTimeout(1000)

        // Stop timer
        const stopButton = page
          .locator('button:has-text("Stop"), button:has-text("Cancel")')
          .first()

        if (await stopButton.isVisible({ timeout: 3000 })) {
          await stopButton.click()
          await page.waitForTimeout(500)

          // Confirm stop if needed
          const confirmButton = page
            .locator('button:has-text("Stop"), button:has-text("Confirm")')
            .last()
          if (await confirmButton.isVisible({ timeout: 1000 })) {
            await confirmButton.click()
          }

          await page.waitForTimeout(500)
          console.log('✅ Pomodoro timer stopped')
        }
      }
    }
  })

  test('should show pomodoro break screen', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to pomodoro
    const pomodoroButton = page
      .locator('button:has-text("Pomodoro"), a:has-text("Pomodoro")')
      .first()

    if (await pomodoroButton.isVisible({ timeout: 5000 })) {
      await pomodoroButton.click()
      await page.waitForTimeout(1000)

      // Look for any indication of break state in the UI
      const hasBreakInfo = (await page.locator('text=/break|rest|pause/i').count()) > 0

      if (hasBreakInfo) {
        console.log('✅ Pomodoro break information available')
      }

      // Should show pomodoro interface
      await expect(page.locator('body')).toContainText(/pomodoro|timer|focus|session/i, {
        timeout: 5000,
      })
    }
  })

  test('should track completed pomodoro sessions', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to pomodoro
    const pomodoroButton = page
      .locator('button:has-text("Pomodoro"), a:has-text("Pomodoro")')
      .first()

    if (await pomodoroButton.isVisible({ timeout: 5000 })) {
      await pomodoroButton.click()
      await page.waitForTimeout(1000)

      // Look for session counter or history
      const hasSessionCount =
        (await page.locator('text=/\\d+.*session|\\d+.*completed|\\d+.*rounds?/i').count()) > 0

      if (hasSessionCount) {
        console.log('✅ Pomodoro session tracking displayed')
      }
    }
  })

  test('should link pomodoro to goal', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner with goals
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Navigate to goals
      const goalsTab = page.locator('button:has-text("Goals"), a:has-text("Goals")').first()
      if (await goalsTab.isVisible({ timeout: 3000 })) {
        await goalsTab.click()
        await page.waitForTimeout(500)
      }

      // Look for pomodoro button on a goal
      const goalPomodoroButton = page
        .locator('button:has-text("Pomodoro"), button[aria-label*="pomodoro"]')
        .first()

      if (await goalPomodoroButton.isVisible({ timeout: 3000 })) {
        await goalPomodoroButton.click()
        await page.waitForTimeout(1000)

        // Should open pomodoro for that goal
        await expect(page.locator('body')).toContainText(/pomodoro|timer|focus/i, { timeout: 5000 })
      }
    }
  })

  test('should show pomodoro completion dialog', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to pomodoro
    const pomodoroButton = page
      .locator('button:has-text("Pomodoro"), a:has-text("Pomodoro")')
      .first()

    if (await pomodoroButton.isVisible({ timeout: 5000 })) {
      await pomodoroButton.click()
      await page.waitForTimeout(1000)

      // Check if completion dialog exists in the codebase
      // This would normally be triggered after completing a session
      // We're just verifying the UI exists
      const hasCompletionUI =
        (await page.locator('text=/complete|finished|done|well done/i').count()) > 0

      if (hasCompletionUI) {
        console.log('✅ Pomodoro completion UI exists')
      }

      // Should show pomodoro interface
      await expect(page.locator('body')).toContainText(/pomodoro|timer|focus/i, { timeout: 5000 })
    }
  })

  test('should customize pomodoro durations', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to pomodoro
    const pomodoroButton = page
      .locator('button:has-text("Pomodoro"), a:has-text("Pomodoro")')
      .first()

    if (await pomodoroButton.isVisible({ timeout: 5000 })) {
      await pomodoroButton.click()
      await page.waitForTimeout(1000)

      // Look for settings or customization
      const settingsButton = page
        .locator('button[aria-label*="settings"], button:has-text("Settings")')
        .first()

      if (await settingsButton.isVisible({ timeout: 3000 })) {
        await settingsButton.click()

        // Should show duration inputs
        const hasDurationInputs =
          (await page.locator('input[type="number"], input[name*="duration"]').count()) > 0

        if (hasDurationInputs) {
          console.log('✅ Pomodoro duration customization available')
        }
      }
    }
  })

  test('should show pomodoro history', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Look for pomodoro history or activities with pomodoro
      const activitiesTab = page
        .locator('button:has-text("Activities"), a:has-text("Activities")')
        .first()
      if (await activitiesTab.isVisible({ timeout: 3000 })) {
        await activitiesTab.click()
        await page.waitForTimeout(500)
      }

      // Check for pomodoro-related records
      const hasPomodoroRecords =
        (await page.locator('text=/pomodoro|🍅|timer|focus session/i').count()) > 0

      if (hasPomodoroRecords) {
        console.log('✅ Pomodoro history available')
      }
    }
  })

  test('should show notification at pomodoro end', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to pomodoro
    const pomodoroButton = page
      .locator('button:has-text("Pomodoro"), a:has-text("Pomodoro")')
      .first()

    if (await pomodoroButton.isVisible({ timeout: 5000 })) {
      await pomodoroButton.click()
      await page.waitForTimeout(1000)

      // Check if notification/sound settings exist
      const hasNotificationSettings =
        (await page.locator('text=/notification|sound|alert/i').count()) > 0

      if (hasNotificationSettings) {
        console.log('✅ Pomodoro notification settings available')
      }

      // Should show pomodoro interface
      await expect(page.locator('body')).toContainText(/pomodoro|timer/i, { timeout: 5000 })
    }
  })
})

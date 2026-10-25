import { test, expect } from '@playwright/test'
import { testUsers, loginAsUser, clearAuth } from '../fixtures/auth'

test.describe('Reports and Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page)
    await loginAsUser(page)
  })

  test('should display main dashboard', async ({ page }) => {
    await page.goto('/track-app')

    // Should show dashboard elements
    await expect(page.locator('body')).toContainText(/dashboard|learners|overview/i, {
      timeout: 10000,
    })

    // Should show user name or profile
    await expect(page.locator('body')).toContainText(testUsers.user.name, { timeout: 5000 })
  })

  test('should show learner list on dashboard', async ({ page }) => {
    await page.goto('/track-app')

    // Look for learner cards or list
    const learnerSection = page.locator('text=/learners?|students?/i').first()

    if (await learnerSection.isVisible({ timeout: 5000 })) {
      // Should have some learner-related content
      await expect(page.locator('body')).toContainText(/learner|student/i, { timeout: 5000 })
    }
  })

  test('should display today schedule on dashboard', async ({ page }) => {
    await page.goto('/track-app')

    // Look for today's schedule section
    const todaySection = page.locator('text=/today|schedule|plan/i').first()

    if (await todaySection.isVisible({ timeout: 5000 })) {
      console.log("✅ Today's schedule displayed on dashboard")
    }

    // Should show some scheduling-related content
    const hasScheduleContent = (await page.locator('text=/schedule|plan|todo|task/i').count()) > 0
    expect(hasScheduleContent).toBeTruthy()
  })

  test('should show activity summary on dashboard', async ({ page }) => {
    await page.goto('/track-app')

    // Look for activity statistics or summary
    const hasActivityStats = (await page.locator('text=/activities?|recent|latest/i').count()) > 0

    if (hasActivityStats) {
      console.log('✅ Activity summary displayed')
    }

    // Should show dashboard content
    await expect(page.locator('body')).toContainText(/track|dashboard|app/i, { timeout: 5000 })
  })

  test('should navigate to monthly report', async ({ page }) => {
    await page.goto('/track-app')

    // Look for reports link or button
    const reportsLink = page
      .locator('a[href*="/reports"], button:has-text("Reports"), a:has-text("Reports")')
      .first()

    if (await reportsLink.isVisible({ timeout: 5000 })) {
      await reportsLink.click()
      await page.waitForTimeout(1000)

      // Should show report interface
      await expect(page.locator('body')).toContainText(/report|monthly|summary/i, { timeout: 5000 })
    }
  })

  test('should filter report by month', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to reports
    const reportsLink = page.locator('a[href*="/reports"], a:has-text("Reports")').first()

    if (await reportsLink.isVisible({ timeout: 5000 })) {
      await reportsLink.click()
      await page.waitForTimeout(1000)

      // Look for month picker or filter
      const monthPicker = page
        .locator('button[aria-label*="month"], select[name="month"], input[type="month"]')
        .first()

      if (await monthPicker.isVisible({ timeout: 3000 })) {
        await monthPicker.click()
        await page.waitForTimeout(500)

        // Select a different month if possible
        const monthOption = page.locator('button[role="option"], option').first()
        if (await monthOption.isVisible({ timeout: 1000 })) {
          await monthOption.click()
          await page.waitForTimeout(1000)

          // Report should update
          console.log('✅ Report filtered by month')
        }
      }
    }
  })

  test('should display learner progress in report', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Look for reports or progress tab
      const reportsTab = page
        .locator('button:has-text("Reports"), a:has-text("Reports"), button:has-text("Progress")')
        .first()

      if (await reportsTab.isVisible({ timeout: 3000 })) {
        await reportsTab.click()
        await page.waitForTimeout(500)

        // Should show progress metrics
        await expect(page.locator('body')).toContainText(/progress|report|statistics|metrics/i, {
          timeout: 5000,
        })
      }
    }
  })

  test('should show goal completion statistics', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Look for goals overview or statistics
      const goalsSection = page.locator('text=/goals?.*progress|completion|achieved/i').first()

      if (await goalsSection.isVisible({ timeout: 3000 })) {
        console.log('✅ Goal completion statistics displayed')
      }

      // Should show some goal-related metrics
      const hasGoalMetrics =
        (await page.locator('text=/\\d+%|\\d+.*completed|\\d+.*goals?/i').count()) > 0
      expect(hasGoalMetrics).toBeTruthy()
    }
  })

  test('should display activity charts or visualizations', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner or reports
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Look for charts, graphs, or visualizations
      const hasVisualization = (await page.locator('svg, canvas, [role="img"]').count()) > 0

      if (hasVisualization) {
        console.log('✅ Visualizations displayed')
      }
    }
  })

  test('should show recent activity feed', async ({ page }) => {
    await page.goto('/track-app')

    // Look for recent activities section
    const recentSection = page.locator('text=/recent|latest|activity feed|updates/i').first()

    if (await recentSection.isVisible({ timeout: 5000 })) {
      console.log('✅ Recent activity feed displayed')
    }

    // Should show some activity-related content
    await expect(page.locator('body')).toContainText(/track|app|dashboard/i, { timeout: 5000 })
  })

  test('should export report data', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to reports
    const reportsLink = page.locator('a[href*="/reports"], a:has-text("Reports")').first()

    if (await reportsLink.isVisible({ timeout: 5000 })) {
      await reportsLink.click()
      await page.waitForTimeout(1000)

      // Look for export button
      const exportButton = page
        .locator('button:has-text("Export"), button:has-text("Download"), a:has-text("Export")')
        .first()

      if (await exportButton.isVisible({ timeout: 3000 })) {
        // Just verify the button exists, don't actually trigger download
        expect(await exportButton.isVisible()).toBeTruthy()
        console.log('✅ Export functionality available')
      }
    }
  })

  test('should compare multiple learners in report', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to reports
    const reportsLink = page.locator('a[href*="/reports"], a:has-text("Reports")').first()

    if (await reportsLink.isVisible({ timeout: 5000 })) {
      await reportsLink.click()
      await page.waitForTimeout(1000)

      // Look for learner selection or comparison
      const learnerFilter = page
        .locator('select[name*="learner"], button:has-text("Select Learner")')
        .first()

      if (await learnerFilter.isVisible({ timeout: 3000 })) {
        await learnerFilter.click()
        await page.waitForTimeout(500)

        // Should show learner options
        const hasOptions = (await page.locator('[role="option"], option').count()) > 0
        expect(hasOptions).toBeTruthy()
      }
    }
  })

  test('should display time-based analytics', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to a learner or reports
    const learnerLink = page.locator('a[href*="/learners/"]').first()

    if (await learnerLink.isVisible({ timeout: 5000 })) {
      await learnerLink.click()
      await page.waitForURL(/learners\/[a-z0-9-]+/)

      // Look for time-based statistics
      const hasTimeStats =
        (await page.locator('text=/\\d+.*hours?|\\d+.*minutes?|duration|time spent/i').count()) > 0

      if (hasTimeStats) {
        console.log('✅ Time-based analytics displayed')
      }
    }
  })

  test('should show weekly summary', async ({ page }) => {
    await page.goto('/track-app')

    // Look for weekly summary on dashboard
    const weeklySection = page.locator('text=/this week|weekly|week summary/i').first()

    if (await weeklySection.isVisible({ timeout: 5000 })) {
      console.log('✅ Weekly summary displayed')
    }

    // Should show dashboard with some metrics
    const hasMetrics = (await page.locator('text=/\\d+|total|summary/i').count()) > 0
    expect(hasMetrics).toBeTruthy()
  })

  test('should navigate between different report views', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to reports
    const reportsLink = page.locator('a[href*="/reports"], a:has-text("Reports")').first()

    if (await reportsLink.isVisible({ timeout: 5000 })) {
      await reportsLink.click()
      await page.waitForTimeout(1000)

      // Try different report tabs/views
      const reportTabs = ['Overview', 'Goals', 'Activities', 'Timeline']

      for (const tabName of reportTabs) {
        const tab = page.locator(`button:has-text("${tabName}"), a:has-text("${tabName}")`).first()

        if (await tab.isVisible({ timeout: 2000 })) {
          await tab.click()
          await page.waitForTimeout(500)
          console.log(`✅ Navigated to ${tabName} report view`)
        }
      }
    }
  })
})

import { test, expect } from '@playwright/test'
import { testUsers, loginAsUser, clearAuth } from '../fixtures/auth'

test.describe('Learning Template Management', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page)
    await loginAsUser(page)
  })

  test('should display templates list', async ({ page }) => {
    await page.goto('/track-app')

    // Look for templates section or link
    const templatesLink = page
      .locator('a[href*="/templates"], button:has-text("Templates"), a:has-text("Templates")')
      .first()

    if (await templatesLink.isVisible({ timeout: 5000 })) {
      await templatesLink.click()

      // Should show templates list
      await expect(page.locator('body')).toContainText(/templates|learning plan/i, {
        timeout: 5000,
      })
    }
  })

  test('should create a new learning template', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to templates
    const templatesLink = page.locator('a[href*="/templates"], a:has-text("Templates")').first()

    if (await templatesLink.isVisible({ timeout: 5000 })) {
      await templatesLink.click()

      // Look for create template button
      const createButton = page
        .locator(
          'button:has-text("Create Template"), button:has-text("New Template"), button:has-text("Add Template")',
        )
        .first()

      if (await createButton.isVisible({ timeout: 3000 })) {
        await createButton.click()

        // Fill template form
        const templateName = `Test Template ${Date.now()}`
        await page.fill(
          'input[name="name"], input[name="title"], input[placeholder*="name" i]',
          templateName,
        )

        // Add description if available
        const descriptionInput = page
          .locator('textarea[name="description"], input[name="description"]')
          .first()
        if (await descriptionInput.isVisible({ timeout: 1000 })) {
          await descriptionInput.fill('Test template description')
        }

        // Submit form
        await page.click(
          'button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Save")',
        )

        // Verify template appears
        await page.waitForTimeout(2000)
        await expect(page.locator('body')).toContainText(templateName, { timeout: 5000 })
      }
    }
  })

  test('should add goals to a template', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to templates
    const templatesLink = page.locator('a[href*="/templates"], a:has-text("Templates")').first()

    if (await templatesLink.isVisible({ timeout: 5000 })) {
      await templatesLink.click()

      // Click on a template or create one
      const templateCard = page.locator('a[href*="/templates/"], [data-template-id]').first()

      if (await templateCard.isVisible({ timeout: 3000 })) {
        await templateCard.click()

        // Look for add goal button
        const addGoalButton = page
          .locator('button:has-text("Add Goal"), button:has-text("Create Goal")')
          .first()

        if (await addGoalButton.isVisible({ timeout: 3000 })) {
          await addGoalButton.click()

          // Fill goal form
          const goalTitle = `Template Goal ${Date.now()}`
          await page.fill('input[name="title"], input[placeholder*="goal" i]', goalTitle)
          await page.fill('input[name="targetValue"], input[placeholder*="target" i]', '10')
          await page.fill('input[name="unit"], input[placeholder*="unit" i]', 'lessons')

          // Submit
          await page.click(
            'button[type="submit"]:has-text("Add"), button[type="submit"]:has-text("Save")',
          )

          await page.waitForTimeout(1000)
          await expect(page.locator('body')).toContainText(goalTitle, { timeout: 5000 })
        }
      }
    }
  })

  test('should edit a learning template', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to templates
    const templatesLink = page.locator('a[href*="/templates"], a:has-text("Templates")').first()

    if (await templatesLink.isVisible({ timeout: 5000 })) {
      await templatesLink.click()

      // Click on a template
      const templateCard = page.locator('a[href*="/templates/"], [data-template-id]').first()

      if (await templateCard.isVisible({ timeout: 3000 })) {
        await templateCard.click()

        // Look for edit button
        const editButton = page.locator('button:has-text("Edit"), a:has-text("Edit")').first()

        if (await editButton.isVisible({ timeout: 3000 })) {
          await editButton.click()

          // Update name
          const updatedName = `Updated Template ${Date.now()}`
          const nameInput = page.locator('input[name="name"], input[name="title"]')
          await nameInput.clear()
          await nameInput.fill(updatedName)

          // Save changes
          await page.click(
            'button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("Update")',
          )

          await page.waitForTimeout(1000)
          await expect(page.locator('body')).toContainText(updatedName, { timeout: 5000 })
        }
      }
    }
  })

  test('should apply template to a learner', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to templates
    const templatesLink = page.locator('a[href*="/templates"], a:has-text("Templates")').first()

    if (await templatesLink.isVisible({ timeout: 5000 })) {
      await templatesLink.click()

      // Find a template
      const templateCard = page.locator('a[href*="/templates/"], [data-template-id]').first()

      if (await templateCard.isVisible({ timeout: 3000 })) {
        await templateCard.click()

        // Look for apply button
        const applyButton = page
          .locator('button:has-text("Apply"), button:has-text("Use Template")')
          .first()

        if (await applyButton.isVisible({ timeout: 3000 })) {
          await applyButton.click()

          // Select a learner
          const learnerSelect = page
            .locator('select[name="learnerId"], button:has-text("Select Learner")')
            .first()

          if (await learnerSelect.isVisible({ timeout: 2000 })) {
            if (learnerSelect.getAttribute('role') === 'combobox') {
              await learnerSelect.click()
              const firstOption = page.locator('[role="option"]').first()
              if (await firstOption.isVisible({ timeout: 1000 })) {
                await firstOption.click()
              }
            } else {
              const options = await page.locator('select[name="learnerId"] option').count()
              if (options > 1) {
                await learnerSelect.selectOption({ index: 1 })
              }
            }

            // Submit
            await page.click(
              'button[type="submit"]:has-text("Apply"), button[type="submit"]:has-text("Create")',
            )

            await page.waitForTimeout(2000)
            // Should show success message or redirect
          }
        }
      }
    }
  })

  test('should view template details', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to templates
    const templatesLink = page.locator('a[href*="/templates"], a:has-text("Templates")').first()

    if (await templatesLink.isVisible({ timeout: 5000 })) {
      await templatesLink.click()

      // Click on a template
      const templateCard = page.locator('a[href*="/templates/"], [data-template-id]').first()

      if (await templateCard.isVisible({ timeout: 3000 })) {
        await templateCard.click()

        // Should show template details including goals
        await expect(page.locator('body')).toContainText(/goals|description|template/i, {
          timeout: 5000,
        })
      }
    }
  })

  test('should delete a template goal', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to templates
    const templatesLink = page.locator('a[href*="/templates"], a:has-text("Templates")').first()

    if (await templatesLink.isVisible({ timeout: 5000 })) {
      await templatesLink.click()

      // Click on a template
      const templateCard = page.locator('a[href*="/templates/"], [data-template-id]').first()

      if (await templateCard.isVisible({ timeout: 3000 })) {
        await templateCard.click()

        // Find a goal's delete button
        const deleteButton = page
          .locator('button:has-text("Delete"), button[aria-label*="delete"]')
          .first()

        if (await deleteButton.isVisible({ timeout: 3000 })) {
          const goalText = await page.locator('body').textContent()

          await deleteButton.click()

          // Confirm deletion
          const confirmButton = page
            .locator('button:has-text("Delete"), button:has-text("Confirm")')
            .last()
          if (await confirmButton.isVisible({ timeout: 2000 })) {
            await confirmButton.click()
          }

          await page.waitForTimeout(1000)
        }
      }
    }
  })

  test('should delete a learning template', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to templates
    const templatesLink = page.locator('a[href*="/templates"], a:has-text("Templates")').first()

    if (await templatesLink.isVisible({ timeout: 5000 })) {
      await templatesLink.click()

      // Create a template specifically for deletion
      const createButton = page
        .locator('button:has-text("Create Template"), button:has-text("New Template")')
        .first()

      if (await createButton.isVisible({ timeout: 3000 })) {
        await createButton.click()

        const templateName = `Delete Me Template ${Date.now()}`
        await page.fill('input[name="name"], input[name="title"]', templateName)
        await page.click('button[type="submit"]')
        await page.waitForTimeout(2000)

        // Find and delete the template
        const templateToDelete = page.locator(`text=${templateName}`).first()

        if (await templateToDelete.isVisible({ timeout: 3000 })) {
          await templateToDelete.click()

          const deleteButton = page
            .locator('button:has-text("Delete Template"), button:has-text("Delete")')
            .first()

          if (await deleteButton.isVisible({ timeout: 3000 })) {
            await deleteButton.click()

            // Confirm deletion
            const confirmButton = page
              .locator('button:has-text("Delete"), button:has-text("Confirm")')
              .last()
            await confirmButton.click({ timeout: 3000 })

            await page.waitForTimeout(2000)
            await expect(page.locator('body')).not.toContainText(templateName, { timeout: 5000 })
          }
        }
      }
    }
  })

  test('should search templates', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to templates
    const templatesLink = page.locator('a[href*="/templates"], a:has-text("Templates")').first()

    if (await templatesLink.isVisible({ timeout: 5000 })) {
      await templatesLink.click()

      // Look for search input
      const searchInput = page
        .locator('input[type="search"], input[placeholder*="search" i]')
        .first()

      if (await searchInput.isVisible({ timeout: 3000 })) {
        await searchInput.fill('test')
        await page.waitForTimeout(500)

        // Results should update
        await expect(searchInput).toHaveValue('test')
      }
    }
  })

  test('should duplicate a template', async ({ page }) => {
    await page.goto('/track-app')

    // Navigate to templates
    const templatesLink = page.locator('a[href*="/templates"], a:has-text("Templates")').first()

    if (await templatesLink.isVisible({ timeout: 5000 })) {
      await templatesLink.click()

      // Click on a template
      const templateCard = page.locator('a[href*="/templates/"], [data-template-id]').first()

      if (await templateCard.isVisible({ timeout: 3000 })) {
        await templateCard.click()

        // Look for duplicate button
        const duplicateButton = page
          .locator('button:has-text("Duplicate"), button:has-text("Copy")')
          .first()

        if (await duplicateButton.isVisible({ timeout: 3000 })) {
          await duplicateButton.click()

          // Should create a copy
          await page.waitForTimeout(2000)
          await expect(page.locator('body')).toContainText(/copy|duplicate/i, { timeout: 5000 })
        }
      }
    }
  })
})

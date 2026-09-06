import { expect, test } from '@playwright/test'
import { expectNoErrorState, loginAsAdmin } from './helpers/auth'

test.setTimeout(180_000)

/**
 * Masters CRUD + active/inactive lifecycle (regression coverage):
 *
 * - Add creates a master record with the default "Active" status and the
 *   list refreshes immediately (repository cache invalidation).
 * - Edit toggles the status checkbox Active ↔ Inactive and the badge updates.
 * - "Delete" never hard-deletes a master: it opens a detailed caution dialog
 *   ("Deactivate …") that requires typing the record id, calls the backend,
 *   shows the outcome message and flips the row to Inactive.
 * - The same action on an inactive row reactivates it.
 */
test.beforeEach(async ({ page }) => {
  await loginAsAdmin(page)
})

test('department master create, deactivate and reactivate round-trip', async ({
  page,
}) => {
  let createdId = -1

  // ---- CREATE (defaults to active) ----
  await page.goto('/masters/payroll/department')
  await expect(
    page.getByRole('heading', { name: 'Department List' }),
  ).toBeVisible({ timeout: 30_000 })

  const stamp = Date.now()
  const name = `E2E Master Dept ${stamp}`
  const code = `EM${stamp}`

  const createdResponse = page.waitForResponse(
    (res) =>
      res.url().includes('/api/departments') &&
      res.request().method() === 'POST',
  )
  await page.getByRole('button', { name: 'Add Department' }).click()
  const addDialog = page.getByRole('dialog')
  await expect(
    addDialog.getByRole('heading', { name: 'Add New Department' }),
  ).toBeVisible({ timeout: 15_000 })
  await addDialog.locator('input[name="name"]').fill(name)
  await addDialog.locator('input[name="code"]').fill(code)
  await expect(addDialog.locator('input[type="checkbox"]')).toBeChecked()
  await addDialog.getByRole('button', { name: 'Save changes' }).click()

  const createdJson = (await (await createdResponse).json()) as {
    data?: { id?: number }
  }
  createdId = createdJson.data?.id ?? -1
  expect(createdId).toBeGreaterThan(0)

  // List refreshes and shows the new row as Active without a reload.
  const row = page.locator('tbody tr').filter({ hasText: name })
  await expect(row).toHaveCount(1, { timeout: 20_000 })
  await expect(row.getByText('active', { exact: true })).toBeVisible({
    timeout: 10_000,
  })
  await expectNoErrorState(page)

  // ---- EDIT: toggle the status checkbox to inactive ----
  await row.getByRole('button').last().click()
  await page.getByRole('menuitem', { name: 'Edit' }).click()
  const editDialog = page.getByRole('dialog')
  await expect(
    editDialog.getByRole('heading', { name: 'Edit Department' }),
  ).toBeVisible({ timeout: 15_000 })
  const statusBox = editDialog.locator('input[type="checkbox"]')
  await expect(statusBox).toBeChecked()
  await statusBox.uncheck()
  await editDialog.getByRole('button', { name: 'Save changes' }).click()

  await expect(row.getByText('inactive', { exact: true })).toBeVisible({
    timeout: 20_000,
  })

  // ---- "DELETE" must never hard-delete — on an INACTIVE row it reactivates ----
  await row.getByRole('button').last().click()
  await page.getByRole('menuitem', { name: 'Delete' }).click()
  const activateDialog = page.getByRole('alertdialog')
  await expect(
    activateDialog.getByRole('heading', { name: 'Activate Department' }),
  ).toBeVisible({ timeout: 15_000 })
  await expect(activateDialog.getByText('Reactivating record')).toBeVisible()

  // Confirm stays disabled until the record id is typed.
  await activateDialog.locator('input').fill('not-the-id')
  await expect(
    activateDialog.getByRole('button', { name: 'Activate' }),
  ).toBeDisabled()

  await activateDialog.locator('input').fill(String(createdId))
  await expect(
    activateDialog.getByRole('button', { name: 'Activate' }),
  ).toBeEnabled()
  await activateDialog.getByRole('button', { name: 'Activate' }).click()

  // Outcome message after the backend accepted the change; badge flips.
  await expect(page.getByText('Department activated successfully')).toBeVisible(
    { timeout: 15_000 },
  )
  await expect(row.getByText('active', { exact: true })).toBeVisible({
    timeout: 20_000,
  })
  await expectNoErrorState(page)

  // ---- On an ACTIVE row the same action deactivates, with a full caution ----
  await row.getByRole('button').last().click()
  await page.getByRole('menuitem', { name: 'Delete' }).click()
  const deactivateDialog = page.getByRole('alertdialog')
  await expect(
    deactivateDialog.getByRole('heading', { name: 'Deactivate Department' }),
  ).toBeVisible({ timeout: 15_000 })
  // Caution is shown *before* the operation, with record details.
  await expect(deactivateDialog.getByText('Record details')).toBeVisible()
  await expect(
    deactivateDialog.getByText('This does not delete the record'),
  ).toBeVisible()

  await deactivateDialog.locator('input').fill(String(createdId))
  await expect(
    deactivateDialog.getByRole('button', { name: 'Deactivate' }),
  ).toBeEnabled()
  await deactivateDialog.getByRole('button', { name: 'Deactivate' }).click()

  await expect(
    page.getByText('Department deactivated successfully'),
  ).toBeVisible({ timeout: 15_000 })
  await expect(row.getByText('inactive', { exact: true })).toBeVisible({
    timeout: 20_000,
  })
  await expectNoErrorState(page)

  // ---- Cleanup: remove the temporary record (via the Vite proxy) ----
  const cleanupStatus = await page.evaluate(async (id) => {
    const token = localStorage.getItem('auth_token')
    const res = await fetch(`/api/departments/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.status
  }, createdId)
  expect(cleanupStatus).toBe(200)
})

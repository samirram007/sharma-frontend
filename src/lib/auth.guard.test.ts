import { describe, it, expect } from 'vitest'
import { requirePermission } from '@/lib/auth'

const makeContext = (permissions: string[]) =>
  ({ auth: { permissions } }) as never

describe('requirePermission route guard', () => {
  it('redirects to /forbidden when the permission is missing', async () => {
    const guard = requirePermission('RECEIPT_NOTE_MENU_VIEW')
    await expect(
      guard({ context: makeContext(['DELIVERY_NOTE_MENU_VIEW']) }),
    ).rejects.toMatchObject({ options: { to: '/forbidden' } })
  })

  it('redirects when the user has no permissions at all', async () => {
    const guard = requirePermission('FREIGHT_MENU_VIEW')
    await expect(
      guard({ context: makeContext([]) }),
    ).rejects.toMatchObject({ options: { to: '/forbidden' } })
  })

  it('passes when the permission is present', async () => {
    const guard = requirePermission('DELIVERY_NOTE_MENU_VIEW')
    await expect(
      guard({ context: makeContext(['DELIVERY_NOTE_MENU_VIEW']) }),
    ).resolves.toBeUndefined()
  })

  it('passes when the user has several permissions including the required one', async () => {
    const guard = requirePermission('CONVERSION_MENU_VIEW')
    await expect(
      guard({
        context: makeContext([
          'GENERAL_MENU_VIEW',
          'DASHBOARD_MENU_VIEW',
          'TRANSACTION_MENU_VIEW',
          'CONVERSION_MENU_VIEW',
          'REPORTS_MENU_VIEW',
        ]),
      }),
    ).resolves.toBeUndefined()
  })
})

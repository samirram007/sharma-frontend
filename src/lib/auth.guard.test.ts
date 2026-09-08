import { describe, it, expect, beforeEach } from 'vitest'
import { requirePermission } from '@/lib/auth'
import { getForbiddenRoute, clearForbiddenRoute } from '@/lib/forbidden-details'

const makeContext = (permissions: string[]) =>
  ({ auth: { permissions } }) as never

describe('requirePermission route guard', () => {
  beforeEach(() => {
    clearForbiddenRoute()
  })

  it('blocks in place (no redirect) when the permission is missing', async () => {
    const guard = requirePermission('RECEIPT_NOTE_MENU_VIEW')
    await expect(
      guard({ context: makeContext(['DELIVERY_NOTE_MENU_VIEW']) }),
    ).resolves.toBeUndefined()
    expect(getForbiddenRoute()).toMatchObject({
      attemptedPath: undefined,
      permissionCodes: ['RECEIPT_NOTE_MENU_VIEW'],
    })
  })

  it('blocks when the user has no permissions at all', async () => {
    const guard = requirePermission('FREIGHT_MENU_VIEW')
    await expect(guard({ context: makeContext([]) })).resolves.toBeUndefined()
    expect(getForbiddenRoute()).toMatchObject({
      permissionCodes: ['FREIGHT_MENU_VIEW'],
    })
  })

  it('does not block when running for a link preload', async () => {
    const guard = requirePermission('FREIGHT_MENU_VIEW')
    await expect(
      guard({ context: makeContext([]), cause: 'preload' }),
    ).resolves.toBeUndefined()
    expect(getForbiddenRoute()).toBeNull()
  })

  it('passes when the permission is present', async () => {
    const guard = requirePermission('DELIVERY_NOTE_MENU_VIEW')
    await expect(
      guard({ context: makeContext(['DELIVERY_NOTE_MENU_VIEW']) }),
    ).resolves.toBeUndefined()
    expect(getForbiddenRoute()).toBeNull()
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
    expect(getForbiddenRoute()).toBeNull()
  })
})

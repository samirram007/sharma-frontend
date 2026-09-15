import { describe, expect, it } from 'vitest'
import {
  getFiscalYearValidationErrors,
  getReportingPeriodValidationErrors,
} from './period-validation'
import type { UserFiscalYear } from '@/features/modules/user_fiscal_year/data/schema'
import type { PeriodType } from '@/features/auth/contexts/AuthContext'

const fy = (over: Partial<UserFiscalYear> = {}): UserFiscalYear =>
  ({
    id: 1,
    userId: 1,
    fiscalYearId: 1,
    startDate: new Date('2026-04-01T00:00:00'),
    endDate: new Date('2027-03-31T00:00:00'),
    currentDate: new Date('2026-05-17T00:00:00'),
    // The helper reads the boundaries off the nested fiscalYear (string dates
    // per fiscalYearSchema), mirroring what the API returns.
    fiscalYear: {
      name: 'FY 2026-27',
      startDate: '2026-04-01',
      endDate: '2027-03-31',
      status: 'active',
      companyId: 1,
    },
    ...over,
  }) as UserFiscalYear

const period = (over: Partial<PeriodType> = {}): PeriodType => ({
  startDate: new Date('2026-05-01T00:00:00'),
  endDate: new Date('2026-05-17T00:00:00'),
  ...over,
})

describe('getFiscalYearValidationErrors', () => {
  it('accepts a voucher dated on the last day of the fiscal period despite time-of-day', () => {
    // Regression: voucherDate defaults to new Date() (with time); a raw >
    // against a midnight end date rejected same-day vouchers.
    expect(
      getFiscalYearValidationErrors({
        voucherDate: new Date('2027-03-31T18:45:00'),
        userFiscalYear: fy(),
      }),
    ).toEqual([])
  })

  it('accepts a voucher dated on the first day of the fiscal period', () => {
    expect(
      getFiscalYearValidationErrors({
        voucherDate: new Date('2026-04-01T08:00:00'),
        userFiscalYear: fy(),
      }),
    ).toEqual([])
  })

  it('rejects a voucher date before and after the fiscal period', () => {
    const errorsBefore = getFiscalYearValidationErrors({
      voucherDate: new Date('2026-03-31T10:00:00'),
      userFiscalYear: fy(),
    })
    expect(errorsBefore).toHaveLength(1)
    expect(errorsBefore[0]).toMatchInlineSnapshot(
      `"Voucher date (${new Date('2026-03-31T10:00:00').toLocaleDateString()}) must be within the fiscal year period (${new Date('2026-04-01T00:00:00').toLocaleDateString()} - ${new Date('2027-03-31T00:00:00').toLocaleDateString()})."`,
    )

    const errorsAfter = getFiscalYearValidationErrors({
      voucherDate: new Date('2027-04-01T10:00:00'),
      userFiscalYear: fy(),
    })
    expect(errorsAfter).toHaveLength(1)
    expect(errorsAfter[0]).toContain('must be within the fiscal year period')
  })

  it('flags a missing fiscal year assignment', () => {
    expect(
      getFiscalYearValidationErrors({
        voucherDate: new Date('2026-05-17T10:00:00'),
        userFiscalYear: null,
      }),
    ).toEqual([
      'No active fiscal year assigned. Please assign one in settings.',
    ])
  })

  it('flags an inactive fiscal year', () => {
    // Date inside the closed FY so only the status error fires.
    const errors = getFiscalYearValidationErrors({
      voucherDate: new Date('2025-06-17T10:00:00'),
      userFiscalYear: fy({
        fiscalYear: {
          name: 'FY 2025-26',
          startDate: '2025-04-01',
          endDate: '2026-03-31',
          status: 'closed',
          companyId: 1,
        },
      }),
    })
    expect(errors).toEqual([
      'The assigned fiscal year (FY 2025-26) is currently closed. It must be active to save vouchers.',
    ])
  })

  it('skips the date check when no voucher date is set', () => {
    expect(getFiscalYearValidationErrors({ userFiscalYear: fy() })).toEqual([])
  })

  it('accepts a string voucher date', () => {
    expect(
      getFiscalYearValidationErrors({
        voucherDate: '2026-05-17T14:30:00',
        userFiscalYear: fy(),
      }),
    ).toEqual([])
  })
})

describe('getReportingPeriodValidationErrors', () => {
  it('accepts a voucher dated on the last day of the reporting period despite time-of-day', () => {
    expect(
      getReportingPeriodValidationErrors({
        voucherDate: new Date('2026-05-17T23:15:00'),
        period: period(),
      }),
    ).toEqual([])
  })

  it('accepts a voucher dated within the reporting period', () => {
    expect(
      getReportingPeriodValidationErrors({
        voucherDate: new Date('2026-05-10T09:00:00'),
        period: period(),
      }),
    ).toEqual([])
  })

  it('rejects a voucher date outside the reporting period', () => {
    const errors = getReportingPeriodValidationErrors({
      voucherDate: new Date('2026-05-20T10:00:00'),
      period: period(),
    })
    expect(errors).toHaveLength(1)
    expect(errors[0]).toMatchInlineSnapshot(
      `"Voucher date (${new Date('2026-05-20T10:00:00').toLocaleDateString()}) must be within the reporting period (${new Date('2026-05-01T00:00:00').toLocaleDateString()} - ${new Date('2026-05-17T00:00:00').toLocaleDateString()}). Adjust the reporting period from the header to include this date."`,
    )
  })

  it('returns no errors when no period is set', () => {
    expect(
      getReportingPeriodValidationErrors({
        voucherDate: new Date('2026-05-20T10:00:00'),
        period: null,
      }),
    ).toEqual([])
  })

  it('returns no errors when the period boundaries are null', () => {
    expect(
      getReportingPeriodValidationErrors({
        voucherDate: new Date('2026-05-20T10:00:00'),
        period: period({ startDate: null, endDate: null }),
      }),
    ).toEqual([])
  })

  it('returns no errors when no voucher date is set', () => {
    expect(getReportingPeriodValidationErrors({ period: period() })).toEqual([])
  })
})

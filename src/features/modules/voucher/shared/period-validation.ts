import { startOfDay } from '@/utils/date'
import type { UserFiscalYear } from '@/features/modules/user_fiscal_year/data/schema'
import type { PeriodType } from '@/features/auth/contexts/AuthContext'

/**
 * Shared period validations used by every POS save-dialog (delivery note,
 * receipt note, transfer, manufacturing/conversion journal, opening stock).
 *
 * All comparisons are DATE-ONLY: `voucherDate` carries a time-of-day (it
 * defaults to `new Date()`) while fiscal-year / period boundaries arrive as
 * midnight. A raw `>` would wrongly reject a voucher dated on the last day
 * of the period (e.g. date 17/5 vs period ending 17/5 00:00), so every date
 * is normalised through `startOfDay` before comparing.
 */

type VoucherPeriodArgs = {
  voucherDate?: Date | string | null
  userFiscalYear?: UserFiscalYear | null
  period?: PeriodType | null
}

/**
 * Fiscal-year gate every POS voucher must pass:
 * - a fiscal year must be assigned
 * - it must be active
 * - the voucher date must fall within the fiscal year (date-only)
 *
 * @returns Human-readable error strings; empty array = valid.
 */
export function getFiscalYearValidationErrors({
  voucherDate,
  userFiscalYear,
}: Pick<VoucherPeriodArgs, 'voucherDate' | 'userFiscalYear'>): string[] {
  const errors: string[] = []

  if (!userFiscalYear) {
    errors.push(
      'No active fiscal year assigned. Please assign one in settings.',
    )
    return errors
  }

  if (userFiscalYear.fiscalYear?.status !== 'active') {
    errors.push(
      `The assigned fiscal year (${userFiscalYear.fiscalYear?.name}) is currently ${userFiscalYear.fiscalYear?.status}. It must be active to save vouchers.`,
    )
  }

  if (userFiscalYear.fiscalYear && voucherDate) {
    const vDate = startOfDay(new Date(voucherDate))
    const startDate = startOfDay(new Date(userFiscalYear.fiscalYear.startDate))
    const endDate = startOfDay(new Date(userFiscalYear.fiscalYear.endDate))

    if (vDate < startDate || vDate > endDate) {
      errors.push(
        `Voucher date (${vDate.toLocaleDateString()}) must be within the fiscal year period (${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}).`,
      )
    }
  }

  return errors
}

/**
 * Reporting-period gate (delivery notes only): the Day Book and Freight
 * delivery-note lists are scoped to the global reporting period set from the
 * header, so a note dated outside it (but inside the fiscal year) would be
 * saved successfully yet never appear in any list. The backend enforces the
 * same rule on store/update.
 *
 * @returns Human-readable error strings; empty array = valid.
 */
export function getReportingPeriodValidationErrors({
  voucherDate,
  period,
}: Pick<VoucherPeriodArgs, 'voucherDate' | 'period'>): string[] {
  if (!period?.startDate || !period?.endDate || !voucherDate) return []

  const vDate = startOfDay(new Date(voucherDate))
  const periodStart = startOfDay(new Date(period.startDate))
  const periodEnd = startOfDay(new Date(period.endDate))

  if (vDate < periodStart || vDate > periodEnd) {
    return [
      `Voucher date (${vDate.toLocaleDateString()}) must be within the reporting period (${periodStart.toLocaleDateString()} - ${periodEnd.toLocaleDateString()}). Adjust the reporting period from the header to include this date.`,
    ]
  }
  return []
}

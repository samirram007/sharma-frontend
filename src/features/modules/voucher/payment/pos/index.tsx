import { SelectDropdown } from '@/components/select-dropdown'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { accountLedgerQueryOptions } from '@/features/modules/account_ledger/data/queryOptions'
import type { AccountLedger } from '@/features/modules/account_ledger/data/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import {
  useFieldArray,
  useForm,
  type Resolver,
  type UseFormReturn,
} from 'react-hook-form'
import paymentDefaultValues from '../data/data'
import { usePaymentVoucherMutation } from '../data/queryOptions'
import {
  PAYMENT_VOUCHER_TYPE_ID,
  paymentFormSchema,
  type PaymentVoucher,
  type PaymentVoucherForm,
} from '../data/schema'
import type { PaymentProps } from './contracts'
import {
  buildPaymentVoucherEntries,
  calculateTotalDebit,
} from './payment-payload'

const formatCurrentBalance = (value: number | null | undefined) => {
  const amount = Number(value || 0)
  const side = amount >= 0 ? 'Dr' : 'Cr'
  return `Cur Bal: ${Math.abs(amount).toFixed(2)} ${side}`
}

const getLedgerCurrentBalance = (ledger: AccountLedger | undefined) => {
  if (!ledger) return 0
  const maybeBalance = (ledger as unknown as { currentBalance?: number | null })
    .currentBalance
  return Number(maybeBalance || 0)
}

const isPersonalLedger = (ledger: AccountLedger) => {
  const label = [
    ledger.name,
    ledger.code,
    ledger.accountGroup?.name,
    ledger.accountGroup?.code,
    ledger.accountGroup?.accountNature?.name,
    ledger.accountGroup?.accountNature?.code,
    ledger.ledgerableType,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return label.includes('personal')
}

const buildEditValues = (row: PaymentVoucher): PaymentVoucherForm => ({
  voucherNo: row.voucherNo ?? 'new',
  voucherDate: row.voucherDate ? new Date(row.voucherDate) : new Date(),
  referenceNo: row.referenceNo ?? '',
  referenceDate: row.referenceDate ? new Date(row.referenceDate) : null,
  voucherTypeId: PAYMENT_VOUCHER_TYPE_ID,
  voucherType: row.voucherType ?? null,
  module: row.module ?? 'payment',
  stockJournalId: row.stockJournalId ?? null,
  stockJournal: row.stockJournal ?? null,
  voucherEntries:
    row.voucherEntries?.length > 0
      ? row.voucherEntries.map((entry, index) => ({
          id: entry.id ?? null,
          voucherId: row.id ?? null,
          entryOrder: entry.entryOrder ?? index + 1,
          accountLedgerId: Number(entry.accountLedgerId ?? 0),
          debit: Number(entry.debit ?? 0),
          credit: Number(entry.credit ?? 0),
          remarks: entry.remarks ?? '',
        }))
      : paymentDefaultValues.voucherEntries,
  party: row.party ?? null,
  partyLedger: row.partyLedger ?? null,
  transactionLedger: row.transactionLedger ?? null,
  voucherDispatchDetail: row.voucherDispatchDetail ?? null,
  amount: Number(row.amount ?? 0),
  remarks: row.remarks ?? '',
  isEdit: true,
})

const Pos = ({ currentRow }: PaymentProps) => {
  const isEdit = Boolean(currentRow?.id)
  const { data: accountLedgerResponse, isPending: isAccountLedgersLoading } =
    useQuery(accountLedgerQueryOptions())
  const { mutate: savePayment, isPending: isSaving } =
    usePaymentVoucherMutation()

  const accountLedgers: AccountLedger[] = useMemo(() => {
    if (Array.isArray(accountLedgerResponse)) {
      return accountLedgerResponse as AccountLedger[]
    }

    if (
      accountLedgerResponse &&
      typeof accountLedgerResponse === 'object' &&
      Array.isArray((accountLedgerResponse as { data?: unknown }).data)
    ) {
      return (accountLedgerResponse as { data: AccountLedger[] }).data
    }

    return []
  }, [accountLedgerResponse])

  const personalLedgers = useMemo(() => {
    const filtered = accountLedgers.filter(isPersonalLedger)
    return filtered.length > 0 ? filtered : accountLedgers
  }, [accountLedgers])

  const accountLedgerItems = useMemo(
    () =>
      personalLedgers.map((ledger) => ({
        label: ledger.name,
        value: String(ledger.id),
      })),
    [personalLedgers],
  )

  const initialCreditLedgerId = useMemo(() => {
    if (currentRow?.transactionLedger?.id) {
      return String(currentRow.transactionLedger.id)
    }

    const creditEntry = currentRow?.voucherEntries?.find(
      (entry) => Number(entry?.credit || 0) > 0,
    )
    return creditEntry?.accountLedgerId
      ? String(creditEntry.accountLedgerId)
      : ''
  }, [currentRow])

  const [creditLedgerId, setCreditLedgerId] = useState<string>(
    initialCreditLedgerId,
  )

  const debitLineLedgerItems = useMemo(() => {
    if (!creditLedgerId) return accountLedgerItems
    return accountLedgerItems.filter((item) => item.value !== creditLedgerId)
  }, [accountLedgerItems, creditLedgerId])

  const selectedHeaderLedger = useMemo(
    () =>
      personalLedgers.find((ledger) => String(ledger.id) === creditLedgerId),
    [personalLedgers, creditLedgerId],
  )

  const mainForm = useForm<PaymentVoucherForm>({
    resolver: zodResolver(paymentFormSchema) as Resolver<PaymentVoucherForm>,
    defaultValues:
      isEdit && currentRow
        ? buildEditValues(currentRow)
        : { ...paymentDefaultValues, isEdit: false },
  })

  const { fields, append, remove } = useFieldArray({
    control: mainForm.control,
    name: 'voucherEntries',
  })

  const watchedEntries = mainForm.watch('voucherEntries')
  const totalDebit = useMemo(
    () => calculateTotalDebit(watchedEntries),
    [watchedEntries],
  )

  const hasDebitEntries = useMemo(
    () =>
      watchedEntries.some(
        (entry) =>
          Number(entry?.accountLedgerId || 0) > 0 &&
          Number(entry?.debit || 0) > 0,
      ),
    [watchedEntries],
  )

  const isBalanced =
    Boolean(creditLedgerId) && totalDebit > 0 && hasDebitEntries
  const hasHeaderConflict = useMemo(
    () =>
      Boolean(creditLedgerId) &&
      watchedEntries.some(
        (entry) =>
          Number(entry?.accountLedgerId || 0) > 0 &&
          String(entry.accountLedgerId) === creditLedgerId,
      ),
    [watchedEntries, creditLedgerId],
  )

  const canSubmit = isBalanced && !hasHeaderConflict

  const handleAmountChange = (index: number, value: string) => {
    const amount = Number(value || 0)
    mainForm.setValue(`voucherEntries.${index}.debit`, amount, {
      shouldDirty: true,
    })
    mainForm.setValue(`voucherEntries.${index}.credit`, 0, {
      shouldDirty: true,
    })
  }

  const onSubmit = (values: PaymentVoucherForm) => {
    const selectedCreditLedger = personalLedgers.find(
      (ledger) => String(ledger.id) === creditLedgerId,
    )
    if (!selectedCreditLedger) return

    const hasConflict = values.voucherEntries.some(
      (entry) =>
        Number(entry?.accountLedgerId || 0) > 0 &&
        String(entry.accountLedgerId) === creditLedgerId,
    )
    if (hasConflict) return

    const voucherEntries = buildPaymentVoucherEntries({
      entries: values.voucherEntries,
      selectedCreditLedger,
      currentVoucherId: currentRow?.id ?? null,
      totalDebit,
    })

    savePayment(
      {
        ...values,
        id: currentRow?.id ?? undefined,
        voucherDate: values.voucherDate,
        voucherNo: values.voucherNo || null,
        voucherTypeId: PAYMENT_VOUCHER_TYPE_ID,
        amount: totalDebit,
        remarks: values.remarks || null,
        voucherEntries,
        transactionLedger: {
          id: selectedCreditLedger.id,
          name: selectedCreditLedger.name,
          code: selectedCreditLedger.code,
          ledgerableType: selectedCreditLedger.ledgerableType ?? null,
          ledgerableId: selectedCreditLedger.ledgerableId ?? null,
          currentBalance: 0,
        },
      },
      {
        onSuccess: () => {
          if (!isEdit) {
            mainForm.reset({ ...paymentDefaultValues, isEdit: false })
            setCreditLedgerId('')
          }
        },
      },
    )
  }

  return (
    <div className="voucher-entry h-[calc(100dvh-170px)] w-full overflow-hidden border border-slate-300 bg-white text-[13px] text-slate-900">
      <Form {...mainForm}>
        <form
          onSubmit={mainForm.handleSubmit(onSubmit)}
          className="grid h-full grid-rows-[auto_1fr_auto]"
        >
          <div className="border-b border-slate-300 px-3 py-2">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-800">
                  Payment Voucher
                </h2>
                <p className="text-xs text-slate-500">
                  Header credit account with debit line entries
                </p>
              </div>
              <div
                className={`rounded px-2 py-1 text-xs font-semibold ${
                  isBalanced
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {isBalanced ? 'Balanced' : 'Not Balanced'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="grid gap-2 lg:grid-cols-[180px_180px_minmax(280px,1fr)_auto_auto]">
                <div>
                  <div className="mb-1 text-[11px] font-semibold uppercase text-slate-500">
                    Voucher No
                  </div>
                  <input
                    {...mainForm.register('voucherNo')}
                    className="h-9 w-full rounded border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400"
                    placeholder="Voucher no"
                  />
                </div>
                <div>
                  <div className="mb-1 text-[11px] font-semibold uppercase text-slate-500">
                    Voucher Date
                  </div>
                  <DateBox form={mainForm} name="voucherDate" />
                </div>
                <div />
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 self-end px-4"
                  onClick={() =>
                    append({
                      id: null,
                      voucherId: currentRow?.id ?? null,
                      entryOrder: fields.length + 1,
                      accountLedgerId: 0,
                      debit: 0,
                      credit: 0,
                      remarks: '',
                    })
                  }
                >
                  Add Line
                </Button>
                <Button
                  type="submit"
                  className="h-9 self-end px-4"
                  disabled={!canSubmit || isSaving}
                >
                  {isSaving
                    ? 'Saving...'
                    : isEdit
                      ? 'Update Voucher'
                      : 'Save Voucher'}
                </Button>
              </div>

              <div className="grid gap-2 lg:grid-cols-[180px_180px_minmax(280px,1fr)_auto_auto]">
                <div className="max-w-md lg:col-start-1 lg:col-span-2">
                  <div className="mb-1 text-[11px] font-semibold uppercase text-slate-500">
                    Header Credit Account
                  </div>
                  <SelectDropdown
                    defaultValue={creditLedgerId}
                    onValueChange={(value) => {
                      setCreditLedgerId(value)
                      const rows = mainForm.getValues('voucherEntries')
                      rows.forEach((row, rowIndex) => {
                        if (String(row?.accountLedgerId || '') === value) {
                          mainForm.setValue(
                            `voucherEntries.${rowIndex}.accountLedgerId`,
                            0,
                            { shouldDirty: true },
                          )
                        }
                      })
                    }}
                    items={accountLedgerItems}
                    isPending={isAccountLedgersLoading}
                    placeholder="Select personal credit account"
                    sheetTitle="Select Personal Credit Account"
                    className="h-9 max-w-sm"
                  />
                  <div className="mt-1 text-xs text-slate-500">
                    {formatCurrentBalance(
                      getLedgerCurrentBalance(selectedHeaderLedger),
                    )}
                  </div>
                  {hasHeaderConflict ? (
                    <div className="mt-1 text-xs font-semibold text-red-600">
                      Header credit account cannot be used in debit rows.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="min-h-0 overflow-auto">
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
                  <th className="w-24 px-2 py-2 text-center font-semibold">
                    Type
                  </th>
                  <th className="px-3 py-2 text-left font-semibold">
                    Particulars
                  </th>
                  <th className="w-44 px-2 py-2 text-right font-semibold">
                    Amount
                  </th>
                  <th className="w-28 px-2 py-2 text-center font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => {
                  const entry = watchedEntries[index]
                  const amount = Number(entry?.debit || 0)
                  const selectedLineLedger = personalLedgers.find(
                    (ledger) =>
                      String(ledger.id) ===
                      String(entry?.accountLedgerId || ''),
                  )

                  return (
                    <tr key={field.id} className="border-b border-slate-200">
                      <td className="px-2 py-2 text-center">
                        <span className="inline-flex rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                          Debit
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div>
                          <SelectDropdown
                            defaultValue={
                              entry?.accountLedgerId
                                ? String(entry.accountLedgerId)
                                : ''
                            }
                            onValueChange={(value) =>
                              mainForm.setValue(
                                `voucherEntries.${index}.accountLedgerId`,
                                Number(value),
                                { shouldDirty: true },
                              )
                            }
                            items={debitLineLedgerItems}
                            isPending={isAccountLedgersLoading}
                            placeholder="Select personal debit account"
                            sheetTitle="Select Personal Debit Account"
                            className="h-9 max-w-md"
                          />
                          <div className="mt-1 text-xs text-slate-500">
                            {formatCurrentBalance(
                              getLedgerCurrentBalance(selectedLineLedger),
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="ml-auto h-9 w-36 rounded border border-slate-300 bg-white px-3 text-right text-sm text-slate-900 outline-none focus:border-slate-400"
                          value={amount}
                          onChange={(event) =>
                            handleAmountChange(index, event.target.value)
                          }
                        />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-8 px-2 text-xs text-red-600 hover:text-red-700"
                          onClick={() => remove(index)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-2 border-t border-slate-300 px-3 py-2 sm:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-1 text-sm font-semibold text-slate-700">
                Narration
              </div>
              <Textarea
                value={mainForm.watch('remarks') ?? ''}
                onChange={(event) =>
                  mainForm.setValue('remarks', event.target.value, {
                    shouldDirty: true,
                  })
                }
                className="min-h-16 rounded border-slate-300 bg-white text-slate-900"
                placeholder="Add optional narration..."
              />
            </div>
            <div className="flex min-w-48 flex-col justify-end text-right">
              <div className="text-xs text-slate-500">Credit Header Amount</div>
              <div className="text-lg font-semibold text-slate-900">
                {totalDebit.toFixed(2)}
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}

type DateBoxProps = {
  form: UseFormReturn<PaymentVoucherForm>
  name: 'voucherDate'
}

const DateBox = ({ form, name }: DateBoxProps) => {
  const [displayValue, setDisplayValue] = useState('')

  const parseDate = (input: string): Date | null => {
    if (!input) return null

    const now = new Date()
    const parts = input.split(/[./-]/).map((part) => part.trim())

    const day = Number(parts[0])
    const month = parts[1] ? Number(parts[1]) - 1 : now.getMonth()
    const year = parts[2]
      ? parts[2].length === 2
        ? 2000 + Number(parts[2])
        : Number(parts[2])
      : now.getFullYear()

    if (Number.isNaN(day) || day < 1 || day > 31) return null
    if (Number.isNaN(month) || month < 0 || month > 11) return null
    if (Number.isNaN(year) || year < 1000) return null

    return new Date(year, month, day)
  }

  const syncParsedDate = () => {
    const parsed = parseDate(displayValue)
    if (!parsed) return

    const formatted = parsed.toLocaleDateString('en-GB').replace(/\//g, '-')
    setDisplayValue(formatted)
    form.setValue(name, parsed, { shouldValidate: true, shouldDirty: true })
  }

  useEffect(() => {
    const value = form.watch(name)
    if (!value) {
      setDisplayValue('')
      return
    }

    const parsed = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(parsed.getTime())) return

    setDisplayValue(parsed.toLocaleDateString('en-GB').replace(/\//g, '-'))
  }, [form, name, form.watch(name)])

  return (
    <input
      type="text"
      placeholder="DD-MM-YYYY"
      value={displayValue}
      onChange={(event) => {
        const value = event.target.value
        setDisplayValue(value)
        if (!value) {
          form.setValue(name, null as never, {
            shouldValidate: true,
            shouldDirty: true,
          })
        }
      }}
      onBlur={syncParsedDate}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          syncParsedDate()
        }
      }}
      className="h-9 w-full rounded border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400"
    />
  )
}

export default Pos

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
import { useContraVoucherMutation } from '../data/queryOptions'
import contraDefaultValues from '../data/data'
import {
  buildContraVoucherEntries,
  calculateTotalCredit,
} from '../test/contra-payload'
import {
  CONTRA_VOUCHER_TYPE_ID,
  contraFormSchema,
  type ContraVoucher,
  type ContraVoucherForm,
} from '../data/schema'
import type { ContraProps } from './contracts'

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

const isBankOrCashLedger = (ledger: AccountLedger) => {
  const label = [
    ledger.name,
    ledger.code,
    ledger.accountGroup?.name,
    ledger.accountGroup?.code,
    ledger.accountGroup?.accountNature?.name,
    ledger.accountGroup?.accountNature?.code,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return label.includes('cash') || label.includes('bank')
}

const buildEditValues = (row: ContraVoucher): ContraVoucherForm => ({
  voucherNo: row.voucherNo ?? 'new',
  voucherDate: row.voucherDate ? new Date(row.voucherDate) : new Date(),
  referenceNo: row.referenceNo ?? '',
  referenceDate: row.referenceDate ? new Date(row.referenceDate) : null,
  voucherTypeId: CONTRA_VOUCHER_TYPE_ID,
  voucherType: row.voucherType ?? null,
  module: row.module ?? 'contra',
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
      : contraDefaultValues.voucherEntries,
  party: row.party ?? null,
  partyLedger: row.partyLedger ?? null,
  transactionLedger: row.transactionLedger ?? null,
  voucherDispatchDetail: row.voucherDispatchDetail ?? null,
  amount: Number(row.amount ?? 0),
  remarks: row.remarks ?? '',
  isEdit: true,
})

const Pos = ({ currentRow }: ContraProps) => {
  const isEdit = Boolean(currentRow?.id)
  const { data: accountLedgerResponse, isPending: isAccountLedgersLoading } =
    useQuery(accountLedgerQueryOptions())
  const { mutate: saveContra, isPending: isSaving } = useContraVoucherMutation()

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

  const cashBankLedgers = useMemo(() => {
    const filtered = accountLedgers.filter(isBankOrCashLedger)
    return filtered.length > 0 ? filtered : accountLedgers
  }, [accountLedgers])

  const accountLedgerItems = useMemo(
    () =>
      cashBankLedgers.map((ledger) => ({
        label: ledger.name,
        value: String(ledger.id),
      })),
    [cashBankLedgers],
  )

  const initialDebitLedgerId = useMemo(() => {
    if (currentRow?.transactionLedger?.id) {
      return String(currentRow.transactionLedger.id)
    }

    const debitEntry = currentRow?.voucherEntries?.find(
      (entry) => Number(entry?.debit || 0) > 0,
    )
    return debitEntry?.accountLedgerId ? String(debitEntry.accountLedgerId) : ''
  }, [currentRow])

  const [debitLedgerId, setDebitLedgerId] =
    useState<string>(initialDebitLedgerId)

  const selectedHeaderLedger = useMemo(
    () => cashBankLedgers.find((ledger) => String(ledger.id) === debitLedgerId),
    [cashBankLedgers, debitLedgerId],
  )

  const mainForm = useForm<ContraVoucherForm>({
    resolver: zodResolver(contraFormSchema) as Resolver<ContraVoucherForm>,
    defaultValues:
      isEdit && currentRow
        ? buildEditValues(currentRow)
        : { ...contraDefaultValues, isEdit: false },
  })

  const { fields, append, remove } = useFieldArray({
    control: mainForm.control,
    name: 'voucherEntries',
  })

  const watchedEntries = mainForm.watch('voucherEntries')
  const totalCredit = useMemo(
    () => calculateTotalCredit(watchedEntries),
    [watchedEntries],
  )

  const hasCreditEntries = useMemo(
    () =>
      watchedEntries.some(
        (entry) =>
          Number(entry?.accountLedgerId || 0) > 0 &&
          Number(entry?.credit || 0) > 0,
      ),
    [watchedEntries],
  )

  const isBalanced =
    Boolean(debitLedgerId) && totalCredit > 0 && hasCreditEntries

  const handleAmountChange = (index: number, value: string) => {
    const amount = Number(value || 0)
    mainForm.setValue(`voucherEntries.${index}.credit`, amount, {
      shouldDirty: true,
    })
    mainForm.setValue(`voucherEntries.${index}.debit`, 0, { shouldDirty: true })
  }

  const onSubmit = (values: ContraVoucherForm) => {
    const selectedDebitLedger = cashBankLedgers.find(
      (ledger) => String(ledger.id) === debitLedgerId,
    )
    if (!selectedDebitLedger) return

    const voucherEntries = buildContraVoucherEntries({
      entries: values.voucherEntries,
      selectedDebitLedger,
      currentVoucherId: currentRow?.id ?? null,
      totalCredit,
    })

    saveContra(
      {
        ...values,
        id: currentRow?.id ?? undefined,
        voucherDate: values.voucherDate,
        voucherNo: values.voucherNo || null,
        voucherTypeId: CONTRA_VOUCHER_TYPE_ID,
        amount: totalCredit,
        remarks: values.remarks || null,
        voucherEntries,
        transactionLedger: {
          id: selectedDebitLedger.id,
          name: selectedDebitLedger.name,
          code: selectedDebitLedger.code,
          ledgerableType: selectedDebitLedger.ledgerableType ?? null,
          ledgerableId: selectedDebitLedger.ledgerableId ?? null,
          currentBalance: 0,
        },
      },
      {
        onSuccess: () => {
          if (!isEdit) {
            mainForm.reset({ ...contraDefaultValues, isEdit: false })
            setDebitLedgerId('')
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
                  Contra Voucher
                </h2>
                <p className="text-xs text-slate-500">
                  Header debit account with credit line entries
                </p>
              </div>
              <div
                className={`rounded px-2 py-1 text-xs font-semibold ${isBalanced ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}
              >
                {isBalanced ? 'Balanced' : 'Not Balanced'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="grid gap-2 lg:grid-cols-[180px_180px_minmax(280px,1fr)_auto_auto]">
                <div>
                  <div className="mb-1 text-[11px] font-semibold uppercase text-slate-500">
                    Contra No
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
                  disabled={!isBalanced || isSaving}
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
                    Header Debit Account
                  </div>
                  <SelectDropdown
                    defaultValue={debitLedgerId}
                    onValueChange={setDebitLedgerId}
                    items={accountLedgerItems}
                    isPending={isAccountLedgersLoading}
                    placeholder="Select debit header account"
                    sheetTitle="Select Debit Header Account"
                    className="h-9 max-w-sm"
                  />
                  <div className="mt-1 text-xs text-slate-500">
                    {formatCurrentBalance(
                      getLedgerCurrentBalance(selectedHeaderLedger),
                    )}
                  </div>
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
                  const amount = Number(entry?.credit || 0)
                  const selectedLineLedger = cashBankLedgers.find(
                    (ledger) =>
                      String(ledger.id) ===
                      String(entry?.accountLedgerId || ''),
                  )

                  return (
                    <tr key={field.id} className="border-b border-slate-200">
                      <td className="px-2 py-2 text-center">
                        <span className="inline-flex rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                          Credit
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
                            items={accountLedgerItems}
                            isPending={isAccountLedgersLoading}
                            placeholder="Select bank/cash ledger"
                            sheetTitle="Select Bank/Cash Ledger"
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
              <div className="text-xs text-slate-500">Debit Header Amount</div>
              <div className="text-lg font-semibold text-slate-900">
                {totalCredit.toFixed(2)}
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}

type DateBoxProps = {
  form: UseFormReturn<ContraVoucherForm>
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

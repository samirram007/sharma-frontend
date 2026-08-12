import { SelectDropdown } from '@/components/select-dropdown'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { fetchPartyLedgerService } from '@/features/modules/voucher/data-schema/partyLedger/data/api'
import type { PartyLedger } from '@/features/modules/voucher/data-schema/partyLedger/data/schema'
import type { TransactionLedger } from '@/features/modules/voucher/data-schema/transactinableStockItem/data/schema'
import { fetchPurchaseLedgersService } from '@/features/modules/voucher/receipt_note/data/api'
import { usePos } from '@/features/modules/voucher/contexts/pos-context'
import {
  stockJournalSchema,
  type StockJournalEntryForm,
  type StockJournalForm,
} from '@/features/modules/voucher/data-schema/voucher-schema'
import { fetchStockItemService } from '@/features/modules/stock_item/data/api'
import { fetchStockUnitService } from '@/features/modules/stock_unit/data/api'
import { fetchGodownService } from '@/features/modules/godown/data/api'
import { accountLedgerQueryOptions } from '@/features/modules/account_ledger/data/queryOptions'
import type { AccountLedger } from '@/features/modules/account_ledger/data/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import isEqual from 'lodash/isEqual'
import { useQueries, useQuery } from '@tanstack/react-query'
import { Fragment, useEffect, useMemo, useState } from 'react'
import {
  useFieldArray,
  useForm,
  useWatch,
  type Resolver,
  type UseFormReturn,
} from 'react-hook-form'
import purchaseOrderDefaultValues from '../data/data'
import { usePurchaseOrderVoucherMutation } from '../data/queryOptions'
import {
  PURCHASE_ORDER_VOUCHER_TYPE_ID,
  purchaseOrderFormSchema,
  type PurchaseOrderVoucher,
  type PurchaseOrderVoucherForm,
} from '../data/schema'
import type { PurchaseOrderProps } from './contracts'

type AdditionalLedgerEntry = {
  id: string
  accountLedgerId: number
  entryType: 'debit' | 'credit'
  amount: number
  remarks: string
}

const buildEditValues = (
  row: PurchaseOrderVoucher,
): PurchaseOrderVoucherForm => ({
  voucherNo: row.voucherNo ?? 'new',
  voucherDate: row.voucherDate ? new Date(row.voucherDate) : new Date(),
  referenceNo: row.referenceNo ?? '',
  referenceDate: row.referenceDate ? new Date(row.referenceDate) : null,
  voucherTypeId: PURCHASE_ORDER_VOUCHER_TYPE_ID,
  voucherType: row.voucherType ?? null,
  module: row.module ?? 'purchase_order',
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
      : purchaseOrderDefaultValues.voucherEntries,
  party: row.party ?? null,
  partyLedger: row.partyLedger ?? null,
  transactionLedger: row.transactionLedger ?? null,
  voucherDispatchDetail: row.voucherDispatchDetail ?? null,
  amount: Number(row.amount ?? 0),
  remarks: row.remarks ?? '',
  isEdit: true,
})

const Pos = ({ currentRow }: PurchaseOrderProps) => {
  const isEdit = Boolean(currentRow?.id)
  const { setMovementType } = usePos()
  const { mutate: savePurchaseOrder, isPending: isSaving } =
    usePurchaseOrderVoucherMutation()

  const { data: supplierLedgersResponse, isPending: isSuppliersLoading } =
    useQuery({
      queryKey: ['accountLedgers', 'supplier_ledgers'],
      queryFn: () => fetchPartyLedgerService('supplier_ledgers'),
    })
  const { data: purchaseLedgersResponse, isPending: isPurchaseLedgersLoading } =
    useQuery({
      queryKey: ['accountLedgers', 'purchase_ledgers'],
      queryFn: fetchPurchaseLedgersService,
    })
  const { data: accountLedgerResponse, isPending: isAccountLedgersLoading } =
    useQuery(accountLedgerQueryOptions())

  const supplierLedgers = useMemo<PartyLedger[]>(() => {
    const raw = supplierLedgersResponse
    if (Array.isArray(raw)) return raw as PartyLedger[]
    if (
      raw &&
      typeof raw === 'object' &&
      Array.isArray((raw as { data?: unknown }).data)
    )
      return (raw as { data: PartyLedger[] }).data
    return []
  }, [supplierLedgersResponse])

  const purchaseLedgers = useMemo<TransactionLedger[]>(() => {
    const raw = purchaseLedgersResponse
    if (Array.isArray(raw)) return raw as TransactionLedger[]
    if (
      raw &&
      typeof raw === 'object' &&
      Array.isArray((raw as { data?: unknown }).data)
    )
      return (raw as { data: TransactionLedger[] }).data
    return []
  }, [purchaseLedgersResponse])

  const accountLedgers = useMemo<AccountLedger[]>(() => {
    const raw = accountLedgerResponse
    if (Array.isArray(raw)) return raw as AccountLedger[]
    if (
      raw &&
      typeof raw === 'object' &&
      Array.isArray((raw as { data?: unknown }).data)
    )
      return (raw as { data: AccountLedger[] }).data
    return []
  }, [accountLedgerResponse])

  const supplierItems = useMemo(
    () =>
      supplierLedgers.map((l) => ({
        label: l.name ?? '',
        value: String(l.id ?? ''),
      })),
    [supplierLedgers],
  )
  const purchaseLedgerItems = useMemo(
    () =>
      purchaseLedgers.map((l) => ({
        label: l.name ?? '',
        value: String(l.id ?? ''),
      })),
    [purchaseLedgers],
  )

  const [partyLedgerStr, setPartyLedgerStr] = useState<string>(
    currentRow?.partyLedger?.id ? String(currentRow.partyLedger.id) : '',
  )
  const [txLedgerStr, setTxLedgerStr] = useState<string>(
    currentRow?.transactionLedger?.id
      ? String(currentRow.transactionLedger.id)
      : '',
  )
  const [additionalEntries, setAdditionalEntries] = useState<
    AdditionalLedgerEntry[]
  >(() => {
    const partyId = currentRow?.partyLedger?.id
    const transactionId = currentRow?.transactionLedger?.id
    const entries = currentRow?.voucherEntries ?? []
    return entries
      .filter((entry) => {
        const ledgerId = Number(entry?.accountLedgerId || 0)
        if (!ledgerId) return false
        if (partyId && ledgerId === partyId) return false
        if (transactionId && ledgerId === transactionId) return false
        return Number(entry?.debit || 0) > 0 || Number(entry?.credit || 0) > 0
      })
      .map((entry, index) => ({
        id: `existing-${entry.id ?? index}`,
        accountLedgerId: Number(entry.accountLedgerId || 0),
        entryType: Number(entry.credit || 0) > 0 ? 'credit' : 'debit',
        amount: Number(entry.debit || entry.credit || 0),
        remarks: entry.remarks ?? '',
      }))
  })

  const mainForm = useForm<PurchaseOrderVoucherForm>({
    resolver: zodResolver(
      purchaseOrderFormSchema,
    ) as Resolver<PurchaseOrderVoucherForm>,
    defaultValues:
      isEdit && currentRow
        ? buildEditValues(currentRow)
        : { ...purchaseOrderDefaultValues, isEdit: false },
  })

  const [stockItemsQ, stockUnitsQ, godownsQ] = useQueries({
    queries: [
      { queryKey: ['stockItems'], queryFn: fetchStockItemService },
      { queryKey: ['stockUnits'], queryFn: fetchStockUnitService },
      { queryKey: ['godowns'], queryFn: fetchGodownService },
    ],
  })

  const stockItems = useMemo(() => {
    const raw = stockItemsQ.data
    if (Array.isArray(raw)) return raw
    if (
      raw &&
      typeof raw === 'object' &&
      Array.isArray((raw as { data?: unknown }).data)
    )
      return (raw as { data: unknown[] }).data
    return []
  }, [stockItemsQ.data]) as Array<{
    id: number
    name: string
    stockUnitId?: number | null
    isMaintainBatch?: boolean | null
    isMaintainSerial?: boolean | null
    useExpiryDate?: boolean | null
    trackManufacturingDate?: boolean | null
  }>

  const stockUnits = useMemo(() => {
    const raw = stockUnitsQ.data
    if (Array.isArray(raw)) return raw
    if (
      raw &&
      typeof raw === 'object' &&
      Array.isArray((raw as { data?: unknown }).data)
    )
      return (raw as { data: unknown[] }).data
    return []
  }, [stockUnitsQ.data]) as Array<{ id: number; name: string; code: string }>

  const godowns = useMemo(() => {
    const raw = godownsQ.data
    if (Array.isArray(raw)) return raw
    if (
      raw &&
      typeof raw === 'object' &&
      Array.isArray((raw as { data?: unknown }).data)
    )
      return (raw as { data: unknown[] }).data
    return []
  }, [godownsQ.data]) as Array<{ id: number; name: string }>

  const stockItemItems = useMemo(
    () => stockItems.map((s) => ({ label: s.name, value: String(s.id) })),
    [stockItems],
  )

  const godownItems = useMemo(
    () => godowns.map((g) => ({ label: g.name, value: String(g.id) })),
    [godowns],
  )

  const additionalLedgerItems = useMemo(() => {
    const excluded = new Set([
      Number(mainForm.getValues('transactionLedger.id') || 0),
      Number(mainForm.getValues('partyLedger.id') || 0),
    ])
    return accountLedgers
      .filter((ledger) => !excluded.has(Number(ledger.id)))
      .map((ledger) => ({
        label: ledger.name,
        value: String(ledger.id),
      }))
  }, [accountLedgers, txLedgerStr, partyLedgerStr])

  // stock journal sub-form to hold line entries
  const stockJournalData = mainForm.watch('stockJournal')
  const stockJournalForm = useForm<StockJournalForm>({
    resolver: zodResolver(stockJournalSchema) as Resolver<StockJournalForm>,
    defaultValues: {
      ...stockJournalData,
      stockJournalEntries: stockJournalData?.stockJournalEntries ?? [],
    },
  })

  const {
    fields: itemFields,
    append: appendItem,
    remove: removeItem,
  } = useFieldArray({
    control: stockJournalForm.control,
    name: 'stockJournalEntries',
  })

  useEffect(() => {
    const parentValue = mainForm.getValues('stockJournal')
    if (parentValue && !isEqual(parentValue, stockJournalForm.getValues())) {
      stockJournalForm.reset(parentValue)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainForm.watch('stockJournal')])

  useEffect(() => {
    const subscription = stockJournalForm.watch((value) => {
      const currentParent = mainForm.getValues('stockJournal')
      if (!isEqual(currentParent, value)) {
        mainForm.setValue('stockJournal', value as StockJournalForm, {
          shouldValidate: false,
        })
      }
    })
    return () => subscription.unsubscribe()
  }, [mainForm, stockJournalForm])

  const watchedItems = useWatch({
    control: stockJournalForm.control,
    name: 'stockJournalEntries',
  })
  const total = useMemo(
    () =>
      (watchedItems ?? []).reduce(
        (acc, entry) => acc + (Number(entry?.amount) || 0),
        0,
      ),
    [watchedItems],
  )

  const addItemRow = () => {
    appendItem({
      stockItemId: null,
      stockItem: null,
      stockUnitId: null,
      stockUnit: null,
      alternateStockUnit: null,
      rateUnit: null,
      actualQuantity: 0,
      billingQuantity: 0,
      rate: 0,
      discountPercentage: 0,
      discount: 0,
      amount: 0,
      movementType: 'in',
      stockJournalGodownEntries: [],
    } as StockJournalEntryForm)
  }

  const recalcAmount = (index: number) => {
    const entry = stockJournalForm.getValues(`stockJournalEntries.${index}`)
    const qty = Number(entry?.billingQuantity || entry?.actualQuantity || 0)
    const rate = Number(entry?.rate || 0)
    const disc = Number(entry?.discountPercentage || 0)
    const amount = qty * rate * (1 - disc / 100)
    stockJournalForm.setValue(`stockJournalEntries.${index}.amount`, amount, {
      shouldDirty: true,
    })
  }

  const isTrackingRequired = (stockItemId: number | null | undefined) => {
    const item = stockItems.find((s) => s.id === Number(stockItemId || 0))
    if (!item) return false
    return Boolean(
      item.isMaintainBatch ||
      item.isMaintainSerial ||
      item.useExpiryDate ||
      item.trackManufacturingDate,
    )
  }

  const ensureTrackingEntry = (index: number) => {
    const entry = stockJournalForm.getValues(`stockJournalEntries.${index}`)
    const hasRows = (entry?.stockJournalGodownEntries?.length || 0) > 0
    if (hasRows) return

    stockJournalForm.setValue(
      `stockJournalEntries.${index}.stockJournalGodownEntries`,
      [
        {
          godownId: null,
          batchNo: '',
          mfgDate: null,
          expiryDate: null,
          serialNo: '',
          actualQuantity: Number(entry?.actualQuantity || 0),
          billingQuantity: Number(entry?.billingQuantity || 0),
          rate: Number(entry?.rate || 0),
          discountPercentage: Number(entry?.discountPercentage || 0),
          discount: Number(entry?.discount || 0),
          amount: Number(entry?.amount || 0),
          movementType: 'in',
          remarks: null,
          stockItem: entry?.stockItem ?? null,
          stockUnit: entry?.stockUnit ?? null,
          rateUnit: entry?.rateUnit ?? null,
        },
      ],
      { shouldDirty: true },
    )
  }

  const syncTrackingAmountAndQty = (index: number) => {
    const entry = stockJournalForm.getValues(`stockJournalEntries.${index}`)
    const tracking = entry?.stockJournalGodownEntries?.[0]
    if (!tracking) return

    stockJournalForm.setValue(
      `stockJournalEntries.${index}.stockJournalGodownEntries.0.actualQuantity`,
      Number(entry?.actualQuantity || 0),
      { shouldDirty: true },
    )
    stockJournalForm.setValue(
      `stockJournalEntries.${index}.stockJournalGodownEntries.0.billingQuantity`,
      Number(entry?.billingQuantity || 0),
      { shouldDirty: true },
    )
    stockJournalForm.setValue(
      `stockJournalEntries.${index}.stockJournalGodownEntries.0.rate`,
      Number(entry?.rate || 0),
      { shouldDirty: true },
    )
    stockJournalForm.setValue(
      `stockJournalEntries.${index}.stockJournalGodownEntries.0.discountPercentage`,
      Number(entry?.discountPercentage || 0),
      { shouldDirty: true },
    )
    stockJournalForm.setValue(
      `stockJournalEntries.${index}.stockJournalGodownEntries.0.amount`,
      Number(entry?.amount || 0),
      { shouldDirty: true },
    )
  }

  const addAdditionalLedgerRow = () => {
    setAdditionalEntries((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}-${prev.length}`,
        accountLedgerId: 0,
        entryType: 'debit',
        amount: 0,
        remarks: '',
      },
    ])
  }

  const updateAdditionalLedgerRow = (
    rowId: string,
    patch: Partial<AdditionalLedgerEntry>,
  ) => {
    setAdditionalEntries((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, ...patch } : row)),
    )
  }

  const removeAdditionalLedgerRow = (rowId: string) => {
    setAdditionalEntries((prev) => prev.filter((row) => row.id !== rowId))
  }

  useEffect(() => {
    const transactionLedgerId = Number(
      mainForm.getValues('transactionLedger.id') || 0,
    )
    const partyLedgerId = Number(mainForm.getValues('partyLedger.id') || 0)
    if (!transactionLedgerId || !partyLedgerId) return

    const normalizedAdditional = additionalEntries
      .filter(
        (entry) =>
          Number(entry.accountLedgerId) > 0 &&
          Number(entry.amount || 0) > 0 &&
          Number(entry.accountLedgerId) !== transactionLedgerId &&
          Number(entry.accountLedgerId) !== partyLedgerId,
      )
      .map((entry, index) => ({
        id: null,
        voucherId: currentRow?.id ?? null,
        entryOrder: index + 3,
        accountLedgerId: Number(entry.accountLedgerId),
        debit: entry.entryType === 'debit' ? Number(entry.amount || 0) : 0,
        credit: entry.entryType === 'credit' ? Number(entry.amount || 0) : 0,
        remarks: entry.remarks || null,
      }))

    const txEntry = {
      id: null,
      voucherId: currentRow?.id ?? null,
      entryOrder: 1,
      accountLedgerId: transactionLedgerId,
      debit: Number(total || 0),
      credit: 0,
      remarks: 'Item purchase account',
    }

    const partyEntry = {
      id: null,
      voucherId: currentRow?.id ?? null,
      entryOrder: 2,
      accountLedgerId: partyLedgerId,
      debit: 0,
      credit: Number(total || 0),
      remarks: 'Supplier account',
    }

    const updated = [txEntry, partyEntry, ...normalizedAdditional]
    mainForm.setValue('voucherEntries', updated, {
      shouldValidate: false,
      shouldDirty: true,
    })
  }, [total, additionalEntries, txLedgerStr, partyLedgerStr, currentRow?.id])

  const watchedVoucherEntries = mainForm.watch('voucherEntries')
  const totalDebit = useMemo(
    () =>
      watchedVoucherEntries.reduce(
        (sum, entry) => sum + Number(entry?.debit || 0),
        0,
      ),
    [watchedVoucherEntries],
  )
  const totalCredit = useMemo(
    () =>
      watchedVoucherEntries.reduce(
        (sum, entry) => sum + Number(entry?.credit || 0),
        0,
      ),
    [watchedVoucherEntries],
  )
  const isBalanced =
    totalDebit > 0 && Math.abs(totalDebit - totalCredit) < 0.0001

  useEffect(() => {
    setMovementType?.('in')
  }, [setMovementType])

  // initialise with one empty row when accounts are selected
  useEffect(() => {
    if (partyLedgerStr && txLedgerStr && itemFields.length === 0) {
      addItemRow()
    }
  }, [partyLedgerStr, txLedgerStr])

  const canShowItems = Boolean(partyLedgerStr && txLedgerStr)

  const onSubmit = (values: PurchaseOrderVoucherForm) => {
    const coercedEntries = values.voucherEntries.map((e) => ({
      ...e,
      debit: Number(e.debit ?? 0),
      credit: Number(e.credit ?? 0),
    }))
    savePurchaseOrder(
      {
        ...values,
        id: currentRow?.id ?? undefined,
        voucherDate: values.voucherDate,
        voucherNo: values.voucherNo || null,
        voucherTypeId: PURCHASE_ORDER_VOUCHER_TYPE_ID,
        amount: totalDebit,
        remarks: values.remarks || null,
        voucherEntries: coercedEntries as Array<{
          id?: number | null
          voucherId?: number | null
          entryOrder: number
          accountLedgerId: number
          debit: number
          credit: number
          remarks?: string | null
        }>,
      },
      {
        onSuccess: () => {
          if (!isEdit) {
            mainForm.reset({ ...purchaseOrderDefaultValues, isEdit: false })
            stockJournalForm.reset({ stockJournalEntries: [] })
            setPartyLedgerStr('')
            setTxLedgerStr('')
            setAdditionalEntries([])
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
          <div className="border-b border-slate-300 px-3 py-2 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800">
                Purchase Order
              </h2>
              <p className="text-xs text-slate-500">Voucher Type ID: 5001</p>
            </div>
            <div className="grid gap-2 lg:grid-cols-[180px_180px_1fr]">
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
            </div>
            <div className="grid gap-2 lg:grid-cols-2">
              <div>
                <div className="mb-1 text-[11px] font-semibold uppercase text-slate-500">
                  Party A/c (Supplier)
                </div>
                <SelectDropdown
                  defaultValue={partyLedgerStr}
                  onValueChange={(val) => {
                    setPartyLedgerStr(val)
                    const ledger = supplierLedgers.find(
                      (l) => String(l.id) === val,
                    )
                    if (ledger) {
                      mainForm.setValue('partyLedger', {
                        id: ledger.id!,
                        name: ledger.name!,
                        code: ledger.code ?? null,
                        ledgerableType: ledger.ledgerableType ?? null,
                        ledgerableId: ledger.ledgerableId ?? null,
                        currentBalance: 0,
                      })
                    }
                  }}
                  items={supplierItems}
                  isPending={isSuppliersLoading}
                  placeholder="Select supplier"
                  sheetTitle="Select Supplier"
                  className="h-9 w-full"
                />
              </div>
              <div>
                <div className="mb-1 text-[11px] font-semibold uppercase text-slate-500">
                  Purchase A/c
                </div>
                <SelectDropdown
                  defaultValue={txLedgerStr}
                  onValueChange={(val) => {
                    setTxLedgerStr(val)
                    const ledger = purchaseLedgers.find(
                      (l) => String(l.id) === val,
                    )
                    if (ledger) {
                      mainForm.setValue('transactionLedger', {
                        id: ledger.id!,
                        name: ledger.name!,
                        code: null,
                        ledgerableType: null,
                        ledgerableId: null,
                        currentBalance: ledger.accountBalance ?? 0,
                      })
                    }
                  }}
                  items={purchaseLedgerItems}
                  isPending={isPurchaseLedgersLoading}
                  placeholder="Select purchase account"
                  sheetTitle="Select Purchase Account"
                  className="h-9 w-full"
                />
              </div>
            </div>
          </div>

          <div className="min-h-0 overflow-auto">
            {canShowItems ? (
              <Form {...stockJournalForm}>
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <th className="w-8 px-2 py-2 text-center">#</th>
                      <th className="px-3 py-2 text-left font-semibold">
                        Particulars
                      </th>
                      <th className="w-28 px-2 py-2 text-right font-semibold">
                        Qty
                      </th>
                      <th className="w-20 px-2 py-2 text-left font-semibold">
                        Unit
                      </th>
                      <th className="w-28 px-2 py-2 text-right font-semibold">
                        Rate
                      </th>
                      <th className="w-24 px-2 py-2 text-right font-semibold">
                        Disc %
                      </th>
                      <th className="w-32 px-2 py-2 text-right font-semibold">
                        Amount
                      </th>
                      <th className="w-20 px-2 py-2 text-center font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemFields.map((field, index) => {
                      const entry = watchedItems?.[index]
                      const selectedItem = stockItems.find(
                        (s) => s.id === Number(entry?.stockItemId || 0),
                      )
                      const unit = stockUnits.find(
                        (u) =>
                          u.id ===
                          Number(
                            selectedItem?.stockUnitId ||
                              entry?.stockUnitId ||
                              0,
                          ),
                      )
                      const trackingRequired = isTrackingRequired(
                        entry?.stockItemId,
                      )
                      const trackingRow = entry?.stockJournalGodownEntries?.[0]

                      return (
                        <Fragment key={field.id}>
                          <tr className="border-b border-slate-200 hover:bg-slate-50">
                            <td className="px-2 py-1 text-center text-slate-400">
                              {index + 1}
                            </td>
                            <td className="px-2 py-1">
                              <SelectDropdown
                                defaultValue={
                                  entry?.stockItemId
                                    ? String(entry.stockItemId)
                                    : ''
                                }
                                onValueChange={(val) => {
                                  const item = stockItems.find(
                                    (s) => String(s.id) === val,
                                  )
                                  stockJournalForm.setValue(
                                    `stockJournalEntries.${index}.stockItemId`,
                                    Number(val),
                                    { shouldDirty: true },
                                  )
                                  stockJournalForm.setValue(
                                    `stockJournalEntries.${index}.stockItem`,
                                    (item ??
                                      null) as StockJournalEntryForm['stockItem'],
                                    { shouldDirty: true },
                                  )
                                  stockJournalForm.setValue(
                                    `stockJournalEntries.${index}.stockUnitId`,
                                    item?.stockUnitId ?? null,
                                    { shouldDirty: true },
                                  )
                                  if (isTrackingRequired(Number(val))) {
                                    ensureTrackingEntry(index)
                                  }
                                }}
                                items={stockItemItems}
                                isPending={stockItemsQ.isPending}
                                placeholder="Select item"
                                sheetTitle="Select Stock Item"
                                className="h-8 w-full"
                              />
                            </td>
                            <td className="px-2 py-1">
                              <input
                                type="number"
                                min="0"
                                step="0.001"
                                className="h-8 w-full rounded border border-slate-300 bg-white px-2 text-right text-sm outline-none focus:border-slate-400"
                                value={Number(entry?.billingQuantity || 0)}
                                onChange={(e) => {
                                  stockJournalForm.setValue(
                                    `stockJournalEntries.${index}.billingQuantity`,
                                    Number(e.target.value),
                                    { shouldDirty: true },
                                  )
                                  stockJournalForm.setValue(
                                    `stockJournalEntries.${index}.actualQuantity`,
                                    Number(e.target.value),
                                    { shouldDirty: true },
                                  )
                                  recalcAmount(index)
                                  if (trackingRequired) {
                                    ensureTrackingEntry(index)
                                    syncTrackingAmountAndQty(index)
                                  }
                                }}
                              />
                            </td>
                            <td className="px-2 py-1 text-slate-500 text-xs">
                              {unit?.code ?? '-'}
                            </td>
                            <td className="px-2 py-1">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="h-8 w-full rounded border border-slate-300 bg-white px-2 text-right text-sm outline-none focus:border-slate-400"
                                value={Number(entry?.rate || 0)}
                                onChange={(e) => {
                                  stockJournalForm.setValue(
                                    `stockJournalEntries.${index}.rate`,
                                    Number(e.target.value),
                                    { shouldDirty: true },
                                  )
                                  recalcAmount(index)
                                  if (trackingRequired) {
                                    ensureTrackingEntry(index)
                                    syncTrackingAmountAndQty(index)
                                  }
                                }}
                              />
                            </td>
                            <td className="px-2 py-1">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                className="h-8 w-full rounded border border-slate-300 bg-white px-2 text-right text-sm outline-none focus:border-slate-400"
                                value={Number(entry?.discountPercentage || 0)}
                                onChange={(e) => {
                                  stockJournalForm.setValue(
                                    `stockJournalEntries.${index}.discountPercentage`,
                                    Number(e.target.value),
                                    { shouldDirty: true },
                                  )
                                  recalcAmount(index)
                                  if (trackingRequired) {
                                    ensureTrackingEntry(index)
                                    syncTrackingAmountAndQty(index)
                                  }
                                }}
                              />
                            </td>
                            <td className="px-2 py-1 text-right font-medium text-slate-800">
                              {Number(entry?.amount || 0).toFixed(2)}
                            </td>
                            <td className="px-2 py-1 text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-red-500 hover:text-red-700"
                                onClick={() => removeItem(index)}
                              >
                                Remove
                              </Button>
                            </td>
                          </tr>
                          {trackingRequired && (
                            <tr className="border-b border-slate-200 bg-slate-50/60">
                              <td colSpan={8} className="px-2 py-2">
                                <div className="mb-1 text-[11px] font-semibold uppercase text-slate-500">
                                  Tracking Details (Godown / Batch)
                                </div>
                                <div className="grid gap-2 lg:grid-cols-[minmax(220px,1fr)_minmax(180px,1fr)_minmax(180px,1fr)_minmax(180px,1fr)_minmax(180px,1fr)]">
                                  <SelectDropdown
                                    defaultValue={
                                      trackingRow?.godownId
                                        ? String(trackingRow.godownId)
                                        : ''
                                    }
                                    onValueChange={(value) => {
                                      ensureTrackingEntry(index)
                                      stockJournalForm.setValue(
                                        `stockJournalEntries.${index}.stockJournalGodownEntries.0.godownId`,
                                        Number(value || 0),
                                        { shouldDirty: true },
                                      )
                                    }}
                                    items={godownItems}
                                    isPending={godownsQ.isPending}
                                    placeholder="Select godown"
                                    sheetTitle="Select Godown"
                                    className="h-8 w-full"
                                  />

                                  {Boolean(selectedItem?.isMaintainBatch) && (
                                    <input
                                      type="text"
                                      placeholder="Batch no"
                                      className="h-8 rounded border border-slate-300 bg-white px-2 text-sm outline-none focus:border-slate-400"
                                      value={trackingRow?.batchNo ?? ''}
                                      onChange={(event) => {
                                        ensureTrackingEntry(index)
                                        stockJournalForm.setValue(
                                          `stockJournalEntries.${index}.stockJournalGodownEntries.0.batchNo`,
                                          event.target.value,
                                          { shouldDirty: true },
                                        )
                                      }}
                                    />
                                  )}

                                  {Boolean(selectedItem?.isMaintainSerial) && (
                                    <input
                                      type="text"
                                      placeholder="Serial no"
                                      className="h-8 rounded border border-slate-300 bg-white px-2 text-sm outline-none focus:border-slate-400"
                                      value={trackingRow?.serialNo ?? ''}
                                      onChange={(event) => {
                                        ensureTrackingEntry(index)
                                        stockJournalForm.setValue(
                                          `stockJournalEntries.${index}.stockJournalGodownEntries.0.serialNo`,
                                          event.target.value,
                                          { shouldDirty: true },
                                        )
                                      }}
                                    />
                                  )}

                                  {Boolean(
                                    selectedItem?.trackManufacturingDate,
                                  ) && (
                                    <input
                                      type="date"
                                      className="h-8 rounded border border-slate-300 bg-white px-2 text-sm outline-none focus:border-slate-400"
                                      value={
                                        trackingRow?.mfgDate
                                          ? new Date(trackingRow.mfgDate)
                                              .toISOString()
                                              .slice(0, 10)
                                          : ''
                                      }
                                      onChange={(event) => {
                                        ensureTrackingEntry(index)
                                        stockJournalForm.setValue(
                                          `stockJournalEntries.${index}.stockJournalGodownEntries.0.mfgDate`,
                                          event.target.value
                                            ? new Date(event.target.value)
                                            : null,
                                          { shouldDirty: true },
                                        )
                                      }}
                                    />
                                  )}

                                  {Boolean(selectedItem?.useExpiryDate) && (
                                    <input
                                      type="date"
                                      className="h-8 rounded border border-slate-300 bg-white px-2 text-sm outline-none focus:border-slate-400"
                                      value={
                                        trackingRow?.expiryDate
                                          ? new Date(trackingRow.expiryDate)
                                              .toISOString()
                                              .slice(0, 10)
                                          : ''
                                      }
                                      onChange={(event) => {
                                        ensureTrackingEntry(index)
                                        stockJournalForm.setValue(
                                          `stockJournalEntries.${index}.stockJournalGodownEntries.0.expiryDate`,
                                          event.target.value
                                            ? new Date(event.target.value)
                                            : null,
                                          { shouldDirty: true },
                                        )
                                      }}
                                    />
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      )
                    })}
                  </tbody>
                </table>
                <div className="px-3 py-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={addItemRow}
                  >
                    + Add Item
                  </Button>
                </div>

                <div className="border-t border-slate-200 px-3 py-2">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-xs font-semibold uppercase text-slate-500">
                      Additional Ledger Entries
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={addAdditionalLedgerRow}
                    >
                      + Add Ledger
                    </Button>
                  </div>

                  {additionalEntries.length === 0 ? (
                    <div className="rounded border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-400">
                      No additional ledger entries.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {additionalEntries.map((row) => (
                        <div
                          key={row.id}
                          className="grid gap-2 rounded border border-slate-200 p-2 lg:grid-cols-[minmax(220px,1fr)_110px_120px_minmax(180px,1fr)_80px]"
                        >
                          <SelectDropdown
                            defaultValue={
                              row.accountLedgerId
                                ? String(row.accountLedgerId)
                                : ''
                            }
                            onValueChange={(value) =>
                              updateAdditionalLedgerRow(row.id, {
                                accountLedgerId: Number(value || 0),
                              })
                            }
                            items={additionalLedgerItems}
                            isPending={isAccountLedgersLoading}
                            placeholder="Select account ledger"
                            sheetTitle="Select Additional Ledger"
                            className="h-9 w-full"
                          />
                          <select
                            className="h-9 rounded border border-slate-300 bg-white px-2 text-sm outline-none focus:border-slate-400"
                            value={row.entryType}
                            onChange={(event) =>
                              updateAdditionalLedgerRow(row.id, {
                                entryType: event.target.value as
                                  'debit' | 'credit',
                              })
                            }
                          >
                            <option value="debit">Debit</option>
                            <option value="credit">Credit</option>
                          </select>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="h-9 rounded border border-slate-300 bg-white px-3 text-right text-sm outline-none focus:border-slate-400"
                            value={Number(row.amount || 0)}
                            onChange={(event) =>
                              updateAdditionalLedgerRow(row.id, {
                                amount: Number(event.target.value || 0),
                              })
                            }
                          />
                          <input
                            type="text"
                            placeholder="Remarks (optional)"
                            className="h-9 rounded border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-400"
                            value={row.remarks}
                            onChange={(event) =>
                              updateAdditionalLedgerRow(row.id, {
                                remarks: event.target.value,
                              })
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-9 text-red-600 hover:text-red-700"
                            onClick={() => removeAdditionalLedgerRow(row.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Form>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 text-sm">
                Please select both Supplier and Purchase Account to add item
                entries.
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-300 px-3 py-2">
            <div className="space-y-1 text-sm text-slate-600">
              <div>
                Item Total:{' '}
                <span className="font-semibold text-slate-900">
                  {total.toFixed(2)}
                </span>
              </div>
              <div>
                Dr {totalDebit.toFixed(2)} | Cr {totalCredit.toFixed(2)}
                <span
                  className={`ml-2 rounded px-2 py-0.5 text-xs font-semibold ${isBalanced ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
                >
                  {isBalanced ? 'Balanced' : 'Not Balanced'}
                </span>
              </div>
            </div>
            <Button
              type="submit"
              className="h-9 px-6"
              disabled={!canShowItems || !isBalanced || isSaving}
            >
              {isSaving ? 'Saving...' : isEdit ? 'Update Order' : 'Save Order'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

type DateBoxProps = {
  form: UseFormReturn<PurchaseOrderVoucherForm>
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

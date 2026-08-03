import { Form } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import isEqual from 'lodash/isEqual'
import { useEffect, useMemo } from 'react'
import {
  useForm,
  useWatch,
  type Resolver,
  type UseFormReturn,
} from 'react-hook-form'

import StockJournal from '../../../components/stock-journal'
import {
  stockJournalSchema,
  type StockJournalForm,
} from '../../../data-schema/voucher-schema'
import type { TransferVoucherVoucherForm } from '../../data/schema'

type PosBodyProps = {
  mainForm: UseFormReturn<TransferVoucherVoucherForm>
}

const PosBody = ({ mainForm }: PosBodyProps) => {
  const stockJournal = mainForm.watch('stockJournal')
  const stockJournalForm = useForm<StockJournalForm>({
    resolver: zodResolver(stockJournalSchema) as Resolver<StockJournalForm>,
    defaultValues: {
      ...stockJournal,
      stockJournalEntries: stockJournal?.stockJournalEntries ?? [],
    },
  })

  const stockJournalEntries = useWatch({
    control: stockJournalForm.control,
    name: 'stockJournalEntries',
  })

  const totals = useMemo(() => {
    const entries = (stockJournalEntries ?? []).filter(Boolean)

    const godownRows = entries.flatMap(
      (entry) => entry?.stockJournalGodownEntries ?? [],
    )

    const outQuantity = godownRows
      .filter((g) => g?.movementType === 'out')
      .reduce((acc, g) => acc + (Number(g?.billingQuantity) || 0), 0)

    const inQuantity = godownRows
      .filter((g) => g?.movementType === 'in')
      .reduce((acc, g) => acc + (Number(g?.billingQuantity) || 0), 0)

    const outAmount = godownRows
      .filter((g) => g?.movementType === 'out')
      .reduce((acc, g) => acc + (Number(g?.amount) || 0), 0)

    const inAmount = godownRows
      .filter((g) => g?.movementType === 'in')
      .reduce((acc, g) => acc + (Number(g?.amount) || 0), 0)

    const balanced =
      outQuantity > 0 && Math.abs(outQuantity - inQuantity) < 0.0001

    return {
      outQuantity,
      inQuantity,
      outAmount,
      inAmount,
      balanced,
      hasMovement: outQuantity > 0 || inQuantity > 0,
    }
  }, [stockJournalEntries])

  // Sync: parent -> child (when the parent form value changes externally)
  const parentStockJournal = mainForm.watch('stockJournal')
  useEffect(() => {
    if (
      parentStockJournal &&
      !isEqual(parentStockJournal, stockJournalForm.getValues())
    ) {
      stockJournalForm.reset(parentStockJournal)
    }
  }, [parentStockJournal, stockJournalForm])

  // Sync: child -> parent (when the stock journal sub-form changes)
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

  return (
    <div className="flex flex-col w-full gap-2 items-start overflow-y-scroll px-2">
      <div className="grid grid-cols-1 w-full gap-2 items-start overflow-y-scroll px-2">
        <Form {...stockJournalForm}>
          <StockJournal stockJournalForm={stockJournalForm} />
        </Form>
      </div>
      {totals.hasMovement && (
        <div className="w-full flex justify-end font-bold text-sm">
          <div className="grid grid-cols-[170px_140px_170px_140px_150px] gap-4 text-right items-center">
            <div className="text-slate-500 font-medium">Out (Qty):</div>
            <div className="pr-4 text-orange-700">
              {totals.outQuantity.toFixed(2)}
            </div>
            <div className="text-slate-500 font-medium">In (Qty):</div>
            <div className="pr-4 text-emerald-700">
              {totals.inQuantity.toFixed(2)}
            </div>
            <div
              className={`rounded px-2 py-0.5 text-xs font-semibold ${
                totals.balanced
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {totals.balanced ? 'Balanced' : 'Out ≠ In'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PosBody

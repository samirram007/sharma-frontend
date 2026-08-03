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
import type { ConversionJournalVoucherForm } from '../../data/schema'

type PosBodyProps = {
  mainForm: UseFormReturn<ConversionJournalVoucherForm>
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
    const entries = (stockJournalEntries ?? []).filter(
      (entry): entry is NonNullable<typeof entry> => Boolean(entry),
    )

    const productionTotal = entries
      .filter((entry) => entry?.movementType === 'in')
      .reduce((acc, entry) => acc + (Number(entry?.amount) || 0), 0)

    const consumptionTotal = entries
      .filter((entry) => entry?.movementType === 'out')
      .reduce((acc, entry) => acc + (Number(entry?.amount) || 0), 0)

    return {
      productionTotal,
      consumptionTotal,
      grandTotal: productionTotal + consumptionTotal,
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
      {totals.grandTotal > 0 && (
        <div className="w-full flex justify-end font-bold text-sm">
          <div className="grid grid-cols-[180px_160px_160px_160px] gap-4 text-right">
            <div className="text-slate-500 font-medium">Consumption (OUT):</div>
            <div className="pr-4 text-orange-700">
              {totals.consumptionTotal.toFixed(2)}
            </div>
            <div className="text-slate-500 font-medium">Production (IN):</div>
            <div className="pr-4 text-emerald-700">
              {totals.productionTotal.toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PosBody

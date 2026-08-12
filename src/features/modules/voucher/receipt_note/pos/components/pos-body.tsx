import { Form } from '@/components/ui/form'
import { useTransaction } from '@/features/transactions/context/transaction-context'
import { zodResolver } from '@hookform/resolvers/zod'

import { useEffect, useMemo, useRef } from 'react'
import { useForm, useWatch, type Resolver } from 'react-hook-form'

import StockJournal from '../../../components/stock-journal'
import isEqual from 'lodash/isEqual'
import type { ReceiptNoteForm } from '../../data/schema'
import {
  stockJournalSchema,
  type StockJournalForm,
} from '../../../data-schema/voucher-schema'

type PosBodyProps = {
  mainForm: ReturnType<typeof useForm<ReceiptNoteForm>>
}

const PosBody = ({ mainForm: receiptNoteForm }: PosBodyProps) => {
  // const receiptNoteForm = useFormContext<ReceiptNoteForm>();

  const stockJournal = receiptNoteForm.watch('stockJournal')
  const stockJournalForm = useForm<StockJournalForm>({
    resolver: zodResolver(stockJournalSchema) as Resolver<StockJournalForm>,
    defaultValues: {
      ...stockJournal,
      stockJournalEntries: stockJournal?.stockJournalEntries ?? [],
    },
  })
  // const stockJournalTotal = useMemo(() => {
  //     const entries = (stockJournalForm.watch("stockJournalEntries") || []).filter(
  //         (entry): entry is StockJournalEntryForm => entry !== undefined && entry !== null
  //     );
  //     const totalAmount = entries.reduce((acc: number, entry: StockJournalEntryForm) => {
  //         const amount = Number(entry.amount) || 0;
  //         acc += amount;
  //         return acc;
  //     }, 0);
  //     return {
  //         totalAmount
  //     }
  // }, [stockJournalForm.watch("stockJournalEntries")])

  const stockJournalEntries = useWatch({
    control: stockJournalForm.control,
    name: 'stockJournalEntries',
  })

  const stockJournalTotal = useMemo(() => {
    const entries = stockJournalEntries || []
    const totalAmount = entries.reduce((acc, entry) => {
      return acc + (Number(entry?.amount) || 0)
    }, 0)

    return { totalAmount }
  }, [stockJournalEntries])

  // Sync: parent -> child (when the parent form value changes externally).
  // Skipping the initial snapshot stops the StrictMode double-effect from
  // resetting the sub-form with a stale value and wiping auto-added rows
  // (e.g. the first entry row appended on mount).
  const parentStockJournal = receiptNoteForm.watch('stockJournal')
  const lastParentStockJournalRef = useRef<unknown>(null)
  useEffect(() => {
    const currentParent = receiptNoteForm.getValues('stockJournal')
    if (lastParentStockJournalRef.current === null) {
      lastParentStockJournalRef.current = currentParent
      return
    }
    if (!isEqual(lastParentStockJournalRef.current, currentParent)) {
      lastParentStockJournalRef.current = currentParent
      if (
        currentParent &&
        !isEqual(currentParent, stockJournalForm.getValues())
      ) {
        stockJournalForm.reset(currentParent)
      }
    }
  }, [parentStockJournal, receiptNoteForm, stockJournalForm])

  useEffect(() => {
    // when child changes, update parent
    const subscription = stockJournalForm.watch((value) => {
      const currentParent = receiptNoteForm.getValues('stockJournal')
      if (!isEqual(currentParent, value)) {
        receiptNoteForm.setValue('stockJournal', value as StockJournalForm, {
          shouldValidate: false,
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [receiptNoteForm, stockJournalForm])

  if (
    receiptNoteForm.watch('transactionLedger.id') === undefined ||
    receiptNoteForm.watch('partyLedger.id') === undefined
  ) {
    return <StockJournalUnloadedView />
  }
  // console.log("PosBody Level: ", receiptNoteForm.watch("stockJournal"), stockJournalForm.watch("stockJournalEntries"));
  return (
    <div className="flex flex-col w-full gap-0   items-start overflow-y-scroll px-2  ">
      <div className="grid grid-cols-1 w-full gap-2   items-start overflow-y-scroll px-2  ">
        <Form {...stockJournalForm}>
          <StockJournal stockJournalForm={stockJournalForm} />
        </Form>
      </div>
      {stockJournalTotal && stockJournalTotal.totalAmount > 0 && (
        <div className="w-full flex justify-end  font-bold">
          <div className="grid grid-cols-[1fr_200px_120px] gap-4 text-right ">
            <div>Item Total: </div>
            <div className="pr-4">
              {stockJournalTotal.totalAmount.toFixed(2)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PosBody

const StockJournalUnloadedView = () => {
  const { config } = useTransaction()
  return (
    <div className="flex flex-col w-full gap-0   items-start overflow-y-scroll px-2  ">
      <div className="grid grid-cols-1 w-full gap-2   items-start overflow-y-scroll px-2  ">
        <div className="">
          <div
            className="border-inside-all 
                    grid grid-rows-1 grid-cols-[1fr_280px_130px_70px_70px_180px_120px] 
                    bg-gray-300 text-center border-border"
          >
            <div className="border-r-0!  ">Particulars</div>

            {config.find((c) => c.key === 'show_actual_and_billing_quantity')
              ?.value ? (
              <div className="grid grid-rows-2 border-0!">
                <div className="border-b-0!  ">Quantity</div>
                <div className="grid grid-cols-2 items-center">
                  <div className="border-y-0! border-x-0!  ">Actual</div>
                  <div className="border-y-0! border-r-0!  ">Billing</div>
                </div>
              </div>
            ) : (
              <div>Quantity</div>
            )}
            <div className="border-l-0!">Rate</div>
            <div className="border-l-0!">per</div>
            <div className="border-l-0!">disc%</div>
            <div className="border-l-0!">Amount</div>
            <div className="border-l-0!">Action</div>
          </div>
        </div>
        <div className="text-center text-gray-500 py-20">
          Please select both Party A/c and Purchase Ledger to add Stock Journal
          Entries.
        </div>
      </div>
    </div>
  )
}

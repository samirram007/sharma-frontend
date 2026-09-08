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
                    bg-gray-300 dark:bg-gray-900/30 text-center border-border"
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
        <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-6">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg
              className="w-16 h-16 mb-4 text-amber-500 dark:text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Complete the Required Fields
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
              Please select both{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Party A/c
              </span>{' '}
              and{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                Stock Ledger
              </span>{' '}
              to add Stock Journal Entries.
            </p>
            <div className="flex flex-row justify-center items-center gap-4 mt-4 w-full max-w-md">
              <div className="flex flex-col items-center gap-2">
                <div className="flex flex-row items-center gap-2">
                  <svg
                    className="w-5 h-5 text-blue-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 00-3-3v8a3 3 0 003 3h10a3 3 0 003-3v-8z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Party A/c:
                  </span>
                </div>
                <span className="text-sm text-gray-400 dark:text-gray-500">
                  Select party from dropdown
                </span>
              </div>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <div className="flex flex-col items-center gap-2">
                <div className="flex flex-row items-center gap-2">
                  <svg
                    className="w-5 h-5 text-purple-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Stock Ledger:
                  </span>
                </div>
                <span className="text-sm text-gray-400 dark:text-gray-500">
                  Select stock ledger from dropdown
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

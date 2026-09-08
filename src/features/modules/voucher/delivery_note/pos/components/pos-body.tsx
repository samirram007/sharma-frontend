import { Form } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import isEqual from 'lodash/isEqual'
import { useEffect, useMemo, useRef } from 'react'
import { useForm, useWatch, type Resolver } from 'react-hook-form'
import type { DeliveryNoteForm } from '../../data/schema'
import {
  stockJournalSchema,
  type StockJournalForm,
} from '../../../data-schema/voucher-schema'
import StockJournal from '../../../components/stock-journal'
import { usePos } from '../../../contexts/pos-context'

type PosBodyProps = {
  mainForm: ReturnType<typeof useForm<DeliveryNoteForm>>
}

const PosBody = ({ mainForm: deliveryNoteForm }: PosBodyProps) => {
  // const deliveryNoteForm = useFormContext<DeliveryNoteForm>();
  const { movementType } = usePos()
  const stockJournal = deliveryNoteForm.watch('stockJournal')
  const stockJournalForm = useForm<StockJournalForm>({
    resolver: zodResolver(stockJournalSchema) as Resolver<StockJournalForm>,
    defaultValues: {
      ...stockJournal,
      type: movementType,
      stockJournalEntries: stockJournal?.stockJournalEntries ?? [],
    },
  })

  const stockJournalEntries = useWatch({
    control: stockJournalForm.control,
    name: 'stockJournalEntries',
  })

  const stockJournalTotal = useMemo(() => {
    const entries = stockJournalEntries
    const totalAmount = entries.reduce((acc, entry) => {
      return acc + (Number(entry?.amount) || 0)
    }, 0)

    return { totalAmount }
  }, [stockJournalEntries])

  // Sync: parent -> child (when the parent form value changes externally).
  // Skipping the initial snapshot stops the StrictMode double-effect from
  // resetting the sub-form with a stale value and wiping auto-added rows
  // (e.g. the first entry row appended on mount).
  const parentStockJournal = deliveryNoteForm.watch('stockJournal')
  const lastParentStockJournalRef = useRef<unknown>(null)
  useEffect(() => {
    const currentParent = deliveryNoteForm.getValues('stockJournal')
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
  }, [parentStockJournal, deliveryNoteForm, stockJournalForm])

  useEffect(() => {
    // when child changes, update parent
    const subscription = stockJournalForm.watch((value) => {
      const currentParent = deliveryNoteForm.getValues('stockJournal')
      if (!isEqual(currentParent, value)) {
        deliveryNoteForm.setValue('stockJournal', value as StockJournalForm, {
          shouldValidate: false,
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [deliveryNoteForm, stockJournalForm])

  if (
    deliveryNoteForm.watch('transactionLedger.id') === undefined ||
    deliveryNoteForm.watch('partyLedger.id') === undefined
  ) {
    return <StockJournalUnloadedView />
  }
  // console.log("PosBody Level: ", deliveryNoteForm.watch("stockJournal"), stockJournalForm.watch("stockJournalEntries"));
  return (
    <div className="flex flex-col w-full gap-0   items-start overflow-y-scroll px-2  ">
      <div className="grid grid-cols-1 w-full gap-2   items-start overflow-y-scroll px-2  ">
        <Form {...stockJournalForm}>
          <StockJournal stockJournalForm={stockJournalForm} />
        </Form>
      </div>
      {stockJournalTotal.totalAmount > 0 && (
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
  return (
    <div className="flex flex-col w-full gap-0 items-start overflow-y-scroll px-2">
      <div className="grid grid-cols-1 w-full gap-2 items-start overflow-y-scroll px-2">
        <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
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
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
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

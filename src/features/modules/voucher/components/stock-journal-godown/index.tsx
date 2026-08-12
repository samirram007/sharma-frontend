import type { Godown } from '@/features/modules/godown/data/schema'
import type { StockItem } from '@/features/modules/stock_item/data/schema'
import type { StockUnit } from '@/features/modules/stock_unit/data/schema'
import { useFieldArray, type UseFormReturn } from 'react-hook-form'

import { useEffect, useMemo } from 'react'

import { usePosJournalEntryGodown } from '../../contexts/pos-journal-entry-godown-context'
import StockJournalGodownEntry from './entry-test'
import type {
  StockJournalEntryForm,
  StockJournalGodownEntryForm,
} from '../../data-schema/voucher-schema'
import { stockJournalGodownEntryDefaultValues } from '../../data-schema/data'
import { usePos } from '../../contexts/pos-context'

export type StockJournalGodownProps = {
  stockItem: StockItem
  godowns: Godown[]
  stockUnits: StockUnit[]
  handleOnClickItemAddEntry: () => void
  stockJournalEntryForm: UseFormReturn<StockJournalEntryForm>
}
const StockJournalGodowns = (props: StockJournalGodownProps) => {
  // const stockJournalEntryForm = useFormContext<StockJournalEntryForm>();
  const { movementType } = usePos()
  const { stockJournalEntryForm } = props
  const {
    addGodownEntryButtonRef,
    addGodownButtonVisible,
    setAddGodownButtonVisible,
  } = usePosJournalEntryGodown()
  const { fields, append, remove } = useFieldArray({
    control: stockJournalEntryForm.control,
    name: 'stockJournalGodownEntries',
  })

  const stockJournalGodownEntries = stockJournalEntryForm.watch(
    'stockJournalGodownEntries',
  )

  const computedTotals = useMemo(() => {
    // console.log("checkMemo")
    const entries = stockJournalGodownEntries || []

    if (entries.length === 0) {
      return {
        actualQuantity: 0,
        billingQuantity: 0,
        rate: 0,
        amount: 0,
        discount: 0,
        discountPercentage: 0,
      }
    }

    const totals = entries.reduce(
      (
        acc: {
          actualQuantity: number
          billingQuantity: number
          totalRateWeighted: number
          totalAmount: number
          discount: number
          discountPercentage: number
        },
        entry: any,
      ) => {
        const actualQty = Number(entry.actualQuantity) || 0
        const billingQty = Number(entry.billingQuantity) || 0
        const rate = Number(entry.rate) || 0
        const amount = Number(entry.amount) || 0
        const discount = Number(entry.discount) || 0
        const discountPercentage = Number(entry.discountPercentage) || 0

        acc.actualQuantity += actualQty
        acc.billingQuantity += billingQty
        acc.totalRateWeighted += rate * billingQty
        acc.totalAmount += amount
        acc.discount += discount
        acc.discountPercentage += discountPercentage

        return acc
      },
      {
        actualQuantity: 0,
        billingQuantity: 0,
        totalRateWeighted: 0,
        totalAmount: 0,
        discount: 0,
        discountPercentage: 0,
      },
    )

    const avgRate =
      totals.billingQuantity > 0
        ? totals.totalRateWeighted / totals.billingQuantity
        : 0

    return {
      actualQuantity: totals.actualQuantity,
      billingQuantity: totals.billingQuantity,
      rate: avgRate,
      amount: totals.totalAmount,
      discount: totals.discount,
      discountPercentage: totals.discountPercentage,
    }
  }, [JSON.stringify(stockJournalGodownEntries)])

  const handleGodownEntryAdd = () => {
    // const lastEntry = fields[fields.length - 1];
    // console.log("Last Entry: ", lastEntry)
    const hasZeroValue = stockJournalEntryForm
      .getValues('stockJournalGodownEntries')
      ?.some((entry: any) => Number(entry.amount) === 0)
    if (hasZeroValue) {
      stockJournalEntryForm.setFocus(
        `stockJournalGodownEntries.${fields.length - 1}.godownId`,
      )
      return
    }

    // New godown rows inherit the movement type of their parent stock entry
    const entryMovementType =
      stockJournalEntryForm.getValues('movementType') ?? movementType

    append({
      ...stockJournalGodownEntryDefaultValues,
      movementType: entryMovementType,
    } as StockJournalGodownEntryForm)
    setAddGodownButtonVisible?.(false)
  }

  useEffect(() => {
    // Prevent infinite update loop by checking if values changed
    const currentValues = stockJournalEntryForm.getValues([
      'actualQuantity',
      'billingQuantity',
      'rate',
      'amount',
      'discount',
      'discountPercentage',
    ])
    // console.log("hasChanged", computedTotals, currentValues);
    const hasChanged =
      computedTotals.actualQuantity !== currentValues[0] ||
      computedTotals.billingQuantity !== currentValues[1] ||
      computedTotals.rate !== currentValues[2] ||
      computedTotals.amount !== currentValues[3] ||
      computedTotals.discount !== currentValues[4] ||
      computedTotals.discountPercentage !== currentValues[5]

    // console.log("hasChanged", hasChanged)
    if (hasChanged && computedTotals.amount > 0) {
      stockJournalEntryForm.setValue(
        'actualQuantity',
        computedTotals.actualQuantity,
      )
      stockJournalEntryForm.setValue(
        'billingQuantity',
        computedTotals.billingQuantity,
      )
      stockJournalEntryForm.setValue('rate', computedTotals.rate)
      stockJournalEntryForm.setValue('amount', computedTotals.amount)
      stockJournalEntryForm.setValue('discount', computedTotals.discount)
      stockJournalEntryForm.setValue(
        'discountPercentage',
        computedTotals.discountPercentage,
      )
    }
  }, [computedTotals, stockJournalGodownEntries, stockJournalEntryForm])
  useEffect(() => {
    if (fields.length === 0 && props.stockItem) {
      handleGodownEntryAdd()
    }
  }, [props.stockItem])
  // console.log("HOW: ", stockJournalGodownEntries, stockJournalEntryForm.watch("stockJournalGodownEntries"));
  return (
    <div className=" pl-12 ">
      {/* {fields?.length} */}
      {fields.map((field, index) => (
        <div key={field.id} className="w-full flex  items-center gap-0">
          <StockJournalGodownEntry
            key={field.id}
            index={index}
            remove={remove}
            stockItem={props.stockItem}
            godowns={props.godowns}
            stockUnits={props.stockUnits}
            stockJournalEntryForm={stockJournalEntryForm}
            handleGodownEntryAdd={handleGodownEntryAdd}
            handleOnClickItemAddEntry={props.handleOnClickItemAddEntry}
          />
        </div>
      ))}
      {(addGodownButtonVisible || fields.length === 0) && props.stockItem && (
        <button
          type="button"
          ref={addGodownEntryButtonRef}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded my-2"
          onClick={handleGodownEntryAdd}
        >
          + Add GodownEntry
        </button>
      )}
    </div>
  )
}

export default StockJournalGodowns

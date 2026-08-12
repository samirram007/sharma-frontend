import FormInputField from '@/components/form-input-field'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFocusArea } from '@/core/hooks/useFocusArea'
import { useQuantityDecimals } from '@/hooks/use-quantity-decimals'
import type { Godown } from '@/features/modules/godown/data/schema'
import type { StockItem } from '@/features/modules/stock_item/data/schema'
import type { StockUnit } from '@/features/modules/stock_unit/data/schema'
import { useTransaction } from '@/features/transactions/context/transaction-context'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, type Resolver, type UseFormReturn } from 'react-hook-form'
import { MdKeyboardReturn } from 'react-icons/md'
import { TbRowRemove } from 'react-icons/tb'

import { GodownCombobox } from '../dropdown/godown-combo-box'
import { focusNextFocusable as advanceToNextFocusable } from '@/lib/focus-utils'
import {
  stockJournalGodownEntrySchema,
  type StockJournalEntryForm,
  type StockJournalGodownEntryForm,
} from '../../data-schema/voucher-schema'
import BatchSelection from './batch-selection'
import { usePos } from '../../contexts/pos-context'
import { lowerCase } from 'lodash'
import { stockJournalGodownEntryDefaultValues } from '../../data-schema/data'

type StockJournalGodownEntryFormProps = {
  index: number
  remove: (index: number) => void
  stockItem: StockItem
  godowns: Godown[]
  stockUnits: StockUnit[]
  handleGodownEntryAdd: () => void
  handleOnClickItemAddEntry: () => void
  stockJournalEntryForm: UseFormReturn<StockJournalEntryForm>
}
function round2(value: number) {
  return Math.round(value * 100) / 100
}

/**
 * Advances focus to the next visible field, deferred to the next frame so the
 * DOM settles after the value is committed. Chains Enter-key data entry:
 * batch → qty → rate → amount.
 */
const focusNextFocusable = () => {
  requestAnimationFrame(() => advanceToNextFocusable())
}

const StockJournalGodownEntry = (props: StockJournalGodownEntryFormProps) => {
  const {
    index,
    remove,
    stockItem,
    godowns,
    stockUnits,
    handleGodownEntryAdd,
    handleOnClickItemAddEntry,
    stockJournalEntryForm,
  } = props

  const godownEntryRef = useRef<HTMLDivElement>(null)
  const { config } = useTransaction()
  const { movementType, perGodownRowMovementType } = usePos()
  // Per-entry movement type (Manufacturing Journal) falls back to the voucher-level context type
  const entryMovementType =
    stockJournalEntryForm.watch('movementType') ?? movementType
  const show_actual_and_billing_quantity = config.find(
    (c) => c.key === 'show_actual_and_billing_quantity',
  )?.value
  // const show_alternate_unit = config.find(c => c.key === 'show_alternate_unit')?.value
  useFocusArea(godownEntryRef as React.RefObject<HTMLElement>)
  // useRestrictFocusToRef(godownEntryRef as React.RefObject<HTMLElement>);
  // const stockJournalEntryForm = useFormContext<StockJournalEntryForm>();
  const entryPath = `stockJournalGodownEntries.${index}` as const

  const defaultValues = useMemo(() => {
    const base = stockJournalEntryForm.watch(entryPath) ?? {
      ...stockJournalGodownEntryDefaultValues,
      movementType: lowerCase(movementType),
    }

    return {
      ...base,
      movementType: base.movementType ?? lowerCase(movementType),
      stockItem: base.stockItem ?? stockItem,
      actualQuantity: base.actualQuantity ?? 0,
      billingQuantity: base.billingQuantity ?? 0,
      rate: base.rate ? base.rate : stockItem?.standardCost!,
      discountPercentage: base.discountPercentage ?? 0,
      discount: base.amount ?? 0,
      amount: base.amount ?? 0,
      batchNo: base.batchNo ?? '',
      mfgDate: base.mfgDate ? new Date(base.mfgDate) : undefined,
      expiryDate: base.expiryDate ? new Date(base.expiryDate) : undefined,
      rateUnit:
        stockJournalEntryForm.watch('rateUnit') ?? stockItem?.stockUnit!,
    }
    // Only recompute when entryPath changes (e.g., switching edit item)
  }, [entryPath])

  const stockJournalGodownEntryForm = useForm<StockJournalGodownEntryForm>({
    resolver: zodResolver(
      stockJournalGodownEntrySchema,
    ) as Resolver<StockJournalGodownEntryForm>,
    defaultValues,
    mode: 'onChange',
  })
  // Per-godown-row movement type (Transfer Voucher) falls back to the entry-level type.
  // For other vouchers (Receipt/Delivery/Manufacturing) keep using the entry-level type
  // so the entry movement toggle stays the single source of truth.
  const rowMovementType = perGodownRowMovementType
    ? (stockJournalGodownEntryForm.watch('movementType') ?? entryMovementType)
    : entryMovementType
  const rateUnitRatio = stockJournalEntryForm.watch('rateUnitRatio') ?? 1
  // const actualQuantity = stockJournalGodownEntryForm.watch("actualQuantity") ?? 1;
  // stockJournalGodownEntryForm.setValue("billingQuantity", actualQuantity * rateUnitRatio, { shouldValidate: true });
  const billingQuantity =
    stockJournalGodownEntryForm.watch('billingQuantity') ?? 1
  const rate = stockJournalGodownEntryForm.watch('rate') ?? 1
  const discountPercentage =
    stockJournalGodownEntryForm.watch('discountPercentage') ?? 0
  stockJournalGodownEntryForm.setValue(
    'discount',
    Number(rateUnitRatio ?? 0) *
      Number(billingQuantity ?? 0) *
      Number(rate ?? 0) *
      (Number(discountPercentage ?? 0) / 100),
    { shouldValidate: true },
  )
  // const rateUnit = stockJournalEntryForm.watch("rateUnit") ?? null;

  const amount = round2(
    Number(rateUnitRatio ?? 0) *
      Number(billingQuantity ?? 0) *
      Number(rate ?? 0) -
      Number(stockJournalGodownEntryForm.getValues('discount')),
  )

  stockJournalGodownEntryForm.setValue('amount', amount, {
    shouldValidate: true,
  })

  const handleRemove = () => {
    if (index !== 0) {
      remove(index)
    }
    handleOnClickItemAddEntry()
    // return
  }

  const handleSubmit = () => {
    const data = stockJournalGodownEntryForm.getValues()
    if (!data.godownId) {
      stockJournalGodownEntryForm.setFocus('godownId')
      return
    }
    if (!data.amount) {
      //   handleRemove();
      return
    }
    stockJournalEntryForm.setValue(entryPath, data, { shouldValidate: true })
    handleGodownEntryAdd()
    return
    // stockJournalEntryForm.reset({});
    //  console.log("Submitted Godown Entry:", stockJournalEntryForm.getValues());
  }
  const handleAmountBlur = () => {
    const data = stockJournalGodownEntryForm.getValues()
    stockJournalEntryForm.setValue(entryPath, data, { shouldValidate: true })
  }
  useEffect(() => {
    if (amount > 0) {
      const data = stockJournalGodownEntryForm.getValues()
      stockJournalEntryForm.setValue(entryPath, data, { shouldValidate: true })
    }
  }, [
    amount,
    stockJournalGodownEntryForm.watch('batchNo'),
    stockJournalGodownEntryForm.watch('godownId'),
  ])
  // console.log("godowns", godowns)
  return (
    <Form {...stockJournalGodownEntryForm}>
      <div className="w-full pl-1" ref={godownEntryRef}>
        <div className="grid grid-cols-[1fr_280px_280px_130px_70px_70px_180px_120px]  ">
          <div className="flex flex-col items-stretch gap-1 pr-2">
            <GodownCombobox
              stockJournalGodownEntryForm={stockJournalGodownEntryForm}
              stockItem={stockItem}
              godowns={godowns}
              handleRemove={handleRemove}
            />
            {perGodownRowMovementType && (
              <GodownMovementToggle
                stockJournalGodownEntryForm={stockJournalGodownEntryForm}
                stockJournalEntryForm={stockJournalEntryForm}
                entryPath={entryPath}
              />
            )}
          </div>

          {lowerCase(rowMovementType) === 'in' ? (
            stockItem?.isMaintainBatch ? (
              <div
                className={cn(
                  '  border-0!',
                  stockItem?.trackManufacturingDate || stockItem?.useExpiryDate
                    ? 'grid  grid-rows-2  '
                    : '',
                )}
              >
                <div
                  className="border-b-0! w-full  "
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      // Batch → Mfg → Expiry → Quantity:
                      // keep the IN row keyboard-only.
                      focusNextFocusable()
                    }
                  }}
                >
                  <FormInputField
                    type="text"
                    form={stockJournalGodownEntryForm}
                    label="Batch: "
                    gapClass="grid grid-cols-[40px_1fr] gap-0  "
                    name="batchNo"
                  />
                </div>

                <div className="flex flex-col justify-start">
                  <div className="grid grid-cols-2 items-center justify-start  ">
                    <div className="border-y-0! border-x-0! pr-1 ">
                      {stockItem?.trackManufacturingDate && (
                        <div className="grid grid-cols-[30px_1fr] justify-start items-center">
                          <Label>Mfg:</Label>
                          <DateBox
                            form={stockJournalGodownEntryForm}
                            name="mfgDate"
                          />
                        </div>
                      )}
                    </div>
                    <div className="border-y-0! border-r-0!   pl-2">
                      {stockItem?.useExpiryDate && (
                        <div className="grid grid-cols-[30px_1fr] justify-end items-center">
                          <Label>Exp:</Label>
                          <DateBox
                            form={stockJournalGodownEntryForm}
                            name="expiryDate"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div></div>
            )
          ) : (
            <BatchSelection
              form={stockJournalGodownEntryForm}
              stockItem={stockItem}
              godownId={Number(stockJournalGodownEntryForm.watch('godownId'))}
              rowIndex={index}
            />
          )}

          <div className="grid grid-rows-1 border-0!">
            <div className="grid grid-cols-2 items-start">
              <div
                className={cn(
                  'border-y-0! border-x-0! ',
                  show_actual_and_billing_quantity || 'col-span-2',
                )}
              >
                <QuantityBox
                  form={stockJournalGodownEntryForm}
                  stockUnits={stockUnits}
                  stockItem={stockItem}
                  name="actualQuantity"
                />
              </div>
              {show_actual_and_billing_quantity ? (
                <div className="border-y-0! border-x-0!  ">
                  <BillingQuantityBox
                    form={stockJournalGodownEntryForm}
                    stockUnits={stockUnits}
                    stockItem={stockItem}
                    name="billingQuantity"
                  />
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
          <div>
            <RateBox
              form={stockJournalGodownEntryForm}
              stockJournalEntryForm={stockJournalEntryForm}
              stockUnits={stockUnits}
              stockItem={stockItem}
              name="rate"
            />
          </div>
          <div className="text-center">
            {stockJournalGodownEntryForm.watch('rateUnit.code')}
          </div>
          <div className="flex items-center justify-end pr-3">
            {Number(
              stockJournalGodownEntryForm.watch('discountPercentage') ?? 0,
            ).toFixed(2)}
          </div>
          <div>
            <AmountBox
              form={stockJournalGodownEntryForm}
              onEnter={handleSubmit}
              onBlurCommit={handleAmountBlur}
            />
          </div>
          <div className="flex flex-row justify-end items-start gap-4 px-4">
            <div
              tabIndex={-1}
              className="border-0  h-6 focus:bg-black focus:text-white"
              onClick={handleSubmit}
            >
              <MdKeyboardReturn />
            </div>
            <div
              tabIndex={-1}
              className="h-6 focus:bg-black focus:text-white"

              onClick={() => remove(index)}
            >
              <TbRowRemove className=" text-red-700 h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </Form>
  )
}

export default StockJournalGodownEntry

type DateBoxProps = {
  form: UseFormReturn<StockJournalGodownEntryForm>

  name: keyof StockJournalGodownEntryForm
}

const DateBox = (props: DateBoxProps) => {
  const { form, name } = props
  const [displayValue, setDisplayValue] = useState<string | null>(
    form.getValues(name)?.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }),
  )

  const parseAndFormatDate = (input: string): Date | null => {
    if (!input) return null
    console.log('INPUT: ', name, input)
    const now = new Date()
    const parts = input.split(/[./-]/).map((p) => p.trim())

    let day = Number(parts[0])
    let month = parts[1] ? Number(parts[1]) - 1 : now.getMonth() // month index
    let year =
      parts[2] && parts[2].length === 2
        ? 2000 + Number(parts[2])
        : parts[2]
          ? Number(parts[2])
          : now.getFullYear()

    if (isNaN(day) || day < 1 || day > 31) return null
    if (isNaN(month) || month < 0 || month > 11) return null
    if (isNaN(year) || year < 1000) return null

    return new Date(year, month, day)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()

      const parsed = parseAndFormatDate(displayValue!)
      if (parsed) {
        form.setValue(name, parsed, { shouldValidate: true, shouldDirty: true })
        const formatted = parsed.toLocaleDateString('en-GB').replace(/\//g, '-') // DD-MM-YYYY
        setDisplayValue(formatted)
      }
      // Mfg → Expiry → Quantity: keep the IN row keyboard-only.
      focusNextFocusable()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
      setDisplayValue('')
      form.setValue(name, null, { shouldValidate: true, shouldDirty: true })
      return
    }
    setDisplayValue(e.target.value)
  }
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.preventDefault()

    const parsed = parseAndFormatDate(displayValue!)
    if (parsed) {
      form.setValue(name, parsed, { shouldValidate: true, shouldDirty: true })
      const formatted = parsed.toLocaleDateString('en-GB').replace(/\//g, '-') // DD-MM-YYYY
      setDisplayValue(formatted)
    }
  }
  return (
    <>
      <Input
        type="text"
        placeholder="__-__-____"
        value={displayValue!}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
      <span className="hidden">
        <FormInputField
          type="date"
          form={form}
          label=""
          noLabel
          gapClass="grid-cols-[1fr] gap-0  "
          name={name}
        />
      </span>
    </>
  )
}

type RateBoxProps = {
  form: UseFormReturn<StockJournalGodownEntryForm>
  stockJournalEntryForm: UseFormReturn<StockJournalEntryForm>
  stockItem: StockItem
  stockUnits: StockUnit[]
  name: keyof StockJournalGodownEntryForm
}
const RateBox = (props: RateBoxProps) => {
  const { form, stockItem, name, stockUnits, stockJournalEntryForm } = props
  const [boxValue, setBoxValue] = useState<string>('')
  // const alternateUnitValue = stockItem.alternateUnitValue;
  const conversionFactors = useMemo(() => {
    const conversionFactorsTemp: ConversionFactor[] = []

    if (
      stockItem?.stockUnit &&
      stockItem?.stockUnit?.unitType!.toLowerCase() === 'simple'
    ) {
      const BaseUnitData = stockUnits?.find(
        (su: StockUnit) => su.id === stockItem.stockUnitId,
      )
      conversionFactorsTemp.push({
        tag: 'base',
        stockUnit: BaseUnitData!,
        isBaseUnit: true,
        factor: 1,
        baseMultiplier: 1,
      })
    } else {
      const primaryUnit = stockUnits.find(
        (su: StockUnit) => su.id === stockItem.stockUnit?.primaryStockUnitId,
      )
      conversionFactorsTemp.push({
        tag: 'base',
        stockUnit: primaryUnit!,
        isBaseUnit: true,
        factor: 1,
        baseMultiplier: 1,
      })

      const secondaryUnit = stockUnits.find(
        (su: StockUnit) => su.id === stockItem.stockUnit?.secondaryStockUnitId,
      )
      const secondaryFactor = stockItem.stockUnit?.conversionFactor
      conversionFactorsTemp.push({
        tag: 'base',
        stockUnit: secondaryUnit!,
        isBaseUnit: false,
        factor: secondaryFactor!,
        baseMultiplier: secondaryFactor!,
      })
    }

    if (stockItem.alternateStockUnitId) {
      const alternateUnit = stockUnits?.find(
        (su: StockUnit) => su.id === stockItem.alternateStockUnitId,
      )

      const factor = stockItem.baseUnitValue! / stockItem.alternateUnitValue!
      if (alternateUnit?.unitType === 'simple') {
        conversionFactorsTemp.push({
          tag: 'alternate',
          stockUnit: alternateUnit!,
          isBaseUnit: false,
          factor: factor,
          baseMultiplier: factor,
        })
      } else {
        const primaryUnit = stockUnits.find(
          (su: StockUnit) =>
            su.id === stockItem.alternateStockUnit?.primaryStockUnitId,
        )
        const primaryFactor =
          factor * stockItem?.alternateStockUnit?.conversionFactor!
        const primaryBaseMultiplier =
          stockItem.alternateUnitValue! /
          stockItem.baseUnitValue! /
          stockItem?.alternateStockUnit?.conversionFactor!
        conversionFactorsTemp.push({
          tag: 'alternate',
          stockUnit: primaryUnit!,
          isBaseUnit: false,
          factor: primaryFactor,
          baseMultiplier: primaryBaseMultiplier,
        })

        const secondaryFactor = factor
        const secondaryUnit = stockUnits.find(
          (su: StockUnit) =>
            su.id === stockItem.alternateStockUnit?.secondaryStockUnitId,
        )
        const secondaryBaseMultiplier =
          stockItem.alternateUnitValue! / stockItem.baseUnitValue!
        conversionFactorsTemp.push({
          tag: 'alternate',
          stockUnit: secondaryUnit!,
          isBaseUnit: false,
          factor: secondaryFactor,
          baseMultiplier: secondaryBaseMultiplier,
        })
      }
    }
    return conversionFactorsTemp
  }, [stockItem.id, stockUnits])

  const parseRateWithPerUnit = (
    input: string,
  ): { rate: number; unit: StockUnit | null } => {
    // Extract number and unit parts (e.g., "15 m" -> ["15", "m"])
    const match = input
      .trim()
      .match(/^\s*(\d+(?:\.\d+)?)?\s*(?:\/|\bper\b)?\s*([\w\- ]+)?\s*$/i)

    if (!match) {
      return { rate: 0, unit: null }
      // return { rate: stockItem?.standardCost! ?? 1, unit: null };
    }

    const [, rateStr, unitStr] = match
    const rate = Number.parseFloat(rateStr)

    return { rate, unit: unitStr || null }
  }

  const handleBlurOrEnter = () => {
    const { rate, unit: unitStr } = parseRateWithPerUnit(boxValue)

    if (rate === 0) {
      form.setValue(name, 0, { shouldValidate: true })
      form.setValue('rateUnit', null)
      setBoxValue('')
      return
    }

    let finalRate = rate

    // If a unit string was provided, find the matching conversion factor
    if (unitStr) {
      const normalized = unitStr.trim().toLowerCase()
      const regex = new RegExp(normalized, 'i')
      const matchedConversion = conversionFactors?.find(
        (cf: ConversionFactor) => {
          const code = cf?.stockUnit?.code ?? ''
          const name = cf?.stockUnit?.name ?? ''
          return regex.test(code) || regex.test(name)
        },
      )
      // matchedConversion && console.log("matchedConversion:", unitStr, matchedConversion);
      const baseRateUnit = conversionFactors?.find(
        (cf: ConversionFactor) => cf.tag === 'base' && cf.isBaseUnit,
      )

      if (matchedConversion) {
        conversionFactors?.map((cf: ConversionFactor) => {
          if (cf.stockUnit.id === baseRateUnit?.stockUnit.id) {
            cf.rateUnitRatio = 1
          } else if (cf.stockUnit.id === matchedConversion.stockUnit.id) {
            cf.rateUnitRatio =
              matchedConversion.baseMultiplier /
              (baseRateUnit ? baseRateUnit.factor : 1)
          } else {
            cf.stockUnit.id === 'base' &&
              (cf.rateUnitRatio =
                (cf.baseMultiplier * (baseRateUnit ? baseRateUnit.factor : 1)) /
                matchedConversion.baseMultiplier)
            cf.stockUnit.id !== 'base' &&
              (cf.rateUnitRatio =
                (cf.baseMultiplier * (baseRateUnit ? baseRateUnit.factor : 1)) /
                matchedConversion.factor)
          }
        })
      }

      form.setValue(
        'rateUnit',
        matchedConversion?.stockUnit! || stockItem?.stockUnit!,
      )
      const baseRateUnitRatio =
        conversionFactors?.find(
          (cf: ConversionFactor) => cf.tag === 'base' && cf.isBaseUnit,
        )?.rateUnitRatio || 1
      stockJournalEntryForm.setValue('rateUnitRatio', baseRateUnitRatio || null)
    }

    form.setValue(name, finalRate, { shouldValidate: true })
    setBoxValue(!isNaN(finalRate) ? finalRate.toFixed(2) : '1.00')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlurOrEnter()
      // Advance to the next field (qty → rate → amount) so keyboard entry flows forward.
      focusNextFocusable()
    }
  }

  const handleBlur = () => {
    handleBlurOrEnter()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    setBoxValue(rawValue ?? '')
  }
  const baseUnit = useMemo(() => {
    return (
      conversionFactors?.find(
        (cf: ConversionFactor) => cf.tag === 'base' && cf.isBaseUnit,
      )?.stockUnit || null
    )
  }, [conversionFactors])
  const baseUnitCode = baseUnit?.code || ''
  // const basenoOfDecimalPlaces = baseUnit?.noOfDecimalPlaces || 0;
  useEffect(() => {
    const value = form.watch(name)
    if (value) {
      // Rate always displays with exactly 2 decimal places.
      setBoxValue(Number(value).toFixed(2))
    } else {
      setBoxValue('')
    }
  }, [form.watch(name), baseUnitCode])

  return (
    <>
      <Input
        type="number"
        value={boxValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="- - -/MTS"
        className="text-right focus:text-left"
      />
      <div className="hidden">
        <FormInputField
          type="hidden"
          form={form}
          label=""
          gapClass="grid-cols-[0_1fr] gap-0"
          name={name}
        />
        {/* {alternateUnitValue && <div>({alternateUnitValue})</div>} */}
        {conversionFactors.length > 1 && (
          <div className="text-sm text-gray-500 mt-1 flex flex-col justify-start items-end ">
            {conversionFactors.map((cf, index) => (
              <span key={index} className="mx-2">
                <div className="text-xs font-bold">
                  ({form.watch(name) * cf.rateUnitRatio!} {cf.stockUnit.code})
                </div>
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
type QuantityBoxProps = {
  form: UseFormReturn<StockJournalGodownEntryForm>
  stockItem: StockItem
  stockUnits: StockUnit
  name: keyof StockJournalGodownEntryForm
}
type ConversionFactor = {
  tag: 'base' | 'alternate'
  stockUnit: StockUnit
  isBaseUnit: boolean
  factor: number
  baseMultiplier: number
  rateUnitRatio?: number
}
const QuantityBox = (props: QuantityBoxProps) => {
  const { form, stockItem, name, stockUnits } = props
  const { config } = useTransaction()
  const show_alternate_unit = config.find(
    (c) => c.key === 'show_alternate_unit',
  )?.value
  const [boxValue, setBoxValue] = useState<string>('')
  // const alternateUnitValue = stockItem.alternateUnitValue;
  const conversionFactors = useMemo(() => {
    const conversionFactorsTemp: ConversionFactor[] = []

    if (
      stockItem?.stockUnit &&
      stockItem?.stockUnit?.unitType!.toLowerCase() === 'simple'
    ) {
      const BaseUnitData = stockUnits?.find(
        (su: StockUnit) => su.id === stockItem.stockUnitId,
      )
      conversionFactorsTemp.push({
        tag: 'base',
        stockUnit: BaseUnitData!,
        isBaseUnit: true,
        factor: 1,
        baseMultiplier: 1,
      })
    } else {
      const primaryUnit = stockUnits.find(
        (su: StockUnit) => su.id === stockItem.stockUnit?.primaryStockUnitId,
      )
      conversionFactorsTemp.push({
        tag: 'base',
        stockUnit: primaryUnit!,
        isBaseUnit: true,
        factor: 1,
        baseMultiplier: 1,
      })

      const secondaryUnit = stockUnits.find(
        (su: StockUnit) => su.id === stockItem.stockUnit?.secondaryStockUnitId,
      )
      const secondaryFactor = stockItem.stockUnit?.conversionFactor
      conversionFactorsTemp.push({
        tag: 'base',
        stockUnit: secondaryUnit!,
        isBaseUnit: false,
        factor: secondaryFactor!,
        baseMultiplier: secondaryFactor!,
      })
    }

    if (stockItem.alternateStockUnitId) {
      const alternateUnit = stockUnits?.find(
        (su: StockUnit) => su.id === stockItem.alternateStockUnitId,
      )

      const factor = stockItem.baseUnitValue! / stockItem.alternateUnitValue!
      if (alternateUnit?.unitType === 'simple') {
        conversionFactorsTemp.push({
          tag: 'alternate',
          stockUnit: alternateUnit!,
          isBaseUnit: false,
          factor: factor,
          baseMultiplier: factor,
        })
      } else {
        const primaryUnit = stockUnits.find(
          (su: StockUnit) =>
            su.id === stockItem.alternateStockUnit?.primaryStockUnitId,
        )
        const primaryFactor =
          factor * stockItem?.alternateStockUnit?.conversionFactor!
        const primaryBaseMultiplier =
          stockItem.alternateUnitValue! /
          stockItem.baseUnitValue! /
          stockItem?.alternateStockUnit?.conversionFactor!
        conversionFactorsTemp.push({
          tag: 'alternate',
          stockUnit: primaryUnit!,
          isBaseUnit: false,
          factor: primaryFactor,
          baseMultiplier: primaryBaseMultiplier,
        })

        const secondaryFactor = factor
        const secondaryUnit = stockUnits.find(
          (su: StockUnit) =>
            su.id === stockItem.alternateStockUnit?.secondaryStockUnitId,
        )
        const secondaryBaseMultiplier =
          stockItem.alternateUnitValue! / stockItem.baseUnitValue!
        conversionFactorsTemp.push({
          tag: 'alternate',
          stockUnit: secondaryUnit!,
          isBaseUnit: false,
          factor: secondaryFactor,
          baseMultiplier: secondaryBaseMultiplier,
        })
      }
    }
    return conversionFactorsTemp
  }, [stockItem.id, stockUnits])

  const baseUnit = useMemo(() => {
    return (
      conversionFactors?.find(
        (cf: ConversionFactor) => cf.tag === 'base' && cf.isBaseUnit,
      )?.stockUnit || null
    )
  }, [conversionFactors])
  const baseUnitCode = baseUnit?.code || ''
  // Quantity always uses the stock unit's decimal places, defaulting to 2.
  const basenoOfDecimalPlaces = useQuantityDecimals(baseUnit?.noOfDecimalPlaces)

  const parseQuantityWithUnit = (
    input: string,
  ): { quantity: number; unit: StockUnit | null } => {
    // Extract number and unit parts (e.g., "15 m" -> ["15", "m"])
    const match = input.trim().match(/^(\d+\.?\d*)\s*([a-zA-Z]+)?$/)

    if (!match) {
      return { quantity: 0, unit: null }
    }

    const [, quantityStr, unitStr] = match
    const quantity = Number.parseFloat(quantityStr)

    return { quantity, unit: unitStr || null }
  }

  const handleBlurOrEnter = () => {
    const { quantity, unit: unitStr } = parseQuantityWithUnit(boxValue)

    if (quantity === 0) {
      form.setValue(name, 0, { shouldValidate: true })
      form.setValue('billingQuantity', 0, { shouldValidate: true })
      setBoxValue('')
      return
    }

    let finalQuantity = quantity

    // If a unit string was provided, find the matching conversion factor
    if (unitStr) {
      const normalized = unitStr.trim().toLowerCase()
      const regex = new RegExp(normalized, 'i')
      const matchedConversion = conversionFactors?.find(
        (cf: ConversionFactor) => {
          const code = cf?.stockUnit?.code ?? ''
          const name = cf?.stockUnit?.name ?? ''
          return regex.test(code) || regex.test(name)
        },
      )

      if (matchedConversion) {
        // Convert to base unit using the matched conversion factor
        finalQuantity = quantity * matchedConversion.factor
      }
    }

    form.setValue(name, finalQuantity, { shouldValidate: true })
    form.setValue('billingQuantity', finalQuantity, { shouldValidate: true })
    setBoxValue(
      `${finalQuantity.toFixed(basenoOfDecimalPlaces)} ${baseUnitCode}`,
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlurOrEnter()
      // Advance to the next field (qty → rate → amount) so keyboard entry flows forward.
      focusNextFocusable()
    }
  }
  const handleBlur = () => {
    handleBlurOrEnter()
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    setBoxValue(rawValue)
  }

  useEffect(() => {
    const value = form.watch(name)

    if (value) {
      const boxValueStr = `${Number(value).toFixed(basenoOfDecimalPlaces)} ${baseUnitCode}`
      setBoxValue(boxValueStr)
    } else {
      setBoxValue('')
    }
  }, [form.watch(name), baseUnitCode])
  return (
    <>
      <Input
        type="url"

        value={boxValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="e.g., 15 m, 1500 pkg"
        className="value-box flex justify-end items-end"
      />
      <FormInputField
        type="hidden"
        form={form}
        label=""
        gapClass="grid-cols-[0_1fr] gap-0"
        name={name}
      />
      {/* {alternateUnitValue && <div>({alternateUnitValue})</div>} */}
      {show_alternate_unit && conversionFactors.length > 1 && (
        <div className="pr-1 text-xs  text-gray-500 mt-0 space-y-0 gap-0 flex flex-col justify-start items-end ">
          {conversionFactors.map(
            (cf, index) =>
              !cf.isBaseUnit && (
                <span key={index} className="mx-2">
                  <div className="text-xs font-stretch-normal text-gray-400  hover:text-blue-600">
                    ({(form.watch(name) * cf.baseMultiplier).toFixed(2)}{' '}
                    {cf.stockUnit.code})
                  </div>
                </span>
              ),
          )}
        </div>
      )}
    </>
  )
}

const BillingQuantityBox = (props: QuantityBoxProps) => {
  const { form, stockItem, name, stockUnits } = props
  const { config } = useTransaction()
  const show_alternate_unit = config.find(
    (c) => c.key === 'show_alternate_unit',
  )?.value
  const [boxValue, setBoxValue] = useState<string>('')
  // const alternateUnitValue = stockItem.alternateUnitValue;
  const conversionFactors = useMemo(() => {
    const conversionFactorsTemp: ConversionFactor[] = []

    if (
      stockItem?.stockUnit &&
      stockItem?.stockUnit?.unitType!.toLowerCase() === 'simple'
    ) {
      const BaseUnitData = stockUnits?.find(
        (su: StockUnit) => su.id === stockItem.stockUnitId,
      )
      conversionFactorsTemp.push({
        tag: 'base',
        stockUnit: BaseUnitData!,
        isBaseUnit: true,
        factor: 1,
        baseMultiplier: 1,
      })
    } else {
      const primaryUnit = stockUnits.find(
        (su: StockUnit) => su.id === stockItem.stockUnit?.primaryStockUnitId,
      )
      conversionFactorsTemp.push({
        tag: 'base',
        stockUnit: primaryUnit!,
        isBaseUnit: true,
        factor: 1,
        baseMultiplier: 1,
      })

      const secondaryUnit = stockUnits.find(
        (su: StockUnit) => su.id === stockItem.stockUnit?.secondaryStockUnitId,
      )
      const secondaryFactor = stockItem.stockUnit?.conversionFactor
      conversionFactorsTemp.push({
        tag: 'base',
        stockUnit: secondaryUnit!,
        isBaseUnit: false,
        factor: secondaryFactor!,
        baseMultiplier: secondaryFactor!,
      })
    }

    if (stockItem.alternateStockUnitId) {
      const alternateUnit = stockUnits?.find(
        (su: StockUnit) => su.id === stockItem.alternateStockUnitId,
      )

      const factor = stockItem.baseUnitValue! / stockItem.alternateUnitValue!
      if (alternateUnit?.unitType === 'simple') {
        conversionFactorsTemp.push({
          tag: 'alternate',
          stockUnit: alternateUnit!,
          isBaseUnit: false,
          factor: factor,
          baseMultiplier: factor,
        })
      } else {
        const primaryUnit = stockUnits.find(
          (su: StockUnit) =>
            su.id === stockItem.alternateStockUnit?.primaryStockUnitId,
        )
        const primaryFactor =
          factor * stockItem?.alternateStockUnit?.conversionFactor!
        const primaryBaseMultiplier =
          stockItem.alternateUnitValue! /
          stockItem.baseUnitValue! /
          stockItem?.alternateStockUnit?.conversionFactor!
        conversionFactorsTemp.push({
          tag: 'alternate',
          stockUnit: primaryUnit!,
          isBaseUnit: false,
          factor: primaryFactor,
          baseMultiplier: primaryBaseMultiplier,
        })

        const secondaryFactor = factor
        const secondaryUnit = stockUnits.find(
          (su: StockUnit) =>
            su.id === stockItem.alternateStockUnit?.secondaryStockUnitId,
        )
        const secondaryBaseMultiplier =
          stockItem.alternateUnitValue! / stockItem.baseUnitValue!
        conversionFactorsTemp.push({
          tag: 'alternate',
          stockUnit: secondaryUnit!,
          isBaseUnit: false,
          factor: secondaryFactor,
          baseMultiplier: secondaryBaseMultiplier,
        })
      }
    }
    return conversionFactorsTemp
  }, [stockItem.id, stockUnits])

  const parseQuantityWithUnit = (
    input: string,
  ): { quantity: number; unit: StockUnit | null } => {
    // Extract number and unit parts (e.g., "15 m" -> ["15", "m"])
    const match = input.trim().match(/^(\d+\.?\d*)\s*([a-zA-Z]+)?$/)

    if (!match) {
      return { quantity: 0, unit: null }
    }

    const [, quantityStr, unitStr] = match
    const quantity = Number.parseFloat(quantityStr)

    return { quantity, unit: unitStr || null }
  }

  const handleBlurOrEnter = () => {
    const { quantity, unit: unitStr } = parseQuantityWithUnit(boxValue)

    if (quantity === 0) {
      form.setValue(name, 0, { shouldValidate: true })
      setBoxValue('')
      return
    }

    let finalQuantity = quantity

    // If a unit string was provided, find the matching conversion factor
    if (unitStr) {
      const normalized = unitStr.trim().toLowerCase()
      const regex = new RegExp(normalized, 'i')
      const matchedConversion = conversionFactors?.find(
        (cf: ConversionFactor) => {
          const code = cf?.stockUnit?.code ?? ''
          const name = cf?.stockUnit?.name ?? ''
          return regex.test(code) || regex.test(name)
        },
      )

      if (matchedConversion) {
        // Convert to base unit using the matched conversion factor
        finalQuantity = quantity * matchedConversion.factor
      }
    }

    form.setValue(name, finalQuantity, { shouldValidate: true })
    setBoxValue(
      `${finalQuantity.toFixed(basenoOfDecimalPlaces)} ${baseUnitCode}`,
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlurOrEnter()
      // Advance to the next field (qty → rate → amount) so keyboard entry flows forward.
      focusNextFocusable()
    }
  }
  const handleBlur = () => {
    handleBlurOrEnter()
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    setBoxValue(rawValue)
  }
  const baseUnit = useMemo(() => {
    return (
      conversionFactors?.find(
        (cf: ConversionFactor) => cf.tag === 'base' && cf.isBaseUnit,
      )?.stockUnit || null
    )
  }, [conversionFactors])
  const baseUnitCode = baseUnit?.code || ''
  // Quantity always uses the stock unit's decimal places, defaulting to 2.
  const basenoOfDecimalPlaces = useQuantityDecimals(baseUnit?.noOfDecimalPlaces)

  useEffect(() => {
    const value = form.watch(name)
    if (value) {
      setBoxValue(
        `${Number(value).toFixed(basenoOfDecimalPlaces)} ${baseUnitCode}`,
      )
    } else {
      setBoxValue('')
    }
  }, [form.watch(name), baseUnitCode])

  return (
    <>
      <Input
        type="text"
        value={boxValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="e.g., 15 m, 1500 pkg"
        className="text-right  focus:!text-left"
      />
      <FormInputField
        type="hidden"
        form={form}
        label=""
        gapClass="grid-cols-[0_1fr] gap-0"
        name={name}
      />
      {/* {alternateUnitValue && <div>({alternateUnitValue})</div>} */}
      {show_alternate_unit && conversionFactors.length > 1 && (
        <div className="text-xs  text-gray-500 mt-0 space-y-0 gap-0 flex flex-col justify-start items-end ">
          {conversionFactors.map(
            (cf, index) =>
              !cf.isBaseUnit && (
                <span key={index} className="mx-2">
                  <div className="text-xs font-stretch-normal text-gray-400 hover:text-blue-600">
                    ({(form.watch(name) * cf.baseMultiplier).toFixed(2)}{' '}
                    {cf.stockUnit.code})
                  </div>
                </span>
              ),
          )}
        </div>
      )}
    </>
  )
}

/**
 * Amount display box — always renders exactly 2 decimal places.
 * The amount itself is computed from qty × rate − discount; this only
 * controls the visible text while keeping the numeric form value intact.
 */
const AmountBox = ({
  form,
  onEnter,
  onBlurCommit,
}: {
  form: UseFormReturn<StockJournalGodownEntryForm>
  onEnter: () => void
  onBlurCommit: () => void
}) => {
  const [boxValue, setBoxValue] = useState('')

  useEffect(() => {
    setBoxValue(Number(form.watch('amount') ?? 0).toFixed(2))
  }, [form.watch('amount')])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBoxValue(e.target.value)
  }

  const handleBlurOrEnter = () => {
    const parsed = Number(boxValue)
    if (!isNaN(parsed)) {
      form.setValue('amount', parsed, { shouldValidate: true })
      setBoxValue(parsed.toFixed(2))
    } else {
      // Non-numeric / cleared input — restore the committed value.
      setBoxValue(Number(form.getValues('amount') ?? 0).toFixed(2))
    }
  }

  return (
    <Input
      type="text"
      inputMode="decimal"
      value={boxValue}
      onChange={handleChange}
      onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
        e.preventDefault()
        handleBlurOrEnter()
        onBlurCommit()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleBlurOrEnter()
          onEnter()
        }
      }}
      className="text-right"
    />
  )
}

/**
 * Per-godown-row movement type toggle (used by Transfer Voucher).
 * Lets a single item entry move stock OUT of a source godown and
 * IN to a destination godown on the same line.
 */
const GodownMovementToggle = ({
  stockJournalGodownEntryForm,
  stockJournalEntryForm,
  entryPath,
}: {
  stockJournalGodownEntryForm: UseFormReturn<StockJournalGodownEntryForm>
  stockJournalEntryForm: UseFormReturn<StockJournalEntryForm>
  entryPath: `stockJournalGodownEntries.${number}`
}) => {
  const movementType = stockJournalGodownEntryForm.watch('movementType') ?? 'in'

  const handleChange = (next: 'in' | 'out') => {
    stockJournalGodownEntryForm.setValue('movementType', next, {
      shouldDirty: true,
    })
    // Push the row up to the parent entry form so the payload persists it
    stockJournalEntryForm.setValue(
      entryPath,
      stockJournalGodownEntryForm.getValues(),
      {
        shouldValidate: true,
      },
    )
  }

  const baseClass =
    'h-5 flex-1 rounded px-2 text-[10px] font-bold uppercase tracking-wide transition-colors'

  return (
    <div className="flex w-full items-center gap-1">
      <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
        Mov
      </span>
      <button
        type="button"
        onClick={() => handleChange('in')}
        className={`${baseClass} ${
          movementType === 'in'
            ? 'bg-emerald-600 text-white'
            : 'bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-400'
        }`}
      >
        In
      </button>
      <button
        type="button"
        onClick={() => handleChange('out')}
        className={`${baseClass} ${
          movementType === 'out'
            ? 'bg-orange-600 text-white'
            : 'bg-slate-100 text-slate-500 hover:bg-orange-100 hover:text-orange-700 dark:bg-slate-800 dark:text-slate-400'
        }`}
      >
        Out
      </button>
    </div>
  )
}

import { BadgePercent, Calculator, ChevronDown, IndianRupee, PackageOpen, ShieldCheck, Weight } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { type UseFormReturn } from "react-hook-form"
import { useSuspenseQuery } from "@tanstack/react-query"
import { lowerCase } from "lodash"
import { stockUnitQueryOptions } from "@/features/modules/stock_unit/data/queryOptions"
import {
  computeFare,
  computeNetAdjustment,
  computeRateFromCharge,
} from "../../../shared/freight-fare"
import type { VoucherDispatchDetailForm } from "../../../data-schema/voucher-schema"
import type { StockUnit, StockUnitList } from "@/features/modules/stock_unit/data/schema"
import FormInputField from "@/components/form-input-field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// ─── SectionCard ────────────────────────────────────────────────────

export const SectionCard = ({ icon: Icon, title, children, className }: {
  icon?: React.ElementType
  title: string
  children: React.ReactNode
  className?: string
}) => (
  <div className={cn(
    "rounded-lg border border-slate-200 bg-white shadow-xs dark:border-slate-700 dark:bg-slate-900/50",
    className,
  )}>
    <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-900/80">
      {Icon && <Icon className="h-4 w-4 text-slate-500" />}
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
    </div>
    <div className="p-4">
      {children}
    </div>
  </div>
)

// ─── ChargeField ────────────────────────────────────────────────────

const ChargeField = ({ icon: Icon, label, name, form, className, readOnly }: {
  icon: React.ElementType
  label: string
  name: keyof VoucherDispatchDetailForm
  form: UseFormReturn<VoucherDispatchDetailForm>
  className?: string
  /** Auto-computed fields render read-only, mirroring the calculator box. */
  readOnly?: boolean
}) => (
  <div className={cn('space-y-1.5 rounded-lg px-2 py-1.5 transition-all duration-200', className)}>
    <Label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Label>
    {readOnly ? (
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-sm text-slate-400">₹</span>
        </div>
        <Input
          type="text"
          value={(Number(form.watch(name)) || 0).toFixed(2)}
          readOnly
          className="h-10 rounded-lg border-slate-300 bg-slate-50 pl-7 text-right text-sm font-semibold text-blue-700 dark:border-slate-600 dark:bg-slate-800 dark:text-blue-400"
        />
      </div>
    ) : (
      <FormInputField
        type='text'
        noLabel
        gapClass='grid-cols-1 sm:grid-cols-1'
        form={form}
        name={name}
        label={label}
      />
    )}
  </div>
)

// ─── FreightCalculator ──────────────────────────────────────────────

type FreightCalculatorProps = {
  form: UseFormReturn<VoucherDispatchDetailForm>
}

export const FreightCalculator = ({ form }: FreightCalculatorProps) => {
  const { data: stockUnits } = useSuspenseQuery(stockUnitQueryOptions())
  const [chargesOpen, setChargesOpen] = useState(true)

  const freightBasis = form.watch('freightBasis')
  const rate = form.watch('rate')
  const weight = form.watch('weight')
  const loadingCharges = form.watch('loadingCharges')
  const unloadingCharges = form.watch('unloadingCharges')
  const packingCharges = form.watch('packingCharges')
  const insuranceCharges = form.watch('insuranceCharges')
  const otherCharges = form.watch('otherCharges')
  const discount = form.watch('discount')

  // Net adjustment = total additional charges − discount — the same figure the
  // shared FareBreakdown shows on the printed voucher (see ./shared/freight-fare).
  const netAdjustment = computeNetAdjustment({
    loadingCharges,
    unloadingCharges,
    packingCharges,
    insuranceCharges,
    otherCharges,
    discount,
  })

  // Fields with a non-zero value get a highlight so discount & other charges
  // stand out in the calculator (mirrors the highlighted rows on the print).
  const hasOtherCharge = Number(otherCharges) > 0
  const hasDiscount = Number(discount) > 0

  useEffect(() => {
    if (!freightBasis) {
      form.setValue('freightBasis', 'weight')
    }

    // Total fare = base fare + additional charges − discount
    // (see computeFare in ./freight-fare for the exact math + rounding)
    const { baseFare, totalFare } = computeFare({
      rate,
      weight,
      loadingCharges,
      unloadingCharges,
      packingCharges,
      insuranceCharges,
      otherCharges,
      discount,
    })

    form.setValue('freightCharges', baseFare)
    form.setValue('totalFare', totalFare)
  }, [freightBasis, rate, weight, loadingCharges, unloadingCharges, packingCharges, insuranceCharges, otherCharges, discount])

  return (
    <SectionCard icon={Calculator} title={`Freight Calculator (${freightBasis ?? 'weight'}-based)`}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
            <Weight className="h-3.5 w-3.5" />
            Weight (Mt)
          </Label>
          <WeightBox
            form={form} name='weight'
            stockUnits={stockUnits?.data || []}
            freightBasis={freightBasis!}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
            <IndianRupee className="h-3.5 w-3.5" />
            Rate (Per Mt)
          </Label>
          <RateBox
            form={form} name='rate'
            stockUnits={stockUnits?.data || []}
            freightBasis={freightBasis!}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
            <IndianRupee className="h-3.5 w-3.5" />
            Freight Charges (₹)
          </Label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-sm text-slate-400">₹</span>
            </div>
            <FreightChargesBox form={form} />
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setChargesOpen(!chargesOpen)}
          className="mb-3 flex w-full items-center justify-between gap-2 text-left"
        >
          <div className="flex items-center gap-2">
            <PackageOpen className="h-4 w-4 text-slate-500" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Additional Charges
            </h4>
            {!chargesOpen && netAdjustment !== 0 && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                ₹{netAdjustment.toFixed(2)}
              </span>
            )}
          </div>
          <ChevronDown
            className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
              chargesOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
        <div
          className={`overflow-hidden transition-all duration-200 ${
            chargesOpen ? 'max-h-[40rem] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <ChargeField icon={PackageOpen} label='Loading (₹)' name='loadingCharges' form={form} />
            <ChargeField icon={PackageOpen} label='Unloading (₹)' name='unloadingCharges' form={form} />
            <ChargeField icon={PackageOpen} label='Packing (₹)' name='packingCharges' form={form} />
            <ChargeField icon={ShieldCheck} label='Insurance (₹)' name='insuranceCharges' form={form} />
            <ChargeField
              icon={PackageOpen}
              label='Other (₹)'
              name='otherCharges'
              form={form}
              className={cn(
                hasOtherCharge
                  ? 'bg-amber-50 ring-2 ring-amber-400/60 dark:bg-amber-950/30 dark:ring-amber-500/50'
                  : 'hover:bg-muted/40'
              )}
            />
            <ChargeField
              icon={BadgePercent}
              label='Discount (₹)'
              name='discount'
              form={form}
              className={cn(
                hasDiscount
                  ? 'bg-rose-50 ring-2 ring-rose-400/60 dark:bg-rose-950/30 dark:ring-rose-500/50'
                  : 'hover:bg-muted/40'
              )}
            />
            <ChargeField icon={IndianRupee} label='Total Fare (INR)' name='totalFare' form={form} readOnly />
          </div>
        </div>
      </div>
    </SectionCard>
  )
}

// ─── Shared Types ───────────────────────────────────────────────────

export type Boxprops = {
  form: UseFormReturn<VoucherDispatchDetailForm>
  name: keyof VoucherDispatchDetailForm
  stockUnits: StockUnitList
  freightBasis?: string
}

type DateBoxProps = {
  form: UseFormReturn<VoucherDispatchDetailForm>
  name: keyof VoucherDispatchDetailForm
  tabIndex?: number
}

// ─── WeightBox ──────────────────────────────────────────────────────

export const WeightBox = (props: Boxprops) => {
  const { form, name, stockUnits, freightBasis } = props
  const weightUnits = useMemo(() => {
    return stockUnits.filter((su) => su.unitType === 'simple' && lowerCase(su.quantityType) === freightBasis)
  }, [stockUnits])
  const weightUnitId = form.watch('weightUnitId')
  const weightUnit = useMemo(() => {
    return weightUnits.find((su) => su.id === weightUnitId)
  }, [weightUnitId, weightUnits])

  const [boxValue, setBoxValue] = useState<string>("")

  const baseUnitCode = weightUnit?.code || ''
  const basenoOfDecimalPlaces = weightUnit?.noOfDecimalPlaces

  const parseQuantityWithUnit = (input: string): { quantity: number, unit: StockUnit | null } => {
    const match = input.trim().match(/^(\d+\.?\d*)\s*([a-zA-Z]+)?$/)

    if (!match) {
      return { quantity: 0, unit: null }
    }
    const [, quantityStr, unitStr] = match

    const quantity = Number.parseFloat(quantityStr)

    return { quantity, unit: unitStr ?? weightUnit?.code }
  }

  const handleBlurOrEnter = () => {
    const { quantity } = parseQuantityWithUnit(boxValue)

    if (quantity === 0) {
      form.setValue(name, 0, { shouldValidate: true })
      setBoxValue("")
      return
    }

    const finalQuantity = quantity

    form.setValue(name, finalQuantity, { shouldValidate: true })
    setBoxValue(`${finalQuantity.toFixed(basenoOfDecimalPlaces)} ${baseUnitCode}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlurOrEnter()
    }
  }
  const handleBlur = () => {
    handleBlurOrEnter()
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    setBoxValue(rawValue)
  }

  const handleOnFocus = () => {
    const value = Number(form.getValues(name))?.toFixed(basenoOfDecimalPlaces)
    setBoxValue(Number(value) > 0 ? value?.toString() : '')
  }

  useEffect(() => {
    const value = form.watch(name)

    if (value) {
      const boxValueStr = `${Number(value).toFixed(basenoOfDecimalPlaces)} ${baseUnitCode}`
      setBoxValue(boxValueStr)
    } else {
      setBoxValue("")
    }
  }, [form.watch(name), baseUnitCode])
  return (
    <>
      <Input
        type="text"
        value={boxValue}
        onFocus={handleOnFocus}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="e.g., 15 Mt"
        className="h-10 rounded-lg border-slate-300 bg-white text-right text-sm dark:border-slate-600 dark:bg-slate-900"
      />
      <FormInputField type="hidden" form={form}
        label=''
        gapClass="grid-cols-[0_1fr] gap-0"
        name={name} />
    </>
  )
}

// ─── RateBox ────────────────────────────────────────────────────────

export const RateBox = (props: Boxprops) => {
  const { form, name, stockUnits, freightBasis } = props
  const rateUnits = useMemo(() => {
    return stockUnits.filter((su) => su.unitType === 'simple' && lowerCase(su.quantityType) === freightBasis!)
  }, [stockUnits])
  const rateUnitId = form.watch('rateUnitId')
  const rateUnit = useMemo(() => {
    return rateUnits.find((su) => su.id === rateUnitId)
  }, [rateUnitId, rateUnits])

  const [boxValue, setBoxValue] = useState<string>("")

  const baseUnitCode = rateUnit?.code || ''
  const basenoOfDecimalPlaces = 2

  const parseQuantityWithUnit = (input: string): { quantity: number, unit: StockUnit | null } => {
    const match = input.trim().match(/^(\d+\.?\d*)\s*([a-zA-Z]+)?$/)

    if (!match) {
      return { quantity: 0, unit: null }
    }
    const [, quantityStr, unitStr] = match

    const quantity = Number.parseFloat(quantityStr)

    return { quantity, unit: unitStr ?? rateUnit?.code }
  }

  const handleBlurOrEnter = () => {
    const { quantity } = parseQuantityWithUnit(boxValue)

    if (quantity === 0) {
      form.setValue(name, 0, { shouldValidate: true })
      setBoxValue("")
      return
    }

    const finalQuantity = quantity

    form.setValue(name, finalQuantity, { shouldValidate: true })
    setBoxValue(`${finalQuantity.toFixed(basenoOfDecimalPlaces)}/${baseUnitCode}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBlurOrEnter()
    }
  }
  const handleBlur = () => {
    handleBlurOrEnter()
  }
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value
    setBoxValue(rawValue)
  }

  const handleOnFocus = () => {
    const value = Number(form.getValues(name))?.toFixed(basenoOfDecimalPlaces)
    setBoxValue(Number(value) > 0 ? value?.toString() : '')
  }

  useEffect(() => {
    const value = form.watch(name)

    if (value) {
      const boxValueStr = `${Number(value).toFixed(basenoOfDecimalPlaces)}/${baseUnitCode}`
      setBoxValue(boxValueStr)
    } else {
      setBoxValue("")
    }
  }, [form.watch(name), baseUnitCode])
  return (
    <>
      <Input
        type="text"
        value={boxValue}
        onFocus={handleOnFocus}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="e.g., 400/Mt"
        className="h-10 rounded-lg border-slate-300 bg-white text-right text-sm dark:border-slate-600 dark:bg-slate-900"
      />
      <FormInputField type="hidden" form={form}
        label=''
        gapClass="grid-cols-[0_1fr] gap-0"
        name={name} />
    </>
  )
}

// ─── FreightChargesBox ─────────────────────────────────────────────

/**
 * Editable Freight Charges box. Typing a total freight charge derives the
 * per-unit rate (freightCharges ÷ weight) so the calculator stays consistent —
 * the derived rate flows back through computeFare into freightCharges and
 * totalFare. Full-precision division keeps the round-trip exact.
 */
export const FreightChargesBox = ({
  form,
}: {
  form: UseFormReturn<VoucherDispatchDetailForm>
}) => {
  const name = 'freightCharges'
  const weight = form.watch('weight')
  const [boxValue, setBoxValue] = useState('')

  const commit = () => {
    const parsed = Number(boxValue)

    if (isNaN(parsed) || parsed <= 0) {
      form.setValue(name, 0, { shouldValidate: true })
      setBoxValue('')
      return
    }

    // Focus + blur without editing — keep the current rate as-is.
    if (parsed === Number(form.getValues(name))) {
      setBoxValue(parsed.toFixed(2))
      return
    }

    form.setValue(name, parsed, { shouldValidate: true })
    const rate = computeRateFromCharge(parsed, weight)
    if (rate > 0) {
      form.setValue('rate', rate, { shouldValidate: true })
    }
    setBoxValue(parsed.toFixed(2))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commit()
    }
  }

  const handleOnFocus = () => {
    const value = Number(form.getValues(name))
    setBoxValue(Number(value) > 0 ? String(value) : '')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBoxValue(e.target.value)
  }

  useEffect(() => {
    const value = form.watch(name)
    setBoxValue(Number(value) > 0 ? Number(value).toFixed(2) : '')
  }, [form.watch(name)])

  // If weight is entered *after* a manually-entered charge (rate couldn't be
  // derived at commit time), re-derive the rate now — otherwise the
  // calculator's recompute would wipe the charge (baseFare = 0 × rate).
  useEffect(() => {
    const charge = Number(form.getValues('freightCharges'))
    const currentRate = Number(form.getValues('rate'))
    if (charge > 0 && Number(weight) > 0 && !(currentRate > 0)) {
      form.setValue('rate', computeRateFromCharge(charge, weight), {
        shouldValidate: true,
      })
    }
  }, [weight, form])

  return (
    <Input
      type="text"
      inputMode="decimal"
      value={boxValue}
      onFocus={handleOnFocus}
      onChange={handleChange}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      placeholder="e.g., 6000"
      className="h-10 rounded-lg border-slate-300 bg-white pl-7 text-right text-sm dark:border-slate-600 dark:bg-slate-900"
    />
  )
}

// ─── DateBox ────────────────────────────────────────────────────────

export const DateBox = (props: DateBoxProps) => {
  const { form, name } = props
  const [displayValue, setDisplayValue] = useState<string | null>("")

  const parseAndFormatDate = (input: string): Date | null => {
    if (!input) return null

    const now = new Date()
    const parts = input.split(/[./-]/).map(p => p.trim())

    const day = Number(parts[0])
    const month = parts[1] ? Number(parts[1]) - 1 : now.getMonth()
    const year =
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

  const parseDate = () => {
    const parsed = parseAndFormatDate(displayValue!)
    if (parsed) {
      form.setValue(name, parsed, { shouldValidate: true, shouldDirty: true })
      const formatted = parsed.toLocaleDateString("en-GB").replace(/\//g, '-')
      setDisplayValue(formatted)
      const DBFormat = `${parsed.getFullYear()}-${(parsed.getMonth() + 1).toString().padStart(2, '0')}-${parsed.getDate().toString().padStart(2, '0')}`
      form.setValue(name, DBFormat, { shouldValidate: true, shouldDirty: true })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      parseDate()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
      setDisplayValue("")
      form.setValue(name, null, { shouldValidate: true, shouldDirty: true })
      return
    }
    setDisplayValue(e.target.value)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.preventDefault()
    parseDate()
  }

  useEffect(() => {
    const formValue = form.watch(name)
    if (formValue) {
      let parsed: Date

      if (typeof formValue === "string" || typeof formValue === "number") {
        parsed = new Date(formValue)
      } else if (formValue instanceof Date) {
        parsed = formValue
      } else {
        return
      }

      if (!isNaN(parsed.getTime())) {
        const formatted = parsed.toLocaleDateString("en-GB").replace(/\//g, "-")
        setDisplayValue(formatted)
      }
    } else {
      setDisplayValue("")
    }
    parseDate()
  }, [form.watch(name)])

  return (
    <>
      <Input
        type="text"
        placeholder="DD-MM-YYYY"
        value={displayValue!}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="h-9 rounded-lg border-slate-300 bg-white text-sm dark:border-slate-600 dark:bg-slate-900"
      />
      <span className="hidden">
        <FormInputField type='date' form={form}
          label=''
          noLabel
          gapClass="grid-cols-[1fr] gap-0"
          name={name} />
      </span>
    </>
  )
}

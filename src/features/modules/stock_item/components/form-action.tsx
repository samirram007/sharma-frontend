'use client'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'

import FormInputField from '@/components/form-input-field'
import { Route as StockItemRoute } from '@/routes/_protected/masters/inventory/_layout/stock_item/_layout'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { omit } from 'lodash'
import { toast } from 'sonner'
import { useEffect } from 'react'
import { useForm, type Resolver, type UseFormReturn } from 'react-hook-form'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { useStockItem } from '../contexts/stock_item-context'
import { useStockItemMutation } from '../data/queryOptions'
import { formSchema, type StockItem, type StockItemForm } from '../data/schema'
import { tryRecordOpeningStock } from './opening-stock-recorder'
import OpeningStockSummaryCard from './opening-stock-summary-card'
import AlternateStockUnitDropdown from './dropdown/alternate_stock_unit-dropdown'
import CostingMethodSelect from './dropdown/costing_method-select'
import MarketValuationMethodSelect from './dropdown/market_valuation_method-select'
import StockCategoryDropdown from './dropdown/stock_category-dropdown'
import OpeningGodownDropdown from './dropdown/opening_godown-dropdown'
import StockGroupDropdown from './dropdown/stock_group-dropdown'
import StockUnitDropdown from './dropdown/stock_unit-dropdown'
import TypeOfSupplySelect from './dropdown/type_of_supply-select'
import UqcDropdown from './dropdown/uqc-dropdown'

interface Props {
  currentRow?: StockItem
}
interface FormProps {
  form: UseFormReturn<StockItemForm>
}

const sectionClass =
  'space-y-4 rounded-md border border-slate-200/70 bg-white p-3 sm:p-4 dark:border-white/[0.07] dark:bg-white/[0.06]'
const headingClass = 'text-sm font-semibold text-slate-800 dark:text-slate-200'
const subHeadingClass = 'text-xs text-slate-500 dark:text-slate-400'
const innerHeadingClass =
  'text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400'

export function FormAction({ currentRow }: Props) {
  const isEdit = !!currentRow
  const navigate = useNavigate()
  const { userFiscalYear } = useAuth()

  const { mutate: saveStockItem, isPending } = useStockItemMutation()

  const form = useForm<StockItemForm>({
    resolver: zodResolver(formSchema) as Resolver<StockItemForm>,
    defaultValues: isEdit
      ? { ...currentRow, isEdit }
      : {
          name: '',
          code: '',
          printName: '',
          sku: '',
          articleNo: '',
          partNo: '',
          status: 'active',
          description: '',
          stockGroupId: 1,
          stockCategoryId: undefined,
          stockUnitId: undefined,
          alternateStockUnitId: undefined,
          baseUnitValue: undefined,
          alternateUnitValue: undefined,
          uniqueQuantityCodeId: undefined,
          typeOfSupply: undefined,
          isNegativeSalesAllow: false,
          isMaintainBatch: false,
          isMaintainSerial: false,
          useExpiryDate: false,
          trackManufacturingDate: false,
          isFinishGoods: true,
          isRawMaterial: false,
          isUnfinishedGoods: false,
          costingMethod: 'avg_cost',
          marketValuationMethod: 'avg_price',
          reorderLevel: 0,
          minimumStock: 0,
          maximumStock: 0,
          hasBom: false,
          isSalesAsNewManufacture: false,
          isPurchaseAsConsumed: false,
          isRejectionAsScrap: false,
          isGstApplicable: false,
          rateOfDuty: 0.0,
          hsnSacCode: '',
          isGstInclusive: false,
          gstType: undefined,
          brandId: undefined,
          mrp: 0,
          standardCost: 0,
          standardSellingPrice: 0,
          icon: '',

          // Opening stock (create flow only) — posted to the OPNSK voucher
          // pipeline after the item itself is saved.
          openingQuantity: undefined,
          openingRate: undefined,
          openingGodownId: undefined,
          openingValue: undefined,

          isEdit,
        },
  })

  const gapClass = 'grid grid-cols-[200px_minmax(0,1fr)]! gap-x-3 justify-start'

  const onSubmit = (values: StockItemForm) => {
    const openingQuantity = Number(values.openingQuantity ?? 0)
    const hasOpeningStock = !isEdit && openingQuantity > 0

    // Never send the opening-stock-only fields to the stock_items API.
    const itemPayload = omit(values, [
      'openingQuantity',
      'openingRate',
      'openingGodownId',
      'openingValue',
    ])

    saveStockItem(
      currentRow ? { ...itemPayload, id: currentRow.id! } : itemPayload,
      {
        onSuccess: (response) => {
          if (hasOpeningStock) {
            const createdId =
              (response as { data?: { id?: number } })?.data?.id ?? undefined
            if (createdId) {
              void tryRecordOpeningStock({
                itemId: createdId,
                quantity: openingQuantity,
                rate: values.openingRate ?? undefined,
                godownId: values.openingGodownId!,
                stockUnitId: values.stockUnitId ?? undefined,
                fyStartDate: userFiscalYear?.fiscalYear?.startDate,
                currentFyId: userFiscalYear?.fiscalYearId,
              })
            } else {
              toast.error(
                'Item saved, but opening stock could not be recorded (missing item id). Please add it from Transactions → Opening Stock.',
              )
            }
          }
          navigate({ to: StockItemRoute.to })
        },
      },
    )
  }

  return (
    <Form {...form}>
      <form
        id="stock-item-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {/* Identification */}
        <section className={sectionClass}>
          <div className="space-y-1">
            <h3 className={headingClass}>Identification</h3>
            <p className={subHeadingClass}>
              Core item identity used across purchases, sales, and stock
              reports.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-4">
              <FormInputField
                type="text"
                form={form}
                name="name"
                label="Name"
                tabIndex={0}
              />
              <FormInputField
                type="text"
                form={form}
                name="code"
                label="Code"
              />
              <FormInputField
                type="text"
                form={form}
                name="printName"
                label="Print Name"
              />
            </div>
            <div className="space-y-4">
              <FormInputField
                type="text"
                form={form}
                name="articleNo"
                label="Article No"
              />
              <FormInputField
                type="text"
                form={form}
                name="partNo"
                label="Part No"
              />
              <FormInputField type="text" form={form} name="sku" label="SKU" />
            </div>
          </div>
          <FormInputField
            type="textarea"
            form={form}
            name="description"
            label="Description"
          />
        </section>

        {/* Configuration grid */}
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
          {/* General */}
          <section className={sectionClass}>
            <div className="space-y-1">
              <h3 className={headingClass}>General</h3>
              <p className={subHeadingClass}>
                Grouping, units of measure, and valuation defaults.
              </p>
            </div>
            <div className="space-y-2">
              <StockGroupDropdown form={form} gapClass={gapClass} />
              <StockCategoryDropdown form={form} gapClass={gapClass} />
              <FormInputField
                type="hidden"
                form={form}
                name="brandId"
                label="Brand ID"
              />
              <UnitManagement form={form} />
              <div className={innerHeadingClass}>Additional Details</div>
              <RateManagement form={form} />
              <BatchManagement form={form} />
              <CostingMethodSelect form={form} gapClass={gapClass} />
              <MarketValuationMethodSelect form={form} gapClass={gapClass} />
            </div>
          </section>

          {/* Behaviour */}
          <section className={sectionClass}>
            <div className="space-y-1">
              <h3 className={headingClass}>Behaviour</h3>
              <p className={subHeadingClass}>
                Stock levels, supply type, and item classification flags.
              </p>
            </div>
            <div className="space-y-2">
              <UqcDropdown form={form} gapClass={gapClass} />
              <TypeOfSupplySelect form={form} gapClass={gapClass} />

              <FormInputField
                type="checkbox"
                form={form}
                name="isFinishGoods"
                label="Is Finish Goods"
              />
              <FormInputField
                type="checkbox"
                form={form}
                name="isRawMaterial"
                label="Is Raw Material"
              />
              <FormInputField
                type="checkbox"
                form={form}
                name="isUnfinishedGoods"
                label="Is Unfinished Goods"
              />

              <FormInputField
                type="number"
                form={form}
                gapClass={gapClass}
                name="reorderLevel"
                label="Reorder Level"
              />
              <FormInputField
                type="number"
                form={form}
                gapClass={gapClass}
                name="minimumStock"
                label="Minimum Stock"
              />
              <FormInputField
                type="number"
                form={form}
                gapClass={gapClass}
                name="maximumStock"
                label="Maximum Stock"
              />
              <FormInputField
                type="checkbox"
                form={form}
                name="isNegativeSalesAllow"
                label="Ignore negetive balances"
              />
              <FormInputField
                type="checkbox"
                form={form}
                name="isSalesAsNewManufacture"
                label="Treat all sales as new manufacture"
              />
              <FormInputField
                type="checkbox"
                form={form}
                name="isPurchaseAsConsumed"
                label="Treat all purchases as consumed"
              />
              <FormInputField
                type="checkbox"
                form={form}
                name="isRejectionAsScrap"
                label="Treat all rejections inward as scrap"
              />
            </div>
          </section>

          {/* Tax Information (spans full width) */}
          <section className={`${sectionClass} lg:col-span-2`}>
            <div className="space-y-1">
              <h3 className={headingClass}>Tax Information</h3>
              <p className={subHeadingClass}>
                GST applicability, duty rate, and HSN/SAC classification.
              </p>
            </div>
            <div className="grid gap-x-10 gap-y-2 sm:grid-cols-2">
              <GstManagement form={form} />
              <FormInputField
                type="text"
                gapClass="hidden"
                form={form}
                name="icon"
                label="Icon"
              />
              <FormInputField
                type="checkbox"
                form={form}
                name="status"
                label="Status"
                options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
                ]}
              />
            </div>
          </section>
        </div>

        <OpeningBalanceManagement form={form} itemId={currentRow?.id} />

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200/70 pt-4 dark:border-white/[0.07]">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => navigate({ to: StockItemRoute.to })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Item'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

const OpeningBalanceManagement = ({
  form,
  itemId,
}: FormProps & { itemId?: number | null }) => {
  const { config } = useStockItem()
  const isEdit = form.getValues('isEdit')

  const quantity = Number(form.watch('openingQuantity') ?? 0)
  const rate = Number(form.watch('openingRate') ?? 0)

  const unitLabel =
    form.watch('stockUnit')?.unitType === 'compound'
      ? (form.watch('stockUnit')?.secondaryStockUnit?.code ?? 'units')
      : (form.watch('stockUnit')?.code ?? 'units')

  // Keep the computed value in sync (qty × rate); still editable if the
  // user wants a valuation that differs from qty × rate.
  useEffect(() => {
    form.setValue('openingValue', Math.round(quantity * rate * 100) / 100)
  }, [quantity, rate, form])

  // Read-only once the item exists — opening stock lives on the OPNSK voucher
  // and is edited from Transactions → Opening Stock, not from the item master.
  // The read-only summary card below still shows what IS recorded.
  if (isEdit && itemId) {
    const item = form.getValues()
    return (
      <OpeningStockSummaryCard
        itemId={itemId}
        unitCode={item.stockUnit?.code}
        noOfDecimalPlaces={item.stockUnit?.noOfDecimalPlaces}
      />
    )
  }
  if (isEdit) return null

  return (
    <>
      {config.map(
        (item) =>
          item.key === 'opening_balance' &&
          item.value && (
            <section
              key="opening_balance"
              className="space-y-4 rounded-md border border-amber-500/30 bg-amber-50/50 p-3 sm:p-4 dark:border-amber-400/20 dark:bg-amber-400/5"
            >
              <div className="space-y-1">
                <h3 className={headingClass}>Opening Balance</h3>
                <p className={subHeadingClass}>
                  Starting quantity and valuation recorded as opening stock for
                  the current fiscal year (requires a godown).
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FormInputField
                  type="number"
                  form={form}
                  gapClass={'grid grid-rows-2 grid-cols-1'}
                  name="openingQuantity"
                  label="Quantity"
                />
                <FormInputField
                  type="number"
                  form={form}
                  gapClass={'grid grid-rows-2 grid-cols-1'}
                  name="openingRate"
                  label="Rate"
                />
                <div className="grid grid-rows-2 grid-cols-1">
                  <span className="text-sm">per {unitLabel}</span>
                </div>
                <FormInputField
                  type="number"
                  form={form}
                  gapClass={'grid grid-rows-2 grid-cols-1'}
                  name="openingValue"
                  label="Value"
                />
              </div>
              <OpeningGodownDropdown form={form} />
            </section>
          ),
      )}
    </>
  )
}

const BatchManagement = ({ form }: FormProps) => {
  const { config } = useStockItem()
  const isMaintainBatch = form.watch('isMaintainBatch')
  return (
    <>
      {config.map(
        (item) =>
          item.key === 'batch_serial' &&
          item.value && (
            <div className="space-y-2" key="batch_serial">
              <FormInputField
                type="checkbox"
                form={form}
                name="isMaintainBatch"
                label="Maintain in batches"
              />
              {isMaintainBatch && (
                <div className="space-y-1 pl-4 pb-2">
                  <FormInputField
                    type="checkbox"
                    form={form}
                    name="useExpiryDate"
                    label="Use expiry dates"
                  />
                  <FormInputField
                    type="checkbox"
                    form={form}
                    name="trackManufacturingDate"
                    label="Track Manufacturing date"
                  />
                </div>
              )}
              <FormInputField
                type="checkbox"
                form={form}
                name="isMaintainSerial"
                label="Is Maintain Serial"
              />
              <FormInputField
                type="checkbox"
                form={form}
                name="hasBom"
                label="Alter components(BOM)"
              />
            </div>
          ),
      )}
    </>
  )
}

const UnitManagement = ({ form }: FormProps) => {
  const { config } = useStockItem()
  const gapClass = 'grid grid-cols-[200px_minmax(0,1fr)]! gap-x-3 justify-start'
  const gapReverseClass =
    'grid grid-cols-[100px_minmax(0,1fr)]! gap-x-2 justify-start'

  const alternateStockUnitId = form.watch('alternateStockUnitId')
  const stockUnitId = form.watch('stockUnitId')
  const StockUnit = form.getValues('stockUnit')
  const AlternateStockUnit = form.getValues('alternateStockUnit')
  const StockUnitCode =
    StockUnit?.unitType === 'compound'
      ? (StockUnit?.secondaryStockUnit?.code ?? '')
      : (StockUnit?.code ?? '')

  const AlternateStockUnitCode =
    AlternateStockUnit?.unitType === 'compound'
      ? (AlternateStockUnit?.secondaryStockUnit?.code ?? '')
      : (AlternateStockUnit?.code ?? '')
  useEffect(() => {
    const basePrimaryUnitId =
      StockUnit?.unitType === 'compound'
        ? StockUnit?.primaryStockUnitId
        : StockUnit?.id

    const baseSecondaryUnitId =
      StockUnit?.unitType === 'compound'
        ? (StockUnit?.secondaryStockUnit?.id ?? null)
        : null

    const alternatePrimaryUnitId =
      AlternateStockUnit?.unitType === 'compound'
        ? AlternateStockUnit?.primaryStockUnitId
        : AlternateStockUnit?.id

    const alternateSecondaryId =
      AlternateStockUnit?.unitType === 'compound'
        ? (AlternateStockUnit?.secondaryStockUnit?.id ?? null)
        : null

    // Collect only truthy IDs
    const ids = [
      basePrimaryUnitId,
      baseSecondaryUnitId,
      alternatePrimaryUnitId,
      alternateSecondaryId,
    ].filter(Boolean)

    // Check for duplicates
    const hasDuplicates = new Set(ids).size !== ids.length

    if (hasDuplicates) {
      form.setError('root', {
        type: 'manual',
        message: 'Unit selections cannot share the same stock unit.',
      })
    } else {
      form.clearErrors('root')
    }
  }, [alternateStockUnitId, stockUnitId, form])
  return (
    <div className="space-y-2 py-4 min-h-[200px]">
      <StockUnitDropdown form={form} config={config} gapClass={gapClass} />
      {/* Show message if 'alternate_units' config is set to false
             Configured to hide Alternate Units field */}
      {stockUnitId &&
        config.map(
          (item) =>
            item.key === 'alternate_units' &&
            item.value && (
              <div key={item.key} className="">
                <div className="text-xs text-muted-foreground py-2">
                  * To add Alternate Units, please select the Alternate Units
                  field.
                </div>
                <AlternateStockUnitDropdown
                  form={form}
                  config={config}
                  gapClass={gapClass}
                />
              </div>
            ),
        )}
      {stockUnitId && alternateStockUnitId && (
        <div className="grid grid-cols-[150px_minmax(0,1fr)] items-center">
          <div className="text-right text-sm pr-4">Where</div>
          <div className="grid grid-cols-[minmax(0,1fr)_20px_minmax(0,1fr)] gap-x-2">
            <div>
              <FormInputField
                type="text"
                form={form}
                rtl={true}
                gapClass={gapReverseClass}
                name="alternateUnitValue"
                label={AlternateStockUnitCode}
              />
            </div>
            <div className="text-lg text-center">=</div>
            <div>
              <FormInputField
                type="text"
                form={form}
                rtl={true}
                gapClass={gapReverseClass}
                name="baseUnitValue"
                label={StockUnitCode}
              />
            </div>
          </div>
        </div>
      )}
      {form.formState.errors.root && (
        <div className="mb-4 p-3 bg-red-50 border border-red-400 text-red-700 rounded-md text-sm flex items-center dark:bg-red-950/20 dark:text-red-300 dark:border-red-500/30">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-4.75a.75.75 0 11-1.5 0v-4a.75.75 0 011.5 0v4zm0-6a.75.75 0 11-1.5 0V7a.75.75 0 011.5 0v.25z"
              clipRule="evenodd"
            />
          </svg>
          {form.formState.errors.root.message}
        </div>
      )}
    </div>
  )
}

const RateManagement = ({ form }: FormProps) => {
  const gapClass = 'grid grid-cols-[200px_minmax(0,1fr)]! gap-x-3 justify-start'
  return (
    <div className="py-2 space-y-2">
      <FormInputField
        type="number"
        gapClass={gapClass}
        form={form}
        name="mrp"
        label="Mrp"
      />
      <FormInputField
        type="number"
        gapClass={gapClass}
        form={form}
        name="standardCost"
        label="Standard Cost"
      />
      <FormInputField
        type="number"
        gapClass={gapClass}
        form={form}
        name="standardSellingPrice"
        label="Standard selling price"
      />
    </div>
  )
}
const GstManagement = ({ form }: FormProps) => {
  const gapClass = 'grid grid-cols-[200px_minmax(0,1fr)]! gap-x-3 justify-start'
  const isGstApplicable = form.watch('isGstApplicable')
  return (
    <>
      <FormInputField
        type="checkbox"
        gapClass={gapClass}
        disabled={false}
        form={form}
        name="isGstApplicable"
        label="Is Gst Applicable"
        options={[
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ]}
      />
      {isGstApplicable && (
        <div className={`space-y-2`}>
          <FormInputField
            type="text"
            form={form}
            gapClass={gapClass}
            name="gstType"
            label="Gst Type"
          />
          <FormInputField
            type="text"
            form={form}
            gapClass={gapClass}
            name="rateOfDuty"
            label="Rate Of Duty"
          />
          <FormInputField
            type="checkbox"
            form={form}
            gapClass={gapClass}
            name="isGstInclusive"
            label="Gst Inclusive"
          />
        </div>
      )}
      <FormInputField
        type="text"
        form={form}
        gapClass={gapClass}
        name="hsnSacCode"
        label="Hsn/Sac code"
      />
    </>
  )
}

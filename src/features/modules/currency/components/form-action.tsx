'use client'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'

import FormInputField from '@/components/form-input-field'
import { Route as CurrencyRoute } from '@/routes/_protected/masters/organization/_layout/currency/_layout'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { storeCurrencyService, updateCurrencyService } from '../data/api'
import { formSchema, type Currency, type CurrencyForm } from '../data/schema'
import CountryDropdown from './country-dropdown'

interface Props {
  currentRow?: Currency
}

const sectionClass =
  'space-y-4 rounded-md border border-slate-200/70 bg-white p-3 sm:p-4 dark:border-white/[0.07] dark:bg-white/[0.06]'
const headingClass = 'text-sm font-semibold text-slate-800 dark:text-slate-200'
const subHeadingClass = 'text-xs text-slate-500 dark:text-slate-400'

export function FormAction({ currentRow }: Props) {
  const isEdit = !!currentRow
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { mutate: saveCurrency, isPending } = useMutation({
    mutationFn: async (data: CurrencyForm) => {
      if (isEdit && currentRow) {
        return await updateCurrencyService({ ...data, id: currentRow.id })
      } else if (!isEdit) {
        return await storeCurrencyService(data)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencys'] })
    },
  })

  const form = useForm<CurrencyForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          ...currentRow,
          isEdit,
          exchangeRate: '',
        }
      : {
          name: '',
          code: '',
          status: 'active',
          exchangeRate: '',
          symbol: '',
          decimalPlaces: '',
          format: '',
          thousandsSeparator: '',
          decimalSeparator: ',',
          symbolPosition: 'before',
          country: 'India',
          isEdit,
        },
  })

  const labelLayoutClass = 'sm:grid-cols-[160px_1fr]'
  const onSubmit = (values: CurrencyForm) => {
    saveCurrency(currentRow ? { ...values, id: currentRow.id! } : values, {
      onSuccess: () => {
        form.reset()
        navigate({ to: CurrencyRoute.to })
      },
    })
  }

  return (
    <Form {...form}>
      <form
        id="currency-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {/* Basic Information */}
        <section className={sectionClass}>
          <div className="space-y-1">
            <h3 className={headingClass}>Basic Information</h3>
            <p className={subHeadingClass}>
              Core identity and geographic settings for the currency record.
            </p>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormInputField
                type="text"
                gapClass={labelLayoutClass}
                form={form}
                name="name"
                label="Name"
                tabIndex={0}
              />
              <FormInputField
                type="text"
                gapClass={labelLayoutClass}
                form={form}
                name="code"
                label="Code"
              />
              <FormInputField
                type="text"
                gapClass={labelLayoutClass}
                form={form}
                name="symbol"
                label="Symbol"
              />
              <FormInputField
                type="text"
                gapClass={labelLayoutClass}
                form={form}
                name="symbolPosition"
                label="Symbol Position"
              />
            </div>
            <CountryDropdown form={form} gapClass={labelLayoutClass} />
          </div>
        </section>

        {/* Formatting Rules */}
        <section className={sectionClass}>
          <div className="space-y-1">
            <h3 className={headingClass}>Formatting Rules</h3>
            <p className={subHeadingClass}>
              Control exchange rate and number separators used when formatting
              currency values.
            </p>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormInputField
                type="text"
                gapClass={labelLayoutClass}
                form={form}
                name="exchangeRate"
                label="Exchange Rate"
              />
              <FormInputField
                type="text"
                gapClass={labelLayoutClass}
                form={form}
                name="decimalPlaces"
                label="Decimal Places"
              />
              <FormInputField
                type="text"
                gapClass={labelLayoutClass}
                form={form}
                name="thousandsSeparator"
                label="Thousands Separator"
              />
              <FormInputField
                type="text"
                gapClass={labelLayoutClass}
                form={form}
                name="decimalSeparator"
                label="Decimal Separator"
              />
            </div>
            <FormInputField
              type="checkbox"
              gapClass={labelLayoutClass}
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

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200/70 pt-4 dark:border-white/[0.07]">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => navigate({ to: CurrencyRoute.to })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Currency'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

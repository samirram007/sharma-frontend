import { SelectDropdown } from '@/components/select-dropdown'
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { capitalizeAllWords } from '@/utils/removeEmptyStrings'
import { useSuspenseQuery } from '@tanstack/react-query'
import type { UseFormReturn } from 'react-hook-form'

import { cn } from '@/lib/utils'

import type { Country } from '../../../country/data/schema'
import type { CompanyForm } from '../../data/schema'

import { countryQueryOptions } from '@/features/modules/country/data/queryOptions'
import { Suspense } from 'react'

type Props = {
  form: UseFormReturn<CompanyForm>
  gapClass?: string
  rtl?: boolean
}

const CountryDropdown = (props: Props) => {
  const { form, gapClass, rtl } = props

  const { data: countryList, isLoading } = useSuspenseQuery(
    countryQueryOptions(),
  )

  // const countryId = form.watch('countryId') as string | number | undefined;; // Watch form value for reactivity
  const handleValueChange = (value: string) => {
    form.setValue('address.countryId', Number(value))
  }
  if (isLoading) {
    return <div>Loading...</div>
  }
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FormField
        control={form.control}
        name="address.countryId"
        render={({ field }) => (
          <FormItem
            className={cn(
              'grid grid-cols-1 items-start space-y-0 gap-x-4 gap-y-2 sm:grid-cols-[100px_1fr] sm:items-center sm:gap-y-1',
              gapClass,
            )}
          >
            <FormLabel className={rtl ? 'order-last' : ''}>Country</FormLabel>
            <SelectDropdown
              defaultValue={field.value ? field.value.toString() : ''}
              onValueChange={(value) => handleValueChange(value)}
              placeholder="Select a country"
              useSheet
              sheetTitle="Select Country"
              className="w-full placeholder"
              items={countryList?.data.map((country: Country) => ({
                label: capitalizeAllWords(country.name),
                value: String(country.id),
              }))}
            />
            <FormMessage className="sm:col-start-2" />
          </FormItem>
        )}
      />
    </Suspense>
  )
}

export default CountryDropdown

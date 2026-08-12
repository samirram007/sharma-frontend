import { SelectDropdown } from '@/components/select-dropdown'
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { capitalizeAllWords } from '@/utils/removeEmptyStrings'
import { useQuery } from '@tanstack/react-query'
import type { UseFormReturn } from 'react-hook-form'

import { fetchCurrencyService } from '../../../currency/data/api'
import type { Currency } from '../../../currency/data/schema'
import type { CompanyForm } from '../../data/schema'
import { cn } from '@/lib/utils'

type Props = {
  form: UseFormReturn<CompanyForm>
  gapClass?: string
  rtl?: boolean
}

const CurrencyDropdown = (props: Props) => {
  const { form, gapClass, rtl } = props

  const { data: currencyList, isLoading } = useQuery({
    queryKey: ['currencies'],
    queryFn: fetchCurrencyService,
  })

  // const currencyId = form.watch('currencyId') as string | number | undefined;; // Watch form value for reactivity
  const handleValueChange = (value: string) => {
    form.setValue('currencyId', Number(value))
  }
  if (isLoading) {
    return <div>Loading...</div>
  }
  return (
    <FormField
      control={form.control}
      name="currencyId"
      render={({ field }) => (
        <FormItem
          className={cn(
            'grid grid-cols-1 items-start space-y-0 gap-x-4 gap-y-2 sm:grid-cols-[100px_1fr] sm:items-center sm:gap-y-1',
            gapClass,
          )}
        >
          <FormLabel className={rtl ? 'order-last' : ''}>Currency</FormLabel>
          <SelectDropdown
            defaultValue={field.value ? field.value.toString() : ''}
            onValueChange={(value) => handleValueChange(value)}
            placeholder="Select a currency"
            useSheet
            sheetTitle="Select Currency"
            className="w-full "
            items={currencyList?.data.map((currency: Currency) => ({
              label: `${currency.symbol} ${capitalizeAllWords(currency.name)} (${currency.code})`,
              value: String(currency.id),
            }))}
          />
          <FormMessage className="sm:col-start-2" />
        </FormItem>
      )}
    />
  )
}

export default CurrencyDropdown

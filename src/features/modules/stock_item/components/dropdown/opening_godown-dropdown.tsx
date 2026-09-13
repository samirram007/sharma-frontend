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

import { fetchGodownService } from '@/features/modules/godown/data/api'
import type { Godown } from '@/features/modules/godown/data/schema'
import { cn } from '@/lib/utils'
import type { StockItemForm } from '../../data/schema'

type Props = {
  form: UseFormReturn<StockItemForm>
  gapClass?: string
}

const OpeningGodownDropdown = (props: Props) => {
  const { form, gapClass } = props
  const { data: godownList, isLoading } = useQuery({
    queryKey: ['godowns'],
    queryFn: fetchGodownService,
  })

  const handleValueChange = (value: string) => {
    form.setValue('openingGodownId', Number(value), { shouldValidate: true })
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <FormField
      control={form.control}
      name="openingGodownId"
      render={({ field }) => (
        <FormItem
          className={cn(
            'grid grid-cols-[200px_minmax(0,1fr)] items-center space-y-0 gap-x-3 gap-y-1',
            gapClass,
          )}
        >
          <FormLabel className="pt-1">Godown</FormLabel>
          <SelectDropdown
            defaultValue={field.value ? field.value.toString() : ''}
            onValueChange={(value) => handleValueChange(value)}
            placeholder="Select a godown"
            className="w-full"
            items={godownList?.data.map((godown: Godown) => ({
              label: capitalizeAllWords(godown.name),
              value: String(godown.id),
            }))}
          />
          <FormMessage className="col-span-2 col-start-1" />
        </FormItem>
      )}
    />
  )
}

export default OpeningGodownDropdown

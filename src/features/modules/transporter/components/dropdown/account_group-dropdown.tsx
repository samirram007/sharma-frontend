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

import { fetchAccountGroupService } from '@/features/masters/accounts/services/apis'
import type { AccountGroup } from '@/features/modules/account_group/data/schema'
import { cn } from '@/lib/utils'
import type { TransporterForm } from '../../data/schema'

type Props = {
  form: UseFormReturn<TransporterForm>
  gapClass?: string
  rtl?: boolean
}
const AccountGroupDropdown = (props: Props) => {
  const { form, gapClass, rtl } = props as Props
  const { data: accountGroups, isLoading } = useQuery({
    queryKey: ['accountGroups'],
    queryFn: fetchAccountGroupService,
  })

  const handleValueChange = (value: string) => {
    form.setValue('accountGroupId', Number(value))
  }
  if (isLoading) {
    return <div>Loading...</div>
  }
  return (
    <>
      <FormField
        control={form.control}
        name="accountGroupId"
        render={({ field }) => (
          <FormItem
            className={cn(
              'grid grid-cols-1 items-start space-y-0 gap-x-4 gap-y-2 sm:grid-cols-[100px_1fr] sm:items-center sm:gap-y-1',
              gapClass,
            )}
          >
            <FormLabel className={rtl ? 'order-last' : ''}>Under</FormLabel>

            <SelectDropdown
              defaultValue={field.value ? field.value.toString() : ''}
              onValueChange={(value) => handleValueChange(value)}
              placeholder="Select a account group"
              className="w-full"
              items={accountGroups?.data.map((accountGroup: AccountGroup) => ({
                label: capitalizeAllWords(accountGroup.name),
                value: String(accountGroup.id),
              }))}
            />

            <FormMessage className="sm:col-start-2" />
          </FormItem>
        )}
      />
    </>
  )
}

export default AccountGroupDropdown

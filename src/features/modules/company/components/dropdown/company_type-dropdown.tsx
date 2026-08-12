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
import { fetchCompanyTypeService } from '../../../company_type/data/api'
import type { CompanyType } from '../../../company_type/data/schema'
import type { CompanyForm } from '../../data/schema'
import { cn } from '@/lib/utils'

type Props = {
  form: UseFormReturn<CompanyForm>
  gapClass?: string
  rtl?: boolean
}

const CompanyTypeDropdown = (props: Props) => {
  const { form, gapClass, rtl } = props
  const { data: companyTypeList, isLoading } = useQuery({
    queryKey: ['companyTypes'],
    queryFn: fetchCompanyTypeService,
  })

  // const companyTypeId = form.watch('companyTypeId') as string | number | undefined;; // Watch form value for reactivity
  const handleValueChange = (value: string) => {
    form.setValue('companyTypeId', Number(value))
  }
  if (isLoading) {
    return <div>Loading...</div>
  }
  return (
    <FormField
      control={form.control}
      name="companyTypeId"
      render={({ field }) => (
        <FormItem
          className={cn(
            'grid grid-cols-1 items-start space-y-0 gap-x-4 gap-y-2 sm:grid-cols-[100px_1fr] sm:items-center sm:gap-y-1',
            gapClass,
          )}
        >
          <FormLabel className={rtl ? 'order-last' : ''}>
            Company Type
          </FormLabel>
          <SelectDropdown
            defaultValue={field.value ? field.value.toString() : ''}
            onValueChange={(value) => handleValueChange(value)}
            placeholder="Select an company type"
            useSheet
            sheetTitle="Select Company Type"
            className="w-full"
            items={companyTypeList?.data.map((companyType: CompanyType) => ({
              label: capitalizeAllWords(companyType.name),
              value: String(companyType.id),
            }))}
          />
          <FormMessage className="sm:col-start-2" />
        </FormItem>
      )}
    />
  )
}

export default CompanyTypeDropdown

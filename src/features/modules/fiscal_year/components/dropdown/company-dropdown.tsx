import { SelectDropdown } from '@/components/select-dropdown'
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { capitalizeAllWords } from '@/utils/removeEmptyStrings'
import type { UseFormReturn } from 'react-hook-form'
import type { Company } from '../../../company/data/schema'
import type { FiscalYearForm } from '../../data/schema'

type Props = {
  form: UseFormReturn<FiscalYearForm>
  companyList?: Company[]
  gapClass?: string
}

const CompanyDropdown = (props: Props) => {
  const { form, companyList, gapClass } = props

  // const { data: companyList, isLoading } = useQuery({
  //     queryKey: ["companies"],
  //     queryFn: fetchCompanyService,
  // });

  // const companyId = form.watch('companyId') as string | number | undefined;; // Watch form value for reactivity
  const handleValueChange = (value: string) => {
    form.setValue('companyId', Number(value))
    form.setValue(
      'company',
      companyList?.find((company: Company) => company.id === Number(value)) ||
        null,
    )
  }

  return (
    <FormField
      control={form.control}
      name="companyId"
      render={({ field }) => (
        <FormItem
          className={
            gapClass ??
            'grid grid-cols-1 items-start space-y-0 gap-x-4 gap-y-2 sm:grid-cols-[160px_1fr] sm:items-center sm:gap-y-1'
          }
        >
          <FormLabel>Company</FormLabel>
          <SelectDropdown
            defaultValue={field.value ? field.value.toString() : ''}
            onValueChange={(value) => handleValueChange(value)}
            placeholder="Select a company "
            className="w-full"
            useSheet
            sheetTitle="Select Company"
            items={companyList?.map((company: Company) => ({
              label: capitalizeAllWords(company.name),
              value: String(company.id),
            }))}
          />
          <FormMessage className="sm:col-start-2" />
        </FormItem>
      )}
    />
  )
}

export default CompanyDropdown

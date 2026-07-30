import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useQuery } from '@tanstack/react-query'
import type { UseFormReturn } from 'react-hook-form'
import { fetchVoucherClassificationService } from '../../voucher_classification/data/api'

interface VoucherClassificationDropdownProps {
   
  form: UseFormReturn<any>
}

export default function VoucherClassificationDropdown({ form }: VoucherClassificationDropdownProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['voucherClassifications'],
    queryFn: () => fetchVoucherClassificationService(),
  })

  return (
    <FormField
      control={form.control}
      name="voucherClassificationId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Voucher Classification</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value?.toString()}
            value={field.value?.toString()}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a classification" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>Loading...</SelectItem>
              ) : (
                data?.data?.map((item: { id: number; name: string }) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

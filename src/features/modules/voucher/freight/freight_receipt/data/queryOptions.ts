import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { createFreightReceiptService, fetchFreightReceiptService } from './api'
import type { FreightReceiptForm } from './schema'

const queryKey = 'FreightReceipt'
export const freightReceiptQueryOptions = (
  freightId: number,
  key: string = 'freight_receipt',
) => {
  return queryOptions({
    queryKey: [queryKey, freightId, key],
    queryFn: () => fetchFreightReceiptService(freightId),
    staleTime: 1000 * 30, // 30 seconds
    retry: 1,
  })
}

export function useFreightReceiptMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: FreightReceiptForm) => {
      return await createFreightReceiptService(data)
    },
    onSuccess: () => {
      // console.log("Freight receipt created successfully")
      queryClient.invalidateQueries({ queryKey: ['Receipts'] })
      queryClient.invalidateQueries({ queryKey: ['FreightReport'] })
      queryClient.invalidateQueries({ queryKey: [queryKey] })

      toast.success('Freight receipt saved successfully')
    },
    onError: (error) => {
      console.error('Freight receipt mutation failed:', error)
    },
  })
}

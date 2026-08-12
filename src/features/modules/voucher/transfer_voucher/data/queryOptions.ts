import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { getServerErrorMessage } from '@/utils/handle-server-error'
import {
  fetchTransferVoucherByIdService,
  fetchTransferVoucherService,
  storeTransferVoucherService,
  updateTransferVoucherService,
} from './api'
import {
  TransferVoucherVoucherListSchema,
  TRANSFER_VOUCHER_VOUCHER_TYPE_ID,
} from './schema'
import type { TransferVoucherVoucherForm } from './schema'

const BASE_KEY = 'transfer-voucher-vouchers'

export const TransferVoucherVoucherQueryOptions = () => {
  return queryOptions({
    queryKey: [BASE_KEY, 'list', TRANSFER_VOUCHER_VOUCHER_TYPE_ID],
    queryFn: async () => {
      const response = await fetchTransferVoucherService()
      const parsed = TransferVoucherVoucherListSchema.parse(
        response?.data ?? [],
      )
      return parsed.filter(
        (voucher) => voucher.voucherTypeId === TRANSFER_VOUCHER_VOUCHER_TYPE_ID,
      )
    },
    staleTime: 1000 * 60,
    retry: 1,
  })
}

export const TransferVoucherQueryOptions = (id?: number) => {
  return queryOptions({
    queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
    queryFn: () =>
      id ? fetchTransferVoucherByIdService(id) : fetchTransferVoucherService(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

// Same contract as the Receipt Note / Delivery Note pipeline: the mutation
// accepts the full form values (with an optional id for updates).
type TransferVoucherVoucherMutationPayload = TransferVoucherVoucherForm & {
  id?: number
}

export function useTransferVoucherVoucherMutation() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (data: TransferVoucherVoucherMutationPayload) => {
      if (data.id) {
        return await updateTransferVoucherService(
          data as unknown as Record<string, unknown>,
        )
      }
      return await storeTransferVoucherService(
        data as unknown as Record<string, unknown>,
      )
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
      // Keep the day book listing fresh so the new voucher shows
      // immediately.
      queryClient.invalidateQueries({ queryKey: ['DayBooks'] })
      toast.success(
        variables.id
          ? 'Transfer voucher updated successfully'
          : 'Transfer voucher saved successfully',
      )
      // Only redirect when creating a new voucher — stay on the page
      // when editing an existing one. String path is used instead of the
      // route module to avoid a circular import (that route re-renders
      // this same voucher component).
      if (!variables.id) {
        navigate({ to: '/reports/day_book/transfer_voucher' })
      }
    },
    onError: (error) => {
      console.error('Transfer voucher voucher mutation failed:', error)
      toast.error(
        getServerErrorMessage(error, 'Failed to save transfer voucher.'),
      )
    },
  })
}

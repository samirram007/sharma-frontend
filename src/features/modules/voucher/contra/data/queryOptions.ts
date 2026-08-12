import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  deleteContraService,
  fetchContraByIdService,
  fetchContraService,
  storeContraService,
  updateContraService,
} from './api'
import {
  CONTRA_VOUCHER_TYPE_ID,
  contraVoucherListSchema,
  type ContraForm,
} from './schema'

const BASE_KEY = 'contra-vouchers'

export const contraVoucherQueryOptions = () => {
  return queryOptions({
    queryKey: [BASE_KEY, 'list', CONTRA_VOUCHER_TYPE_ID],
    queryFn: async () => {
      const response = await fetchContraService()
      const parsed = contraVoucherListSchema.parse(response?.data ?? [])
      return parsed.filter(
        (voucher) => voucher.voucherTypeId === CONTRA_VOUCHER_TYPE_ID,
      )
    },
    staleTime: 1000 * 60,
    retry: 1,
  })
}

export const contraQueryOptions = (id?: number) => {
  return queryOptions({
    queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
    queryFn: () => (id ? fetchContraByIdService(id) : fetchContraService()),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })
}

export function useContraMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: ContraForm & { id?: number }) => {
      if (data.id) {
        // Update if id exists
        return await updateContraService(data)
      }
      // Otherwise create
      return await storeContraService(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
    },
    onError: (error) => {
      console.error('Contra mutation failed:', error)
    },
  })
}

type ContraVoucherMutationPayload = {
  id?: number
  voucherDate: Date | string
  voucherNo?: string | null
  amount?: number | null
  remarks?: string | null
  module?: string | null
  referenceNo?: string | null
  referenceDate?: Date | string | null
  voucherTypeId?: number
  stockJournalId?: number | null
  stockJournal?: unknown
  party?: unknown
  partyLedger?: unknown
  transactionLedger?: unknown
  voucherDispatchDetail?: unknown
  voucherEntries?: Array<{
    id?: number | null
    voucherId?: number | null
    entryOrder: number
    accountLedgerId: number
    debit: number
    credit: number
    remarks?: string | null
  }>
}

export function useContraVoucherMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ContraVoucherMutationPayload) => {
      if (data.id) {
        return await updateContraService(data)
      }
      return await storeContraService(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
    },
    onError: (error) => {
      console.error('Contra voucher mutation failed:', error)
    },
  })
}

export function useContraVoucherDeleteMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteContraService(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
    },
    onError: (error) => {
      console.error('Contra voucher delete failed:', error)
    },
  })
}

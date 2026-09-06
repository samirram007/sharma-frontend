import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import {
  fetchTicketByIdService,
  fetchTicketService,
  storeTicketService,
  updateTicketService,
  addTicketResponseService,
  updateTicketStatusService,
} from './api'
import type { TicketForm } from './schema'

const BASE_KEY = 'tickets'

export const ticketQueryOptions = (id?: number) => {
  return queryOptions({
    queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
    queryFn: () => (id ? fetchTicketByIdService(id) : fetchTicketService()),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })
}

export function useTicketMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: TicketForm & { id?: number }) => {
      if (data.id) {
        return await updateTicketService(data)
      }
      return await storeTicketService(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
    },
    onError: (error) => {
      console.error('Ticket mutation failed:', error)
    },
  })
}

export function useTicketResponseMutation(ticketId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { message: string }) => {
      return await addTicketResponseService(ticketId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
      queryClient.invalidateQueries({ queryKey: [BASE_KEY, ticketId] })
    },
    onError: (error) => {
      console.error('Ticket response mutation failed:', error)
    },
  })
}

export function useTicketStatusMutation(ticketId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (status: string) => {
      return await updateTicketStatusService(ticketId, status)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
      queryClient.invalidateQueries({ queryKey: [BASE_KEY, ticketId] })
    },
    onError: (error) => {
      console.error('Ticket status mutation failed:', error)
    },
  })
}

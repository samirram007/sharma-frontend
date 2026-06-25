import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchMyNotificationsService,
  fetchUnreadCountService,
  markAllAsReadService,
  markAsReadService,
  validateFreightService,
} from './api'
import type {
  AppNotification,
} from './schema'

// Query keys
const NOTIFICATIONS_KEY = ['app-notifications', 'my'] as const
const UNREAD_COUNT_KEY = ['app-notifications', 'unread-count'] as const

/**
 * Fetch paginated notifications for the current user
 * Polls every 10 minutes as a fallback (real-time via Echo is primary).
 */
export function useMyNotifications(page: number = 1, perPage: number = 15) {
  return useQuery<AppNotification[]>({
    queryKey: [...NOTIFICATIONS_KEY, page, perPage],
    queryFn: async () => {
      const response = await fetchMyNotificationsService(page, perPage)
      return response.data ?? []
    },
    refetchInterval: 600_000, // 10 minutes
    staleTime: 60_000,
    retry: 1,
  })
}

/**
 * Fetch unread count for the current user.
 * No polling needed — real-time events via Echo will invalidate
 * this cache automatically when new notifications arrive.
 */
export function useUnreadCount() {
  return useQuery<number>({
    queryKey: UNREAD_COUNT_KEY,
    queryFn: async () => {
      const response = await fetchUnreadCountService()
      return response.data?.count ?? 0
    },
    staleTime: 20_000,
    retry: 1,
  })
}

/**
 * Mark a single notification as read
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await markAsReadService(id)
    },
    onSuccess: () => {
      // Invalidate all notification queries to refetch
      queryClient.invalidateQueries({ queryKey: ['app-notifications'] })
    },
  })
}

/**
 * Mark all notifications as read
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await markAllAsReadService()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-notifications'] })
    },
  })
}

// Existing freight validation hook
export function useFreightValidation(
  voucherId: number | undefined,
  dispatchDetail: Record<string, unknown> | undefined,
) {
  return useQuery<AppNotification[]>({
    queryKey: ['app-notifications', 'validate-freight', voucherId],
    queryFn: async () => {
      if (!voucherId || !dispatchDetail) return []
      const response = await validateFreightService(voucherId, dispatchDetail)
      return response.data ?? []
    },
    enabled: !!voucherId && !!dispatchDetail,
    staleTime: 0,
    retry: 1,
  })
}

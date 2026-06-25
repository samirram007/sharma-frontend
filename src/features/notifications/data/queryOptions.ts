import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getData, patchData } from '@/utils/dataClient'
import type { NotificationFilter, NotificationItem, NotificationsResponse } from './schema'

const NOTIFICATION_KEYS = ['app-notifications'] as const

/**
 * Fetch paginated + filtered notifications for the current user
 * Returns both items and pagination metadata.
 */
export function useNotifications(filters: NotificationFilter) {
  const params = new URLSearchParams()
  params.set('page', String(filters.page))
  params.set('per_page', String(filters.perPage))

  if (filters.type) {
    params.set('type', filters.type)
  }
  if (filters.is_read !== undefined) {
    params.set('is_read', String(filters.is_read))
  }

  return useQuery<{
    items: NotificationItem[]
    totalPages: number
    total: number
  }>({
    queryKey: [...NOTIFICATION_KEYS, 'page', filters],
    queryFn: async () => {
      const response: NotificationsResponse = await getData(
        `/app-notifications/my?${params.toString()}`,
      )
      const items =
        response.data?.map((item: any) => ({
          ...item,
          type: item.type as NotificationItem['type'],
          isRead: Boolean(item.isRead),
          createdAt: item.createdAt ?? item.created_at,
          updatedAt: item.updatedAt ?? item.updated_at,
        })) ?? []

      const total = response.meta?.total ?? items.length
      const perPage = response.meta?.per_page ?? filters.perPage
      const totalPages = Math.max(1, Math.ceil(total / perPage))

      return { items, totalPages, total }
    },
    staleTime: 15_000,
    retry: 1,
  })
}

/**
 * Mark a single notification as read
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      await patchData(`/app-notifications/${id}/read`, {})
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS })
      queryClient.invalidateQueries({ queryKey: ['app-notifications', 'unread-count'] })
      queryClient.invalidateQueries({ queryKey: ['app-notifications', 'my'] })
    },
  })
}

/**
 * Mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await patchData('/app-notifications/read-all', {})
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_KEYS })
      queryClient.invalidateQueries({ queryKey: ['app-notifications', 'unread-count'] })
      queryClient.invalidateQueries({ queryKey: ['app-notifications', 'my'] })
    },
  })
}

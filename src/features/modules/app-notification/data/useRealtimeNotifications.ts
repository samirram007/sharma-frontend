import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { useEcho } from '@/core/contexts/echo-context'

/**
 * Hook that listens for real-time notification events via Laravel Echo
 * and invalidates notification query caches when a new notification arrives.
 */
export function useRealtimeNotifications() {
  const { user, isAuthenticated } = useAuth()
  const { echo } = useEcho()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!echo || !isAuthenticated || !user?.id) return

    const channelName = `user.notifications.${user.id}`
    const channel = echo.private(channelName)

    channel.listen('.notification.created', () => {
      // Directly update unread count for instant badge refresh
      queryClient.invalidateQueries({
        queryKey: ['app-notifications', 'unread-count'],
      })
      // Refresh the notification list
      queryClient.invalidateQueries({ queryKey: ['app-notifications', 'my'] })
      // Refresh the notifications page
      queryClient.invalidateQueries({ queryKey: ['app-notifications', 'page'] })
    })

    return () => {
      // Leave the channel on cleanup
      try {
        echo.leave(channelName)
      } catch {
        // Ignore errors during disconnect
      }
    }
  }, [echo, isAuthenticated, user?.id, queryClient])
}

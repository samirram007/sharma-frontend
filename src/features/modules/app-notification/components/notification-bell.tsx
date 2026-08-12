import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { IconBell, IconBellFilled, IconCheck } from '@tabler/icons-react'
import { formatDistanceToNow } from 'date-fns'
import { useNavigate } from '@tanstack/react-router'
import {
  useMarkAllAsRead,
  useMarkAsRead,
  useMyNotifications,
  useUnreadCount,
} from '../data/queryOptions'
import { useRealtimeNotifications } from '../data/useRealtimeNotifications'
import type { AppNotification } from '../data/schema'

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: AppNotification
  onMarkRead: (id: number) => void
}) {
  const typeStyles: Record<string, string> = {
    warning:
      'border-l-4 border-l-amber-400 dark:border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20',
    error:
      'border-l-4 border-l-red-400 dark:border-l-red-500 bg-red-50/50 dark:bg-red-950/20',
    info: 'border-l-4 border-l-blue-400 dark:border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20',
    success:
      'border-l-4 border-l-emerald-400 dark:border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20',
  }

  return (
    <div
      className={cn(
        'group relative flex items-start gap-3 px-4 py-3 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/40',
        !notification.isRead ? (typeStyles[notification.type] ?? '') : '',
        notification.isRead && 'opacity-70',
      )}
    >
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium leading-tight',
            notification.isRead
              ? 'text-slate-600 dark:text-slate-400'
              : 'text-slate-900 dark:text-slate-100',
          )}
        >
          {notification.title}
        </p>
        {notification.message && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500 line-clamp-2">
            {notification.message}
          </p>
        )}
        <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-600">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
          })}
        </p>
      </div>

      {!notification.isRead && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => onMarkRead(notification.id)}
          title="Mark as read"
        >
          <IconCheck
            size={14}
            className="text-slate-400 hover:text-emerald-500"
          />
        </Button>
      )}
    </div>
  )
}

export function NotificationBell() {
  const navigate = useNavigate()
  useRealtimeNotifications()
  const { data: notifications = [], isLoading: isNotificationsLoading } =
    useMyNotifications(1, 10)
  const { data: unreadCount = 0, isLoading: isCountLoading } = useUnreadCount()
  const markAsReadMutation = useMarkAsRead()
  const markAllAsReadMutation = useMarkAllAsRead()

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id)
  }

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate()
  }

  const handleViewAll = () => {
    navigate({ to: '/notifications' })
  }

  const unread = unreadCount ?? 0
  const isLoading = isNotificationsLoading || isCountLoading

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-full border border-slate-200/70 bg-white/80 text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-white hover:text-slate-900 dark:border-white/[0.07] dark:bg-secondary/80 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          {unread > 0 ? (
            <IconBellFilled
              size={18}
              className="text-amber-500 dark:text-amber-400"
            />
          ) : (
            <IconBell size={18} />
          )}

          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80 sm:w-96"
        align="end"
        sideOffset={8}
        forceMount
      >
        <DropdownMenuLabel className="flex items-center justify-between px-4 py-2">
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Notifications
            {unread > 0 && (
              <span className="ml-2 text-xs font-normal text-slate-500 dark:text-slate-400">
                ({unread} unread)
              </span>
            )}
          </span>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsReadMutation.isPending}
            >
              <IconCheck size={14} className="mr-1" />
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <div className="max-h-[320px] overflow-y-auto">
          <DropdownMenuGroup>
            {isLoading && notifications.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 dark:border-slate-600 dark:border-t-blue-400" />
              </div>
            )}

            {!isLoading && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <IconBell
                  size={28}
                  className="text-slate-300 dark:text-slate-600"
                />
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  No notifications yet
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  We'll notify you when something arrives
                </p>
              </div>
            )}

            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="p-0 focus:bg-transparent"
                onSelect={(e) => e.preventDefault()}
              >
                <NotificationItem
                  notification={notification}
                  onMarkRead={handleMarkAsRead}
                />
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </div>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="px-4 py-2 text-center">
              <Button
                variant="link"
                size="sm"
                className="h-7 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                onClick={handleViewAll}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

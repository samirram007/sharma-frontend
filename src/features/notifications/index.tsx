import { Main } from '@/layouts/components/main'
import { columns } from './components/columns'
import { NotificationsDataTable } from './components/data-table'
import { useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useNotifications } from './data/queryOptions'
import { NotificationsToolbar } from './components/notifications-toolbar'
import { useCallback, useState } from 'react'
import type { NotificationFilter } from './data/schema'

export default function NotificationsPage() {
  const [filters, setFilters] = useState<NotificationFilter>({
    page: 1,
    perPage: 20,
    type: '',
    is_read: undefined,
  })

  const { data, isLoading } = useNotifications(filters)
  const markAsRead = useMarkNotificationAsRead()
  const markAllAsRead = useMarkAllNotificationsAsRead()

  const notifications = data?.items ?? []
  const totalPages = data?.totalPages ?? 1

  const handleFilterChange = useCallback((partial: Partial<NotificationFilter>) => {
    setFilters((prev) => ({ ...prev, ...partial, page: 1 }))
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }, [])

  const handlePerPageChange = useCallback((perPage: number) => {
    setFilters((prev) => ({ ...prev, perPage, page: 1 }))
  }, [])

  const handleMarkAsRead = useCallback(
    (id: number) => {
      markAsRead.mutate(id)
    },
    [markAsRead],
  )

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead.mutate()
  }, [markAllAsRead])

  return (
    <Main>
      <div className='mb-2 flex flex-wrap items-center justify-between space-y-2 gap-x-4'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Notifications</h2>
          <p className='text-muted-foreground'>
            View and manage all your application notifications
          </p>
        </div>
      </div>
      <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
        <NotificationsDataTable
          data={notifications}
          columns={columns({ onMarkRead: handleMarkAsRead })}
          filters={filters}
          totalPages={totalPages}
          isLoading={isLoading}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
          toolbar={
            <NotificationsToolbar
              filters={filters}
              onFilterChange={handleFilterChange}
              onMarkAllAsRead={handleMarkAllAsRead}
              isMarkingAll={markAllAsRead.isPending}
            />
          }
        />
      </div>
    </Main>
  )
}

export interface NotificationFilter {
  page: number
  perPage: number
  type: string
  is_read: boolean | undefined
}

export interface NotificationsResponse {
  status: boolean
  success: boolean
  code: number
  message: string
  data: NotificationItem[]
  meta?: {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
  }
  links?: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
}

export interface NotificationItem {
  id: number
  type: 'warning' | 'error' | 'info' | 'success'
  title: string
  message: string | null
  relatedEntityType: string | null
  relatedEntityId: number | null
  voucherId: number | null
  field: string | null
  userId: number | null
  isRead: boolean
  createdAt: string
  updatedAt: string
}

export const NOTIFICATION_TYPES = [
  { label: 'All Types', value: '' },
  { label: 'Warning', value: 'warning' },
  { label: 'Error', value: 'error' },
  { label: 'Info', value: 'info' },
  { label: 'Success', value: 'success' },
] as const

export const READ_STATUS_OPTIONS = [
  { label: 'All', value: undefined },
  { label: 'Unread', value: true },
  { label: 'Read', value: false },
] as const

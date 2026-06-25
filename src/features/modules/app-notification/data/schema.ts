export interface AppNotification {
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

export interface AppNotificationResponse {
  status: boolean
  success: boolean
  code: number
  message: string
  data: AppNotification[]
}

export interface AppNotificationSingleResponse {
  status: boolean
  success: boolean
  code: number
  message: string
  data: AppNotification
}

export interface UnreadCountResponse {
  status: boolean
  success: boolean
  data: {
    count: number
  }
}

export interface AppNotificationFormData {
  type: 'warning' | 'error' | 'info' | 'success'
  title: string
  message?: string
  related_entity_type?: string
  related_entity_id?: number
  voucher_id?: number
  field?: string
  user_id?: number
}

export interface ValidateFreightResponse {
  status: string
  success: boolean
  data: AppNotification[]
}

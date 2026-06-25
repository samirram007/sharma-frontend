import { deleteData, getData, patchData, postData } from '@/utils/dataClient'
import type {
  AppNotificationResponse,
  AppNotificationSingleResponse,
  UnreadCountResponse,
  ValidateFreightResponse,
} from './schema'

// General notification endpoints

export async function fetchNotificationsService(
  page: number = 1,
  perPage: number = 15,
): Promise<AppNotificationResponse> {
  return await getData(`/app-notifications?page=${page}&per_page=${perPage}`)
}

export async function fetchMyNotificationsService(
  page: number = 1,
  perPage: number = 15,
): Promise<AppNotificationResponse> {
  return await getData(`/app-notifications/my?page=${page}&per_page=${perPage}`)
}

export async function fetchUnreadCountService(): Promise<UnreadCountResponse> {
  return await getData('/app-notifications/unread-count')
}

export async function fetchNotificationByIdService(
  id: number,
): Promise<AppNotificationSingleResponse> {
  return await getData(`/app-notifications/${id}`)
}

export async function createNotificationService(
  data: Record<string, unknown>,
): Promise<AppNotificationSingleResponse> {
  return await postData('/app-notifications', data)
}

export async function markAsReadService(
  id: number,
): Promise<{ status: boolean; success: boolean; message: string }> {
  return await patchData(`/app-notifications/${id}/read`, {})
}

export async function markAllAsReadService(): Promise<{
  status: boolean
  success: boolean
  message: string
}> {
  return await patchData('/app-notifications/read-all', {})
}

export async function deleteNotificationService(
  id: number,
): Promise<{ status: boolean; code: number; message: string }> {
  return await deleteData(`/app-notifications/${id}`)
}

// Freight validation
export async function validateFreightService(
  voucherId: number,
  dispatchDetail: Record<string, unknown>,
): Promise<ValidateFreightResponse> {
  return await postData('/app-notifications/validate-freight', {
    voucher_id: voucherId,
    dispatch_detail: dispatchDetail,
  })
}

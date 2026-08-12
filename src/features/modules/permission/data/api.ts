import { getData, postData, putData } from '@/utils/dataClient'

const API_PATH = '/permissions'
export async function fetchPermissionService() {
  return await getData(API_PATH)
}
export async function storePermissionService(payload: any) {
  return await postData(API_PATH, payload)
}
export async function updatePermissionService(payload: any) {
  return await putData(`${API_PATH}/${payload.id}`, payload)
}

/** Fetch all features grouped by module with permission status for a given role. */
export async function fetchFeaturesWithRolePermissionsService(roleId: number) {
  return await getData(`/role/${roleId}/menu-permissions`)
}

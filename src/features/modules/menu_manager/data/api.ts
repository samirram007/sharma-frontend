import { getData } from '@/utils/dataClient'

export async function fetchRoleMenuPermissionsService(roleId: number) {
  return await getData(`/role/${roleId}/menu-permissions`)
}

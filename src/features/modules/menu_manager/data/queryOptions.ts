import { queryOptions } from '@tanstack/react-query'
import { fetchRoleMenuPermissionsService } from './api'

const BASE_KEY = 'MenuPermissions'

export const roleMenuPermissionsQueryOptions = (roleId?: number) => {
  return queryOptions({
    queryKey: [BASE_KEY, roleId],
    queryFn: () => fetchRoleMenuPermissionsService(roleId!),
    enabled: !!roleId,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })
}

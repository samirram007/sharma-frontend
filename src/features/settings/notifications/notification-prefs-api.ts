import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getData, putData } from '@/utils/dataClient'

export interface NotificationPreference {
  id: number
  type: 'warning' | 'error' | 'info' | 'success'
  inApp: boolean
}

interface PrefsResponse {
  status: boolean
  success: boolean
  data: NotificationPreference[]
}

const PREFS_KEY = ['user', 'notification-preferences'] as const

const TYPE_LABELS: Record<string, { label: string; description: string }> = {
  warning: {
    label: 'Warnings',
    description:
      'Missing or incomplete data warnings (e.g., freight validation)',
  },
  error: {
    label: 'Errors',
    description: 'System errors and failed operations',
  },
  info: {
    label: 'Info',
    description: 'General information and updates',
  },
  success: {
    label: 'Success',
    description: 'Successful operations and completions',
  },
}

export function getTypeLabel(type: string): {
  label: string
  description: string
} {
  return TYPE_LABELS[type] ?? { label: type, description: '' }
}

/**
 * Fetch notification preferences for the current user
 */
export function useNotificationPreferences() {
  return useQuery<NotificationPreference[]>({
    queryKey: PREFS_KEY,
    queryFn: async () => {
      const response: PrefsResponse = await getData(
        '/user/notification-preferences',
      )
      return response.data ?? []
    },
    staleTime: 60_000,
    retry: 1,
  })
}

/**
 * Update notification preferences for the current user
 */
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (preferences: { type: string; in_app: boolean }[]) => {
      return await putData('/user/notification-preferences', { preferences })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PREFS_KEY })
    },
  })
}

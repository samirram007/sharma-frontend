import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateReportingPeriodService } from './api'

/** Payload sent to POST /reporting_period — dates as plain Y-m-d strings
 *  (avoids JS Date → ISO-UTC serialization shifting the day in non-UTC TZs). */
export type ReportingPeriodPayload = {
  id?: number
  startDate: string | Date | null
  endDate: string | Date | null
}

export function useReportingPeriodMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ReportingPeriodPayload) => {
      if (data.id) {
        // Update if id exists
        return await updateReportingPeriodService(data)
      }
      // Otherwise create
      console.log('reporting period Data: ', data)
      return await updateReportingPeriodService(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries()
    },
    onError: (error) => {
      console.error('Reporting period mutation failed:', error)
    },
  })
}

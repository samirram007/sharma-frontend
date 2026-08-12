import { queryOptions } from '@tanstack/react-query'
import { fetchDeliveryNoteZoneWiseReportService } from './api'

export const deliveryNoteZoneWiseQueryOptions = () => {
  return queryOptions({
    queryKey: ['delivery-note-zone-wise'],
    queryFn: () => fetchDeliveryNoteZoneWiseReportService(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

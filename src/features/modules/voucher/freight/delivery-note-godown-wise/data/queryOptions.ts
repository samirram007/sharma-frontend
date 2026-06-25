import { queryOptions } from "@tanstack/react-query"
import { fetchDeliveryNoteGodownWiseReportService } from "./api"

export const deliveryNoteGodownWiseQueryOptions = (zoneId?: number, godownId?: number) => {
  return queryOptions({
    queryKey: ["delivery-note-godown-wise", zoneId, godownId],
    queryFn: () => fetchDeliveryNoteGodownWiseReportService(zoneId, godownId),
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled: !!zoneId,
  })
}

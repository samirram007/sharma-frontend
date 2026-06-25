import { getData } from "@/utils/dataClient"

const API_PATH = "/freights_delivery_note_godown_wise"

async function fetchDeliveryNoteGodownWiseReportService(zoneId?: number, godownId?: number) {
    const params = new URLSearchParams()
    if (zoneId) params.set('zone_id', String(zoneId))
    if (godownId) params.set('godown_id', String(godownId))
    const query = params.toString()
    return await getData(`${API_PATH}${query ? `?${query}` : ''}`)
}

export { fetchDeliveryNoteGodownWiseReportService }

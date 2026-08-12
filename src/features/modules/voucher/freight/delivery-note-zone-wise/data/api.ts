import { getData } from '@/utils/dataClient'

const API_PATH = '/freights_delivery_note_zone_wise'

async function fetchDeliveryNoteZoneWiseReportService() {
  return await getData(`${API_PATH}`)
}

export { fetchDeliveryNoteZoneWiseReportService }

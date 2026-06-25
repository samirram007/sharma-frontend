import { getData } from "@/utils/dataClient";

const API_PATH = "/freights_zone_wise"

async function fetchZoneWiseReportService() {
    return await getData(`${API_PATH}`);
}

export { fetchZoneWiseReportService };

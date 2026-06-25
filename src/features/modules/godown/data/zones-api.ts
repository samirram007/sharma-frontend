import { getData } from "@/utils/dataClient"

export async function fetchZonesService() {
    return await getData('/zones')
}

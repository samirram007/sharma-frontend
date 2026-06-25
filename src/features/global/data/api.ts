import { postData } from "@/utils/dataClient";

async function updateReportingPeriodService(payload: any) {

    return await postData(`/reporting_period`, payload)
}
export { updateReportingPeriodService };
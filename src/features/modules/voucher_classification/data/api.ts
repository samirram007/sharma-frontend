import { getData, postData, putData } from "@/utils/dataClient";

const API_PATH = "/voucher_classifications"
async function fetchVoucherClassificationService() {
    return await getData(API_PATH)
}
async function storeVoucherClassificationService(payload: any) {
    return await postData(API_PATH, payload)
}
async function updateVoucherClassificationService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}
async function deleteVoucherClassificationService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}

export { deleteVoucherClassificationService, fetchVoucherClassificationService, storeVoucherClassificationService, updateVoucherClassificationService };


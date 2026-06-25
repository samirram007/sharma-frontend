import { getData, postData, putData } from "@/utils/dataClient";


const API_PATH = "/receipt_vouchers"

async function fetchReceiptService() {

    return await getData(API_PATH)
}
async function storeReceiptService(payload: any) {
    return await postData(API_PATH, payload)
}
async function updateReceiptService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}
async function deleteReceiptService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}

export { deleteReceiptService, fetchReceiptService, storeReceiptService, updateReceiptService };


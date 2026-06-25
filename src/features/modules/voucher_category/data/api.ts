import { getData, postData, putData } from "@/utils/dataClient";


const API_PATH = "/voucher_categories"

async function fetchVoucherCategoryService() {
    return await getData(API_PATH)
}
async function storeVoucherCategoryService(payload: any) {
    return await postData(API_PATH, payload)
}
async function updateVoucherCategoryService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}
async function deleteVoucherCategoryService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}

export { deleteVoucherCategoryService, fetchVoucherCategoryService, storeVoucherCategoryService, updateVoucherCategoryService };


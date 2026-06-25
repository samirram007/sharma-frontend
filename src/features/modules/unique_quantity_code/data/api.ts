import { deleteData, getData, postData, putData } from "@/utils/dataClient";


const API_PATH = "/unique_quantity_codes"

async function fetchUniqueQuantityCodeService() {
    return await getData(API_PATH)
}
async function storeUniqueQuantityCodeService(payload: any) {
    return await postData(API_PATH, payload)
}
async function updateUniqueQuantityCodeService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}
async function deleteUniqueQuantityCodeService(payload: any) {
    return await deleteData(`${API_PATH}/${payload.id}`)
}

export { deleteUniqueQuantityCodeService, fetchUniqueQuantityCodeService, storeUniqueQuantityCodeService, updateUniqueQuantityCodeService };


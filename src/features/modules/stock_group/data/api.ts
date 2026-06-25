import { getData, postData, putData } from "@/utils/dataClient";


const API_PATH = "/stock_groups"

async function fetchStockGroupService() {
    return await getData(API_PATH)
}
async function storeStockGroupService(payload: any) {
    return await postData(API_PATH, payload)
}
async function updateStockGroupService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}
async function deleteStockGroupService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}

export { deleteStockGroupService, fetchStockGroupService, storeStockGroupService, updateStockGroupService };


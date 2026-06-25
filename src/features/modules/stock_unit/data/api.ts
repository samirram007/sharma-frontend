import { deleteData, getData, postData, putData } from "@/utils/dataClient";


const API_PATH = "/stock_units"

async function fetchStockUnitService() {
    return await getData(API_PATH)
}
async function storeStockUnitService(payload: any) {
    return await postData(API_PATH, payload)
}
async function updateStockUnitService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}
async function deleteStockUnitService(payload: any) {
    return await deleteData(`${API_PATH}/${payload.id}`)
}

export { deleteStockUnitService, fetchStockUnitService, storeStockUnitService, updateStockUnitService };


import { getData, postData, putData } from "@/utils/dataClient";


const API_PATH = "/stock_categories"

async function fetchStockCategoryService() {
    return await getData(API_PATH)
}
async function storeStockCategoryService(payload: any) {
    return await postData(API_PATH, payload)
}
async function updateStockCategoryService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}
async function deleteStockCategoryService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}

export { deleteStockCategoryService, fetchStockCategoryService, storeStockCategoryService, updateStockCategoryService };


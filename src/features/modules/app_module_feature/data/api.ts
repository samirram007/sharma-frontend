import { deleteData, getData, postData, putData } from "@/utils/dataClient";


const API_PATH = "/app_module_features"

async function fetchAppModuleFeatureService() {
    return await getData(API_PATH)
}
async function fetchAppModuleFeatureByIdService(id: number) {
    return await getData(`${API_PATH}/${id}`)
}
async function storeAppModuleFeatureService(payload: any) {
    return await postData(API_PATH, payload)
}
async function updateAppModuleFeatureService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}
async function deleteAppModuleFeatureService(payload: any) {
    console.log(payload)
    return await deleteData(`${API_PATH}/${payload.id}`)
}

export { deleteAppModuleFeatureService, fetchAppModuleFeatureByIdService, fetchAppModuleFeatureService, storeAppModuleFeatureService, updateAppModuleFeatureService };


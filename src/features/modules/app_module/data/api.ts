import { deleteData, getData, postData, putData } from '@/utils/dataClient'

const API_PATH = '/app_modules'

async function fetchAppModuleService() {
  return await getData(API_PATH)
}
async function storeAppModuleService(payload: any) {
  return await postData(API_PATH, payload)
}
async function updateAppModuleService(payload: any) {
  return await putData(`${API_PATH}/${payload.id}`, payload)
}
async function deleteAppModuleService(payload: any) {
  return await deleteData(`${API_PATH}/${payload.id}`)
}

export {
  deleteAppModuleService,
  fetchAppModuleService,
  storeAppModuleService,
  updateAppModuleService,
}

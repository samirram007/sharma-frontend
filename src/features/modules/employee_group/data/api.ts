import { getData, postData, putData } from "@/utils/dataClient";


const API_PATH = "/employee_groups"

async function fetchEmployeeGroupService() {
    return await getData(API_PATH)
}
async function storeEmployeeGroupService(payload: any) {
    return await postData(API_PATH, payload)
}
async function updateEmployeeGroupService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}
async function deleteEmployeeGroupService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}

export { deleteEmployeeGroupService, fetchEmployeeGroupService, storeEmployeeGroupService, updateEmployeeGroupService };


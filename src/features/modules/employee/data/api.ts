import { getData, postData, putData } from "@/utils/dataClient"


const API_PATH = "/employees"
export async function fetchEmployeeService() {
    return await getData(API_PATH)
}
export async function fetchEmployeeByIdService(id: number) {
    return await getData(`${API_PATH}/${id}`)
}

export async function storeEmployeeService(payload: any) {
    console.log("Employee payload: ", payload)
    return await postData(API_PATH, payload)
}
export async function updateEmployeeService(payload: any) {
    console.log(payload)
    return await putData(`${API_PATH}/${payload.id}`, payload)
}
import { getData, postData, putData } from '@/utils/dataClient'

const API_PATH = '/users'
export async function fetchUserService() {
  return await getData(API_PATH)
}
export async function fetchUserByIdService(id: number) {
  return await getData(`${API_PATH}/${id}`)
}

export async function storeUserService(payload: any) {
  console.log('User payload: ', payload)
  return await postData(API_PATH, payload)
}
export async function updateUserService(payload: any) {
  return await putData(`${API_PATH}/${payload.id}`, payload)
}

export async function assignUserRoleService(payload: any) {
  return await postData(`user_roles`, payload)
}

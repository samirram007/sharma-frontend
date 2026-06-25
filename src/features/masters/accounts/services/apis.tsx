import { getData, postData, putData } from "@/utils/dataClient";







export async function fetchAccountGroupService() {
    return await getData("/account_groups")
}
export async function fetchCurrentLiabitityGroupService() {
    return await getData("/current_liability_groups")
}

export async function fetchVoucherTypeService() {
    return await getData("/voucher_types")
}

export async function storeAccountGroupService(payload: any) {
    return await postData("/account_groups", payload)
}
export async function updateAccountGroupService(payload: any) {
    return await putData(`/account_groups/${payload.id}`, payload)
}


export async function fetchUserProfileService() {
    return await getData("/auth/profile")
}
export async function loginService(payload: any) {
    const data = await postData("/auth/login", payload)
    return data;
}
export async function logoutService() {
    const data = await postData("/auth/logout", [])
    return data;
    //return  (await axiosClient.post("/logout", []))
}






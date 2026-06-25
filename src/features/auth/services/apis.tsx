import { getData, postData } from "@/utils/dataClient";









export async function fetchUserProfileService() {
    // console.log('loginService called');

    return await getData("/auth/profile")
}
export async function loginService(payload: any) {
    // console.log('loginService called', payload);
    const data = await postData("/auth/login", payload)
    //console.log(data);
    return data;

    // return (await axiosClient.post("/auth/login", payload)).data
}
export async function changePasswordService(payload: any) {

  return await postData('/auth/change-password', payload)
}

export async function logoutService() {
    // console.log('logoutService called');
    const data = await postData("/auth/logout", [])
    console.log(data);
    return data;
    //return  (await axiosClient.post("/logout", []))
}






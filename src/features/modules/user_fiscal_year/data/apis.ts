import { postData } from "@/utils/dataClient";

const API_PATH = "/user_fiscal_years"
export async function storeUserFiscalYearService(payload: any) {
    console.log(payload

    )
    return await postData(API_PATH, payload)
}
import { getData, postData, putData } from "@/utils/dataClient";

async function fetchAccountLedgerService() {
    return await getData("/account_ledgers")
}
async function storeAccountLedgerService(payload: any) {
    return await postData("/account_ledgers", payload)
}
async function updateAccountLedgerService(payload: any) {
    return await putData(`/account_ledgers/${payload.id}`, payload)
}
export { fetchAccountLedgerService, storeAccountLedgerService, updateAccountLedgerService };

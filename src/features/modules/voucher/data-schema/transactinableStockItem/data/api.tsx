import { getData } from "@/utils/dataClient"

const PURCHASE_API_PATH = "/purchase_ledgers"
const SALE_API_PATH = "/sale_ledgers"
export async function fetchPurchaseLedgerService() {
    return await getData(`${PURCHASE_API_PATH}`)
}
export async function fetchPurchaseLedgerByIdService(id: number) {
    return await getData(`${PURCHASE_API_PATH}/${id}`)
}

export async function fetchSaleLedgerService() {
    return await getData(`${SALE_API_PATH}`)
}
export async function fetchSaleLedgerByIdService(id: number) {
    return await getData(`${SALE_API_PATH}/${id}`)
}

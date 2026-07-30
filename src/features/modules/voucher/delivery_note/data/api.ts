import { getData, postData, putData } from "@/utils/dataClient"


const API_PATH = "/vouchers"
export async function fetchDeliveryNoteService() {
    return await getData(API_PATH)
}
export async function fetchDeliveryNoteByIdService(id: number) {
    // console.log(`${API_PATH} / ${id}`)
    return await getData(`${API_PATH}/${id}`)
}

export async function storeDeliveryNoteService(payload: any) {
    console.log("Delivery Note payload", payload)
    return await postData(API_PATH, payload)
}
export async function updateDeliveryNoteService(payload: any) {
    console.log("Delivery Note payload", payload)
    // return
    return await putData(`${API_PATH}/${payload.id}`, payload)
}

export async function fetchPurchaseLedgersService() {
    return await getData('purchase_ledgers')
}
export async function fetchSaleLedgersService() {
    return await getData('sale_ledgers')
}
export async function fetchStockInHandLedgersService() {
    return await getData('stock_in_hand_ledgers')
}
export async function fetchLedgerBalanceService(id: number) {
    return await getData(`ledger_balance/${id}`)
}
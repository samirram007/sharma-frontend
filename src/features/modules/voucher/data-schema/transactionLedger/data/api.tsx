import { getData } from "@/utils/dataClient"

const PURCHASE_API_PATH = "/purchasable_stock_items"
const SALE_API_PATH = "/salable_stock_items"
export async function fetchPurchasableStockItemService() {
    return await getData(`${PURCHASE_API_PATH}`)
}
export async function fetchPurchasableStockItemByIdService(id: number) {
    return await getData(`${PURCHASE_API_PATH}/${id}`)
}
export async function fetchSalableStockItemService() {
    return await getData(`${SALE_API_PATH}`)
}
export async function fetchSalableStockItemByIdService(id: number) {
    return await getData(`${SALE_API_PATH}/${id}`)
}

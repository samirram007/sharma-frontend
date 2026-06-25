


// fetchFreightReceiptService

import { getData, postData } from "@/utils/dataClient"


export const fetchFreightReceiptService = async (freightId: number) => {

    const data = await getData(`/freight_receipt_vouchers/${freightId}`)
    console.log("fetchFreightReceiptService", data)
    return data
}

export const createFreightReceiptService = async (data: any) => {

    console.log("createFreightReceiptService", data)
    const response = await postData(`/freight_receipt_vouchers`, data)
    return response
}
export const updateFreightReceiptService = async (receiptId: number, data: any) => {

    const response = await postData(`/freight_receipt_vouchers/${receiptId}`, data)
    console.log("updateFreightReceiptService", response)
    return response
}
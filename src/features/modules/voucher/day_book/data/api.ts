import { getData, postData, putData } from "@/utils/dataClient";


const API_PATH = "/day_books"

export interface DayBookParams {
    page?: number
    per_page?: number
    search?: string
    voucher_type_id?: number[] | string
}

async function fetchDayBookService(params?: DayBookParams) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set('page', String(params.page))
    if (params?.per_page) queryParams.set('per_page', String(params.per_page))
    if (params?.search) queryParams.set('search', params.search)
    if (params?.voucher_type_id) {
        const ids = Array.isArray(params.voucher_type_id)
            ? params.voucher_type_id.join(',')
            : params.voucher_type_id
        queryParams.set('voucher_type_id', ids)
    }
    const qs = queryParams.toString()
    return await getData(`${API_PATH}${qs ? `?${qs}` : ''}`)
}

async function fetchDayBookSelfService(params?: DayBookParams) {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set('page', String(params.page))
    if (params?.per_page) queryParams.set('per_page', String(params.per_page))
    if (params?.search) queryParams.set('search', params.search)
    if (params?.voucher_type_id) {
        const ids = Array.isArray(params.voucher_type_id)
            ? params.voucher_type_id.join(',')
            : params.voucher_type_id
        queryParams.set('voucher_type_id', ids)
    }
    const qs = queryParams.toString()
    return await getData(`${API_PATH}_self${qs ? `?${qs}` : ''}`)
}

async function storeDayBookService(payload: any) {
    return await postData(API_PATH, payload)
}
async function updateDayBookService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}
async function deleteDayBookService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}

async function fetchUsedVoucherTypesService() {
    return await getData(`${API_PATH}_used_voucher_types`)
}

export { deleteDayBookService, fetchDayBookService, fetchDayBookSelfService, storeDayBookService, updateDayBookService, fetchUsedVoucherTypesService };


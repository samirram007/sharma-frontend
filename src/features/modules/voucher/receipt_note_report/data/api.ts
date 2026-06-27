import { getData } from "@/utils/dataClient";

const API_PATH = "/receipt_note_report"

export interface ReceiptNoteReportParams {
    page?: number
    per_page?: number
    search?: string
    sort_by?: string
    sort_order?: string
}

function appendQueryParams(params?: ReceiptNoteReportParams): string {
    const qp = new URLSearchParams()
    if (params?.page) qp.set('page', String(params.page))
    if (params?.per_page) qp.set('per_page', String(params.per_page))
    if (params?.search) qp.set('search', params.search)
    if (params?.sort_by) qp.set('sort_by', params.sort_by)
    if (params?.sort_order) qp.set('sort_order', params.sort_order)
    const qs = qp.toString()
    return qs ? `?${qs}` : ''
}

export async function fetchReceiptNoteReport(params?: ReceiptNoteReportParams) {
    return await getData(`${API_PATH}${appendQueryParams(params)}`)
}

export async function fetchGroupedByLedger() {
    return await getData(`${API_PATH}/grouped-by-ledger`)
}

export async function fetchGroupedByStockItem() {
    return await getData(`${API_PATH}/grouped-by-stock-item`)
}

export async function fetchGroupedByGodown() {
    return await getData(`${API_PATH}/grouped-by-godown`)
}

export async function fetchGroupedByDate() {
    return await getData(`${API_PATH}/grouped-by-date`)
}

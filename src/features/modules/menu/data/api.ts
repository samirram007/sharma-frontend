import { deleteData, getData, postData, putData } from "@/utils/dataClient"

const API_PATH = "/menus"

export async function fetchMenuService() {
    return await getData(API_PATH)
}

export async function fetchMenuByIdService(id: number) {
    return await getData(`${API_PATH}/${id}`)
}

export async function storeMenuService(payload: any) {
    return await postData(API_PATH, payload)
}

export async function updateMenuService(payload: any) {
    return await putData(`${API_PATH}/${payload.id}`, payload)
}

export async function deleteMenuService(payload: any) {
    return await deleteData(`${API_PATH}/${payload.id}`)
}

/** Fetch the hierarchical menu tree for the management UI. */
export async function fetchMenuTreeService() {
    return await getData('/menu_tree')
}

/** Batch reorder menu items (drag & drop). */
export async function reorderMenuService(items: { id: number; sort_order: number; parent_id?: number | null }[]) {
    return await postData('/menus/reorder', { items })
}

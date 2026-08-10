import { deleteData, getData, patchData, postData, putData } from "@/utils/dataClient"

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

/** Quick inline update — updates a single field on a menu item. */
export async function patchMenuService(id: number, payload: Partial<{
    menu_name?: string;
    is_visible?: boolean;
    is_top_menu?: boolean;
    status?: string;
    sort_order?: number;
}>) {
    return await patchData(`${API_PATH}/${id}`, payload)
}

/** Batch reorder menu items (drag & drop). */
export async function reorderMenuService(items: { id: number; sort_order: number; parent_id?: number | null }[]) {
    return await postData('/menus/reorder', { items })
}

/** Batch update menu items (toggle visibility/status, etc.). */
export async function batchUpdateMenuService(ids: number[], data: Record<string, unknown>) {
    return await postData('/menus/batch-update', { ids, data })
}

/** Batch delete menu items. */
export async function batchDeleteMenuService(ids: number[]) {
    return await postData('/menus/batch-delete', { ids })
}

/** Duplicate a menu entry and all its children. */
export async function duplicateMenuService(id: number) {
    return await postData(`/menus/${id}/duplicate`, {})
}

/** Export all menu entries as JSON. */
export async function exportMenuService() {
    return await getData('/menus/export')
}

/** Import menu entries from JSON array. */
export async function importMenuService(items: Record<string, unknown>[]) {
    return await postData('/menus/import', { items })
}

/** Server-side search menu entries with pagination. */
export async function searchMenuService(search: string, perPage = 20) {
    return await getData(`/menus/search?search=${encodeURIComponent(search)}&per_page=${perPage}`)
}

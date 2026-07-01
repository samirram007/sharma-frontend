import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import type { MenuForm } from "../types/types"
import {
    deleteMenuService,
    fetchMenuByIdService,
    fetchMenuService,
    fetchMenuTreeService,
    reorderMenuService,
    storeMenuService,
    updateMenuService,
} from "./api"

const BASE_KEY = "Menus"

export const MenuQueryOptions = (id?: number) => {
    return queryOptions({
        queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
        queryFn: () =>
            id ? fetchMenuByIdService(id) : fetchMenuService(),
        staleTime: 1000 * 60 * 5,
        retry: 1,
    })
}

/** Query options for the hierarchical menu tree. */
export const MenuTreeQueryOptions = queryOptions({
    queryKey: [BASE_KEY, 'tree'],
    queryFn: () => fetchMenuTreeService(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
})

export function useMenuMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: MenuForm & { id?: number }) => {
            if (data.id) {
                return await updateMenuService(data)
            }
            return await storeMenuService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
        },
        onError: (error) => {
            console.error("Menu mutation failed:", error)
        },
    })
}

export function useMenuDeleteMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (id: number) => {
            return await deleteMenuService({ id })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
        },
        onError: (error) => {
            console.error("Menu delete failed:", error)
        },
    })
}

export function useMenuReorderMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (items: { id: number; sort_order: number; parent_id?: number | null }[]) => {
            return await reorderMenuService(items)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
        },
        onError: (error) => {
            console.error("Menu reorder failed:", error)
        },
    })
}

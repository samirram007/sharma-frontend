import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchStorageUnitByIdService, fetchStorageUnitService, storeStorageUnitService, updateStorageUnitService } from "./api"
import type { StorageUnitForm } from "./schema"

const BASE_KEY = "storageUnits"

export const storageUnitQueryOptions = (id?: number) => {

    return queryOptions({
        queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
        queryFn: () =>
            id ? fetchStorageUnitByIdService(id) : fetchStorageUnitService(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}

export function useStorageUnitMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: StorageUnitForm & { id?: number }) => {
            if (data.id) {
                // Update if id exists
                return await updateStorageUnitService(data)
            }
            // Otherwise create
            return await storeStorageUnitService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
        },
        onError: (error) => {
            console.error("StorageUnit mutation failed:", error)
        },
    })
}
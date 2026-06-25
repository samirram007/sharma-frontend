import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchSupplierByIdService, fetchSupplierService, storeSupplierService, updateSupplierService } from "./api"
import type { SupplierForm } from "./schema"

const BASE_KEY = "companies"

export const supplierQueryOptions = (id?: number) => {

    return queryOptions({
        queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
        queryFn: () =>
            id ? fetchSupplierByIdService(id) : fetchSupplierService(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}

export function useSupplierMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: SupplierForm & { id?: number }) => {
            if (data.id) {
                // Update if id exists
                return await updateSupplierService(data)
            }
            // Otherwise create
            return await storeSupplierService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
        },
        onError: (error) => {
            console.error("Supplier mutation failed:", error)
        },
    })
}
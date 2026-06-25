import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchDistributorByIdService, fetchDistributorService, storeDistributorService, updateDistributorService } from "./api"
import type { DistributorForm } from "./schema"

const BASE_KEY = "distributor"

export const distributorQueryOptions = (id?: number) => {

    return queryOptions({
        queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
        queryFn: () =>
            id ? fetchDistributorByIdService(id) : fetchDistributorService(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}

export function useDistributorMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: DistributorForm & { id?: number }) => {
            if (data.id) {
                // Update if id exists
                return await updateDistributorService(data)
            }
            // Otherwise create
            return await storeDistributorService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
            queryClient.invalidateQueries({ queryKey: ["accountLedgers", "distributor_ledgers"] })
        },
        onError: (error) => {
            console.error("Distributor mutation failed:", error)
        },
    })
}
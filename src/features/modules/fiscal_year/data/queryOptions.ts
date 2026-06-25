import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchFiscalYearByIdService, fetchFiscalYearService, storeFiscalYearService, updateFiscalYearService } from "./api"
import type { FiscalYearForm } from "./schema"

const BASE_KEY = "fiscalYears"

export const fiscalYearQueryOptions = (id?: number) => {

    return queryOptions({
        queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
        queryFn: () =>
            id ? fetchFiscalYearByIdService(id) : fetchFiscalYearService(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}

export function useFiscalYearMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: FiscalYearForm & { id?: number }) => {
            if (data.id) {
                // Update if id exists
                return await updateFiscalYearService(data)
            }
            // Otherwise create
            return await storeFiscalYearService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
        },
        onError: (error) => {
            console.error("FiscalYear mutation failed:", error)
        },
    })
}
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchCompanyByIdService, fetchCompanyService, storeCompanyService, updateCompanyService } from "./api"
import type { CompanyForm } from "./schema"

const BASE_KEY = "companies"

export const companyQueryOptions = (id?: number) => {

    return queryOptions({
        queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
        queryFn: () =>
            id ? fetchCompanyByIdService(id) : fetchCompanyService(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}

export function useCompanyMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: CompanyForm & { id?: number }) => {
            if (data.id) {
                // Update if id exists
                return await updateCompanyService(data)
            }
            // Otherwise create
            return await storeCompanyService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
        },
        onError: (error) => {
            console.error("Company mutation failed:", error)
        },
    })
}
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchGstRegistrationTypeByIdService, fetchGstRegistrationTypeService, storeGstRegistrationTypeService, updateGstRegistrationTypeService } from "./api"
import type { GstRegistrationTypeForm } from "./schema"
//queryOptions.ts
const BASE_KEY = "gstRegistrationTypes"
export const gstRegistrationTypeQueryOptions = (id?: number) => {

    return queryOptions({
        queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
        queryFn: () =>
            id ? fetchGstRegistrationTypeByIdService(id) : fetchGstRegistrationTypeService(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}
export function useGstRegistrationTypeMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: GstRegistrationTypeForm & { id?: number }) => {
            if (data.id) {
                // Update if id exists
                return await updateGstRegistrationTypeService(data)
            }
            // Otherwise create
            return await storeGstRegistrationTypeService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
        },
        onError: (error) => {
            console.error("GstRegistrationType mutation failed:", error)
        },
    })
}
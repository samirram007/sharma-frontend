import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchAddressService, storeAddressService, updateAddressService } from "./api"
import type { AddressForm } from "./schema"
//queryOptions.ts
const Key = "addresss"
export const addressQueryOptions = (key: string = Key) => {
    return queryOptions({
        queryKey: [key],
        queryFn: fetchAddressService,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}
export function useAddressMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: AddressForm & { id?: number }) => {
            if (data.id) {
                // Update if id exists
                return await updateAddressService(data)
            }
            // Otherwise create
            console.log("employee Data: ", data)
            return await storeAddressService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [Key] })
        },
        onError: (error) => {
            console.error("Address mutation failed:", error)
        },
    })
}
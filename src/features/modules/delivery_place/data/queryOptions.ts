import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchDeliveryPlaceService, storeDeliveryPlaceService, updateDeliveryPlaceService, } from "./api"
import type { DeliveryPlaceForm } from "./schema"
//queryOptions.ts
const Key = "deliveryPlaces"
export const deliveryPlaceQueryOptions = (key: string = Key) => {
    return queryOptions({
        queryKey: [key],
        queryFn: fetchDeliveryPlaceService,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}
export function useDeliveryPlaceMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: DeliveryPlaceForm & { id?: number }) => {
            if (data.id) {
                // Update if id exists
                return await updateDeliveryPlaceService(data)
            }
            // Otherwise create
            return await storeDeliveryPlaceService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [Key] })
        },
        onError: (error) => {
            console.error("DeliveryPlace mutation failed:", error)
        },
    })
}
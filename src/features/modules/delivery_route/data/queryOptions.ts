import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchDeliveryRouteService, storeDeliveryRouteService, updateDeliveryRouteService, } from "./api"
import type { DeliveryRouteForm } from "./schema"
//queryOptions.ts
const Key = "deliveryRoutes"
export const deliveryRouteQueryOptions = (key: string = Key) => {
    return queryOptions({
        queryKey: [key],
        queryFn: fetchDeliveryRouteService,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}
export function useDeliveryRouteMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: DeliveryRouteForm & { id?: number }) => {
            if (data.id) {
                // Update if id exists
                return await updateDeliveryRouteService(data)
            }
            // Otherwise create
            return await storeDeliveryRouteService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [Key] })
        },
        onError: (error) => {
            console.error("DeliveryRoute mutation failed:", error)
        },
    })
}
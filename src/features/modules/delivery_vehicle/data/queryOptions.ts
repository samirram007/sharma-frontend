import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchDeliveryVehicleByIdService, fetchDeliveryVehicleService, storeDeliveryVehicleService, updateDeliveryVehicleService, } from "./api"
import type { DeliveryVehicleForm } from "./schema"
//queryOptions.ts
const BASE_KEY = "delivery_vehicles"
// export const deliveryVehicleQueryOptions = (key: string = BASE_KEY) => {
//     return queryOptions({
//         queryKey: [key],
//         queryFn: fetchDeliveryVehicleService,
//         staleTime: 1000 * 60 * 5, // 5 minutes
//         retry: 1,
//     })
// }

export const deliveryVehicleQueryOptions = (id?: number) => {

    return queryOptions({
        queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
        queryFn: () =>
            id ? fetchDeliveryVehicleByIdService(id) : fetchDeliveryVehicleService(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}
export function useDeliveryVehicleMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: DeliveryVehicleForm & { id?: number }) => {
            if (data.id) {
                // Update if id exists
                return await updateDeliveryVehicleService(data)
            }
            // Otherwise create
            return await storeDeliveryVehicleService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
        },
        onError: (error) => {
            console.error("Vehicle mutation failed:", error)
        },
    })
}
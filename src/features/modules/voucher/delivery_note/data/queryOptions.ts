import { Route as DayBookRoute } from '@/routes/_protected/reports/day_book/_layout/index'
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { fetchDeliveryNoteByIdService, fetchDeliveryNoteService, storeDeliveryNoteService, updateDeliveryNoteService } from "./api"
import type { DeliveryNoteForm } from "./schema"

const BASE_KEY = "deliveryNote"

export const deliveryNoteQueryOptions = (id?: number) => {

    return queryOptions({
        queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
        queryFn: () =>
            id ? fetchDeliveryNoteByIdService(id) : fetchDeliveryNoteService(),
        staleTime: id ? 1000 : 1000 * 60 * 1, // 1 minute
        retry: 1,
    })
}

export function useDeliveryNoteMutation() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const Key = "DeliveryNotes"
    return useMutation({
        mutationFn: async (data: DeliveryNoteForm & { id?: number }) => {
            if (data.id) {
                // Update if id exists
                return await updateDeliveryNoteService(data)
            }
            // Otherwise create
            return await storeDeliveryNoteService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [Key] })
            queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
            queryClient.invalidateQueries({ queryKey: ['DayBooks'] })
            queryClient.invalidateQueries({ queryKey: ["godownItemStocks"] })
            queryClient.invalidateQueries({ queryKey: ["batches"] })
            queryClient.invalidateQueries({ queryKey: ["stockItems"] })

            navigate({ to: DayBookRoute.to })
        },
        onError: (error) => {
            console.error("DeliveryNote mutation failed:", error)
        },
    })
}
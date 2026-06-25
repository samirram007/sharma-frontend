import { Route as DayBookRoute } from '@/routes/_protected/reports/day_book/_layout/index'
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { fetchReceiptNoteByIdService, fetchReceiptNoteService, storeReceiptNoteService, updateReceiptNoteService } from "./api"
import type { ReceiptNoteForm } from "./schema"
const BASE_KEY = "receiptNote"

export const receiptNoteQueryOptions = (id?: number) => {

    return queryOptions({
        queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
        queryFn: () =>
            id ? fetchReceiptNoteByIdService(id) : fetchReceiptNoteService(),
        staleTime: 1000 * 60 * 1, // 1 minute
        retry: 1,
    })
}

export function useReceiptNoteMutation() {
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    const Key = "DayBooks"
    return useMutation({
        mutationFn: async (data: ReceiptNoteForm & { id?: number }) => {
            console.log("Saveable Data", data)
            if (data.id) {
                // Update if id exists
                return await updateReceiptNoteService(data)
            }
            // Otherwise create
            return await storeReceiptNoteService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [Key] })
            queryClient.invalidateQueries({ queryKey: ["godownItemStocks"] })
            queryClient.invalidateQueries({ queryKey: ["stockItems"] })
            queryClient.invalidateQueries({ queryKey: ["batches"] })
            navigate({ to: DayBookRoute.to })
        },
        onError: (error) => {
            console.error("ReceiptNote mutation failed:", error)
        },
    })
}
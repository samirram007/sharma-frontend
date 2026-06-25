import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import type { ReceiptForm } from "../types/types"
import { fetchReceiptService, storeReceiptService, updateReceiptService } from "./api"
const Key = "Receipts"
export const receiptVoucherQueryOptions = (key: string = Key) => {
    return queryOptions({
        queryKey: [key],
        queryFn: fetchReceiptService,
        staleTime: 1000 * 30, // 30 seconds
        retry: 1,
    })
}
export function useReceiptMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: ReceiptForm & { id?: number }) => {
            // console.log("mutation Data", data)
            if (data.id) {
                // Update if id exists
                return await updateReceiptService(data)
            }
            // Otherwise create
            return await storeReceiptService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [Key] })
        },
        onError: (error) => {
            console.error("Receipt mutation failed:", error)
        },
    })
}
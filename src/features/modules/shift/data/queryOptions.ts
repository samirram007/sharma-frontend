import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchShiftService, storeShiftService, updateShiftService } from "./api"
import type { ShiftForm } from "./schema"
//queryOptions.ts
const Key = "shifts"
export const shiftQueryOptions = (key: string = Key) => {
    return queryOptions({
        queryKey: [key],
        queryFn: fetchShiftService,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}
export function useShiftMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: ShiftForm & { id?: number }) => {
            if (data.id) {
                // Update if id exists
                return await updateShiftService(data)
            }
            // Otherwise create
            return await storeShiftService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [Key] })
        },
        onError: (error) => {
            console.error("Shift mutation failed:", error)
        },
    })
}
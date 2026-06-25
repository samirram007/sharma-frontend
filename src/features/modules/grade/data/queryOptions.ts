import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchGradeService, storeGradeService, updateGradeService } from "./api"
import type { GradeForm } from "./schema"
//queryOptions.ts
const Key = "grades"
export const gradeQueryOptions = (key: string = Key) => {
    return queryOptions({
        queryKey: [key],
        queryFn: fetchGradeService,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}
export function useGradeMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: GradeForm & { id?: number }) => {
            if (data.id) {
                // Update if id exists
                return await updateGradeService(data)
            }
            // Otherwise create
            return await storeGradeService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [Key] })
        },
        onError: (error) => {
            console.error("Grade mutation failed:", error)
        },
    })
}
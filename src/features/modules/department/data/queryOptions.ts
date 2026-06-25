import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchDepartmentService, storeDepartmentService, updateDepartmentService } from "./api"
import type { DepartmentForm } from "./schema"
//queryOptions.ts
const Key = "departments"
export const departmentQueryOptions = (key: string = Key) => {
    return queryOptions({
        queryKey: [key],
        queryFn: fetchDepartmentService,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}
export function useDepartmentMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: DepartmentForm & { id?: number }) => {
            if (data.id) {
                // Update if id exists
                return await updateDepartmentService(data)
            }
            // Otherwise create
            return await storeDepartmentService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [Key] })
        },
        onError: (error) => {
            console.error("Department mutation failed:", error)
        },
    })
}
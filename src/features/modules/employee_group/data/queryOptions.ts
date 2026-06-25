import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import type { EmployeeGroupForm } from "../types/types"
import { fetchEmployeeGroupService, storeEmployeeGroupService, updateEmployeeGroupService } from "./api"
const Key = "EmployeeGroups"
export const employeeGroupQueryOptions = (key: string = Key) => {
    return queryOptions({
        queryKey: [key],
        queryFn: fetchEmployeeGroupService,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}
export function useEmployeeGroupMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: EmployeeGroupForm & { id?: number }) => {
            console.log("mutation Data", data)
            if (data.id) {
                // Update if id exists
                return await updateEmployeeGroupService(data)
            }
            // Otherwise create
            return await storeEmployeeGroupService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [Key] })
        },
        onError: (error) => {
            console.error("EmployeeGroup mutation failed:", error)
        },
    })
}
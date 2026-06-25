import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchEmployeeByIdService, fetchEmployeeService, storeEmployeeService, updateEmployeeService } from "./api"
import type { EmployeeForm } from "./schema"

const BASE_KEY = "employee"

export const employeeQueryOptions = (id?: number) => {

    return queryOptions({
        queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
        queryFn: () =>
            id ? fetchEmployeeByIdService(id) : fetchEmployeeService(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}

export function useEmployeeMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: EmployeeForm & { id?: number }) => {
            if (data.id) {
                // Update if id exists
                return await updateEmployeeService(data)
            }
            // Otherwise create
            return await storeEmployeeService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
        },
        onError: (error) => {
            console.error("Employee mutation failed:", error)
        },
    })
}
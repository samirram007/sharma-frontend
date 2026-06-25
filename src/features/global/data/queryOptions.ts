import { useMutation, useQueryClient } from "@tanstack/react-query"
import { updateReportingPeriodService } from "./api"

import type { ReportingPeriodForm } from "./schema";





export function useReportingPeriodMutation() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: ReportingPeriodForm & { id?: number }) => {
            if (data.id) {
                // Update if id exists
                return await updateReportingPeriodService(data)
            }
            // Otherwise create
            console.log("reporting period Data: ", data)
            return await updateReportingPeriodService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries()
        },
        onError: (error) => {
            console.error("Reporting period mutation failed:", error)
        },
    })
}
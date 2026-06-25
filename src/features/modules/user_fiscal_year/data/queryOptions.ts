import { useMutation, useQueryClient } from "@tanstack/react-query"
import { storeUserFiscalYearService } from "./apis"


const BASE_KEY = "userFiscalYears"



export function useUserFiscalYearMutation() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (data: any) => {

            return await storeUserFiscalYearService(data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [BASE_KEY] })
        },
        onError: (error) => {
            console.error("FiscalYear mutation failed:", error)
        },
    })
}
import { fetchAccountGroupService } from "@/features/masters/accounts/services/apis"
import { queryOptions } from "@tanstack/react-query"
const Key = "accountGroups"
export const accountGroupQueryOptions = (key: string = Key) => {
    return queryOptions({
        queryKey: [key],
        queryFn: fetchAccountGroupService,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}
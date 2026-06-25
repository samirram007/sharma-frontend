import { queryOptions } from "@tanstack/react-query"
import { fetchAccountLedgerService } from "./api"
const Key = "accountLedgers"
export const accountLedgerQueryOptions = (key: string = Key) => {
    return queryOptions({
        queryKey: [key],
        queryFn: fetchAccountLedgerService,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}
import { queryOptions } from "@tanstack/react-query"
import { fetchVoucherTypeService } from "./api"
const Key = "voucherTypes"
export const voucherTypeQueryOptions = (key: string = Key) => {
    return queryOptions({
        queryKey: [key],
        queryFn: fetchVoucherTypeService,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}
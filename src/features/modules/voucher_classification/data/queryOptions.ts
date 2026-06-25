import { queryOptions } from "@tanstack/react-query"
import { fetchVoucherClassificationService } from "./api"
const Key = "voucherClassifications"
export const voucherClassificationQueryOptions = (key: string = Key) => {
    return queryOptions({
        queryKey: [key],
        queryFn: fetchVoucherClassificationService,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}
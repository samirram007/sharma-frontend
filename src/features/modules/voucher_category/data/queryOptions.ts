import { queryOptions } from "@tanstack/react-query"
import { fetchVoucherCategoryService } from "./api"

const Key = "voucherCategories"
export const voucherCategoryQueryOptions = (key: string = Key) => {
    return queryOptions({
        queryKey: [key],
        queryFn: fetchVoucherCategoryService,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}
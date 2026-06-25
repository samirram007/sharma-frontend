import { queryOptions } from "@tanstack/react-query"
import { fetchCurrencyByIdService, fetchCurrencyService } from "./api"

const BASE_KEY = "currencies"

export const currencyQueryOptions = (id?: number) => {

    return queryOptions({
        queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
        queryFn: () =>
            id ? fetchCurrencyByIdService(id) : fetchCurrencyService(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}

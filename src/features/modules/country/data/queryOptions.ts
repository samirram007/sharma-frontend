import { queryOptions } from "@tanstack/react-query"
import { fetchCountryByIdService, fetchCountryService } from "./api"

const BASE_KEY = "countries"

export const countryQueryOptions = (id?: number) => {

    return queryOptions({
        queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
        queryFn: () =>
            id ? fetchCountryByIdService(id) : fetchCountryService(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}

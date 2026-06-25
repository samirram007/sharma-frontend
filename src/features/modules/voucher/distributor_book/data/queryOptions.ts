import { queryOptions } from "@tanstack/react-query"
import { fetchDistributorBookByIdService, fetchDistributorBookService } from "./api"


const BASE_KEY = "DistributorBooks"


export const distributorBookQueryOptions = (id?: number) => {



    return queryOptions({
        queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
        queryFn: () =>
            id ? fetchDistributorBookByIdService(id) : fetchDistributorBookService(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })

}


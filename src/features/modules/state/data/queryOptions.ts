import { queryOptions } from "@tanstack/react-query"
import { fetchStateByIdService, fetchStateService } from "./api"

const BASE_KEY = "states"

export const stateQueryOptions = (id?: number) => {

    return queryOptions({
        queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
        queryFn: () =>
            id ? fetchStateByIdService(id) : fetchStateService(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}

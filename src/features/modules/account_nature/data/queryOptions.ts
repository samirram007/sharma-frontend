import { queryOptions } from "@tanstack/react-query"
import { fetchAccountNatureService } from "./api"

const Key = "accountNatures"
export const accountNatureQueryOptions = (key: string = Key) => {
    return queryOptions({
        queryKey: [key],
        queryFn: fetchAccountNatureService,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}
import { queryOptions } from "@tanstack/react-query"
import { fetchCompanyTypeByIdService, fetchCompanyTypeService } from "./api"

const BASE_KEY = "companie_types"

export const companyTypeQueryOptions = (id?: number) => {

    return queryOptions({
        queryKey: id ? [BASE_KEY, id] : [BASE_KEY],
        queryFn: () =>
            id ? fetchCompanyTypeByIdService(id) : fetchCompanyTypeService(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}

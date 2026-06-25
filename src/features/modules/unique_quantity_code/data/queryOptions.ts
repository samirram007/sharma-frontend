import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUniqueQuantityCodeService } from "./api";
import type { UniqueQuantityCode } from "./schema";
const Key = "UniqueQuantityCodes"
export const uniqueQuantityCodeQueryOptions = (key: string = Key) => {
    return queryOptions({
        queryKey: [key],
        queryFn: fetchUniqueQuantityCodeService,
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    })
}

export const uniqueQuantityCodeMuatationOptions = (payload: UniqueQuantityCode, key: string = Key) => {
    const queryClient = useQueryClient()
    useMutation({
        mutationKey: [key],
        mutationFn: async () => {
            // Here you can call your API to create or update the Unique Quantity Code
            // For example:
            // return await createOrUpdateUniqueQuantityCodeService(payload);
            return payload; // Placeholder, replace with actual API call
        },
        onSuccess: () => {
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: [key] })
        }
    })
}
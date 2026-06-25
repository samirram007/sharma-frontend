import { queryOptions } from "@tanstack/react-query";
import { fetchZoneWiseReportService } from "./api";

export const zoneWiseQueryOptions = () => {
  return queryOptions({
    queryKey: ["freight-zone-wise"],
    queryFn: () => fetchZoneWiseReportService(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
};

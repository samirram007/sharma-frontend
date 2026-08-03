import { queryOptions } from '@tanstack/react-query'
import {
  fetchDashboardSummary,
  fetchGodownWiseDashboard,
  fetchTransporterWiseDashboard,
  fetchUserWiseDashboard,
  fetchZoneWiseDashboard,
} from './api'

const Key = 'dashboard'

export const dashboardQueryOptions = () =>
  queryOptions({
    queryKey: [Key, 'summary'],
    queryFn: fetchDashboardSummary,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  })

export const zoneWiseQueryOptions = () =>
  queryOptions({
    queryKey: [Key, 'zone-wise'],
    queryFn: fetchZoneWiseDashboard,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })

export const godownWiseQueryOptions = () =>
  queryOptions({
    queryKey: [Key, 'godown-wise'],
    queryFn: fetchGodownWiseDashboard,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })

export const transporterWiseQueryOptions = () =>
  queryOptions({
    queryKey: [Key, 'transporter-wise'],
    queryFn: fetchTransporterWiseDashboard,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })

export const userWiseQueryOptions = () =>
  queryOptions({
    queryKey: [Key, 'user-wise'],
    queryFn: fetchUserWiseDashboard,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })

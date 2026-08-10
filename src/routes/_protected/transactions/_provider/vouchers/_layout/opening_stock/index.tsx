import OpeningStockVoucherComponent from '@/features/modules/voucher/opening_stock'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import {
  OpeningStockVoucherQueryOptions,
  openingStockVoucherTypeQueryOptions,
} from '@/features/modules/voucher/opening_stock/data/queryOptions'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { requirePermission } from '@/lib/auth'
import { Loader } from 'lucide-react'
import { useEffect } from 'react'

export const Route = createFileRoute(
  '/_protected/transactions/_provider/vouchers/_layout/opening_stock/',
)({
  beforeLoad: requirePermission('OPENING_STOCK_MENU_VIEW'),
  component: RouteComponent,
})

/**
 * Only ONE opening stock voucher is allowed per fiscal year. When one already
 * exists for the user's current fiscal year, this screen must load that
 * voucher's existing entries instead of showing a blank new-voucher grid —
 * so the menu entry redirects to the existing voucher's detail route (which
 * fetches and displays its entries). The blank form only renders when no
 * opening stock voucher exists yet.
 */
function RouteComponent() {
  const { userFiscalYear } = useAuth()
  const navigate = Route.useNavigate()

  // OPNSK type id is resolved at runtime (not stable across databases).
  const { data: openingStockType } = useQuery(openingStockVoucherTypeQueryOptions())

  const currentFyId = userFiscalYear?.fiscalYearId
  const openingStockTypeId = openingStockType?.data?.id

  const { data: existingVouchers, isLoading } = useQuery({
    ...OpeningStockVoucherQueryOptions(openingStockTypeId),
    enabled: !!currentFyId && !!openingStockTypeId,
  })

  const existingForFy = (existingVouchers ?? []).find(
    (v) => v.fiscalYearId === currentFyId,
  )

  useEffect(() => {
    if (existingForFy?.id) {
      navigate({ to: '/transactions/vouchers/opening_stock/$id', params: { id: existingForFy.id } })
    }
  }, [existingForFy?.id, navigate])

  // While the existence check is in flight (or while redirecting), show a
  // spinner — never a flash of a blank (and soon-to-be-locked) grid.
  if (existingForFy?.id || isLoading) {
    return (
      <div className="flex h-[calc(100dvh-122px)] items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    )
  }

  return <OpeningStockVoucherComponent />
}

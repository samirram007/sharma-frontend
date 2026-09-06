import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Banknote,
  BarChart3,
  Boxes,
  FileText,
  Map,
  RefreshCw,
  Truck,
  Users,
  Warehouse,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Main } from '@/layouts/components/main'
import { ChartCard } from './components/chart-card'
import { Overview } from './components/overview'
import { TopTransporters } from './components/top-transporters'
import { TrendChart } from './components/trend-chart'
import {
  dashboardQueryOptions,
  godownWiseQueryOptions,
  monthlyTrendQueryOptions,
  transporterWiseQueryOptions,
  userWiseQueryOptions,
  zoneWiseQueryOptions,
} from './data/queryOptions'
import type { UserWiseDatum } from './data/api'
import { formatAmount, formatNumber, initials } from './utils'

export default function Dashboard() {
  const summaryQuery = useQuery(dashboardQueryOptions())
  const zoneQuery = useQuery(zoneWiseQueryOptions())
  const godownQuery = useQuery(godownWiseQueryOptions())
  const transporterQuery = useQuery(transporterWiseQueryOptions())
  const userQuery = useQuery(userWiseQueryOptions())
  const monthlyQuery = useQuery(monthlyTrendQueryOptions())

  const data = summaryQuery.data

  const handleRefresh = () => {
    void Promise.all([
      summaryQuery.refetch(),
      zoneQuery.refetch(),
      godownQuery.refetch(),
      transporterQuery.refetch(),
      userQuery.refetch(),
      monthlyQuery.refetch(),
    ])
  }

  const stats = [
    {
      title: 'Transporters',
      value: data?.transporterCount ?? 0,
      icon: Truck,
      hint: 'registered transporters',
      to: '/masters/party/transporter',
    },
    {
      title: 'Freight Bills',
      value: data?.freightCount ?? 0,
      icon: FileText,
      hint: data
        ? `${formatAmount(data.freightTotalFare)} total fare`
        : 'total fare',
      to: '/reports/freight/freight-voucher-wise',
    },
    {
      title: 'Delivery Notes',
      value: data?.deliveryNoteCount ?? 0,
      icon: Boxes,
      hint: 'deliveries dispatched',
      to: '/transactions/vouchers/delivery_note',
    },
    {
      title: 'Receipt Notes',
      value: data?.receiptNoteCount ?? 0,
      icon: FileText,
      hint: 'receipts received',
      to: '/transactions/vouchers/receipt_note',
    },
    {
      title: 'Payments vs Freight',
      value: data?.paymentCount ?? 0,
      icon: Banknote,
      hint: data
        ? `${formatAmount(data.paymentTotal)} collected`
        : 'collected amount',
      to: '/reports/freight/freight-voucher-wise',
    },
    {
      title: 'Zones',
      value: data?.zoneCount ?? 0,
      icon: Map,
      hint: 'storage zones',
      to: '/masters/inventory/godown',
    },
    {
      title: 'Godowns',
      value: data?.godownCount ?? 0,
      icon: Warehouse,
      hint: 'storage locations',
      to: '/masters/inventory/godown',
    },
    {
      title: 'Distributors',
      value: data?.distributorCount ?? 0,
      icon: Users,
      hint: 'registered distributors',
      to: '/masters/party/distributor',
    },
  ]

  if (summaryQuery.isError) {
    return (
      <Main>
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <p className="text-muted-foreground">Error loading dashboard data.</p>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" /> Try again
          </Button>
        </div>
      </Main>
    )
  }

  const zoneChartData = (zoneQuery.data ?? []).map((zone) => ({
    name: zone.zoneName,
    total: zone.totalAmount,
  }))

  const godownChartData = (godownQuery.data ?? []).map((godown) => ({
    name: godown.godownName,
    total: godown.totalAmount,
  }))

  const transporterChartData = (transporterQuery.data ?? []).map((t) => ({
    name: t.transporterName,
    total: t.totalAmount,
  }))

  const topUsers = (userQuery.data ?? []).slice(0, 5)

  return (
    <Main>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Live overview of freight &amp; logistics
            {data?.currentFiscalYear
              ? ` · Fiscal Year ${data.currentFiscalYear}`
              : ''}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={summaryQuery.isFetching}
        >
          <RefreshCw
            className={`h-4 w-4 ${summaryQuery.isFetching ? 'animate-spin' : ''}`}
          />
          {summaryQuery.isFetching ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} to={stat.to} className="group">
            <Card className="transition-colors group-hover:border-primary/40">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {summaryQuery.isPending ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <div className="text-2xl font-bold">
                    {formatNumber(stat.value)}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">{stat.hint}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Group-wise charts */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Freight by Zone"
          description="Total freight value per zone"
          loading={zoneQuery.isPending}
          error={zoneQuery.isError}
          onRetry={() => void zoneQuery.refetch()}
        >
          {zoneChartData.length === 0 ? (
            <ChartEmpty message="No freight bills yet this fiscal year." />
          ) : (
            <Overview data={zoneChartData} />
          )}
        </ChartCard>
        <ChartCard
          title="Freight by Godown"
          description="Total freight value per godown (top 12)"
          loading={godownQuery.isPending}
          error={godownQuery.isError}
          onRetry={() => void godownQuery.refetch()}
        >
          {godownChartData.length === 0 ? (
            <ChartEmpty message="No delivery notes this fiscal year." />
          ) : (
            <Overview data={godownChartData} limit={12} />
          )}
        </ChartCard>
        <ChartCard
          title="Freight by Transporter"
          description="Total freight value per transporter (top 10)"
          loading={transporterQuery.isPending}
          error={transporterQuery.isError}
          onRetry={() => void transporterQuery.refetch()}
        >
          {transporterChartData.length === 0 ? (
            <ChartEmpty message="No freight bills yet this fiscal year." />
          ) : (
            <Overview data={transporterChartData} limit={10} />
          )}
        </ChartCard>
      </div>

      {/* Trend + leaderboard */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Activity</CardTitle>
            <CardDescription>
              Delivery, receipt &amp; freight vouchers per month, with freight
              billed (₹)
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {monthlyQuery.isPending ? (
              <Skeleton className="h-[240px] w-full" />
            ) : monthlyQuery.isError ? (
              <WidgetError
                message="Couldn't load the monthly trend."
                onRetry={() => void monthlyQuery.refetch()}
              />
            ) : (monthlyQuery.data ?? []).length === 0 ? (
              <ChartEmpty message="No activity yet this fiscal year." />
            ) : (
              <TrendChart data={monthlyQuery.data ?? []} />
            )}
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Top Transporters</CardTitle>
            <CardDescription>
              Highest freight value so far (top 8)
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {transporterQuery.isPending ? (
              <Skeleton className="h-[240px] w-full" />
            ) : transporterQuery.isError ? (
              <WidgetError
                message="Couldn't load transporter ranking."
                onRetry={() => void transporterQuery.refetch()}
              />
            ) : (transporterQuery.data ?? []).length === 0 ? (
              <ChartEmpty message="No freight bills yet this fiscal year." />
            ) : (
              <TopTransporters data={transporterQuery.data ?? []} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* User-wise preview + quick links */}
      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>User-wise Entries</CardTitle>
            <CardDescription>
              Voucher entries by user for the current fiscal year
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userQuery.isPending ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : userQuery.isError ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  Couldn't load user entries.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void userQuery.refetch()}
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Retry
                </Button>
              </div>
            ) : (
              <UserWiseList items={topUsers} />
            )}
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Freight Reports</CardTitle>
            <CardDescription>Drill into freight analytics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <ReportLink
              to="/reports/freight/freight-zone-wise"
              label="Freight Zone-wise"
              description="Freight movement grouped by zone"
            />
            <ReportLink
              to="/reports/freight/freight-godown-wise"
              label="Freight Godown-wise"
              description="Freight movement grouped by godown"
            />
            <ReportLink
              to="/reports/freight/freight-transporter-wise"
              label="Freight Transporter-wise"
              description="Freight bills per transporter"
            />
            <ReportLink
              to="/reports/freight/delivery-note-godown-wise"
              label="Delivery Note Godown-wise"
              description="Delivery notes grouped by godown"
            />
            <ReportLink
              to="/dashboard/user-wise"
              label="User-wise Dashboard"
              description="Detailed per-user entry statistics"
            />
          </CardContent>
        </Card>
      </div>
    </Main>
  )
}

function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-[240px] flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 text-center">
      <BarChart3 className="h-5 w-5 text-muted-foreground/70" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

function WidgetError({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div className="flex h-[240px] flex-col items-center justify-center gap-3 rounded-md border border-dashed px-4 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="h-3.5 w-3.5" /> Retry
      </Button>
    </div>
  )
}

function UserWiseList({ items }: { items: UserWiseDatum[] }) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No user entries found.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.userName}
          className="flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {initials(item.userName)}
            </div>
            <div>
              <p className="text-sm font-medium leading-none">
                {item.userName}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.totalVouchers} vouchers · {item.delivery_notes} delivery ·{' '}
                {item.receipt_notes} receipt · {item.freights} freight
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold">
              {formatAmount(item.total_amount)}
            </p>
          </div>
        </div>
      ))}
      <Link
        to="/dashboard/user-wise"
        className="flex items-center justify-center gap-1 pt-1 text-sm font-medium text-primary hover:underline"
      >
        View full user-wise dashboard <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

function ReportLink({
  to,
  label,
  description,
}: {
  to: string
  label: string
  description: string
}) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between rounded-lg border bg-background p-3 transition-colors hover:border-primary/40 hover:bg-accent/30"
    >
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </Link>
  )
}

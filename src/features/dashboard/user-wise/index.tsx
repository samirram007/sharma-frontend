import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Loader2, RefreshCw, Users } from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useMemo } from 'react'
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
import { userWiseQueryOptions } from '../data/queryOptions'
import type { UserWiseDatum } from '../data/api'
import { formatAmount, formatNumber, initials } from '../utils'

export default function UserWiseDashboard() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery(userWiseQueryOptions())

  const rows = useMemo(() => {
    const list = (data ?? []).map((item) => ({
      ...item,
      totalAmount: Number(item.total_amount ?? 0),
    }))
    return list.sort((a, b) => b.totalAmount - a.totalAmount)
  }, [data])

  const chartData = useMemo(
    () =>
      rows.slice(0, 12).map((row) => ({
        name: row.userName.length > 16 ? `${row.userName.slice(0, 14)}…` : row.userName,
        vouchers: row.totalVouchers,
        amount: row.totalAmount,
      })),
    [rows],
  )

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => ({
          users: acc.users + 1,
          vouchers: acc.vouchers + (row.totalVouchers ?? 0),
          deliveries: acc.deliveries + (row.delivery_notes ?? 0),
          receipts: acc.receipts + (row.receipt_notes ?? 0),
          freights: acc.freights + (row.freights ?? 0),
          amount: acc.amount + row.totalAmount,
        }),
        { users: 0, vouchers: 0, deliveries: 0, receipts: 0, freights: 0, amount: 0 },
      ),
    [rows],
  )

  const handleRefresh = () => {
    void refetch()
  }

  if (isError) {
    return (
      <Main>
        <div className='flex flex-col items-center justify-center gap-4 py-24'>
          <p className='text-muted-foreground'>Error loading user-wise dashboard data.</p>
          <Button variant='outline' onClick={handleRefresh}>
            <RefreshCw className='h-4 w-4' /> Try again
          </Button>
        </div>
      </Main>
    )
  }

  return (
    <Main>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <div className='space-y-1'>
          <Link
            to='/dashboard'
            className='mb-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground'
          >
            <ArrowLeft className='h-3 w-3' /> Back to Dashboard
          </Link>
          <h1 className='text-2xl font-bold tracking-tight'>User-wise Dashboard</h1>
          <p className='text-sm text-muted-foreground'>
            Voucher entries grouped by the user who created them
          </p>
        </div>
        <Button variant='outline' size='sm' onClick={handleRefresh} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>

      {/* Summary cards */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Active Users</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            {isLoading && !data ? (
              <Skeleton className='h-8 w-20' />
            ) : (
              <div className='text-2xl font-bold'>{formatNumber(totals.users)}</div>
            )}
            <p className='text-xs text-muted-foreground'>users with entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Vouchers</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            {isLoading && !data ? (
              <Skeleton className='h-8 w-20' />
            ) : (
              <div className='text-2xl font-bold'>{formatNumber(totals.vouchers)}</div>
            )}
            <p className='text-xs text-muted-foreground'>
              {totals.deliveries} delivery · {totals.receipts} receipt · {totals.freights} freight
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Freight Value</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            {isLoading && !data ? (
              <Skeleton className='h-8 w-20' />
            ) : (
              <div className='text-2xl font-bold'>{formatAmount(totals.amount)}</div>
            )}
            <p className='text-xs text-muted-foreground'>entries by users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Avg per User</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            {isLoading && !data ? (
              <Skeleton className='h-8 w-20' />
            ) : (
              <div className='text-2xl font-bold'>
                {formatNumber(totals.users > 0 ? Math.round(totals.vouchers / totals.users) : 0)}
              </div>
            )}
            <p className='text-xs text-muted-foreground'>vouchers per user</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <div className='mt-4 grid grid-cols-1 gap-4 lg:grid-cols-7'>
        <Card className='col-span-1 lg:col-span-4'>
          <CardHeader>
            <CardTitle>Vouchers by User</CardTitle>
            <CardDescription>Number of entries created by each user</CardDescription>
          </CardHeader>
          <CardContent className='pl-2'>
            {isLoading && !data ? (
              <Skeleton className='h-[280px] w-full' />
            ) : (
              <ResponsiveContainer width='100%' height={280}>
                <BarChart data={chartData}>
                  <XAxis
                    dataKey='name'
                    stroke='#888888'
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor='end'
                    height={60}
                  />
                  <YAxis
                    stroke='#888888'
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.15)' }} />
                  <Bar dataKey='vouchers' fill='hsl(221.2 83.2% 53.3%)' radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* User table */}
        <Card className='col-span-1 lg:col-span-3'>
          <CardHeader>
            <CardTitle>Entries by User</CardTitle>
            <CardDescription>Voucher breakdown per user</CardDescription>
          </CardHeader>
          <CardContent className='p-0'>
            {isLoading && !data ? (
              <div className='space-y-3 p-4'>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className='h-10 w-full' />
                ))}
              </div>
            ) : (
              <UserTable rows={rows} />
            )}
          </CardContent>
        </Card>
      </div>

      {isLoading && !data && (
        <div className='mt-4 flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground'>
          <Loader2 className='h-3 w-3 animate-spin' />
          Loading live data…
        </div>
      )}
    </Main>
  )
}

function UserTable({ rows }: { rows: UserWiseDatum[] }) {
  if (rows.length === 0) {
    return (
      <p className='py-10 text-center text-sm text-muted-foreground'>No user entries found.</p>
    )
  }

  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='border-b bg-muted/50 text-left'>
            <th className='p-3 font-medium'>User</th>
            <th className='p-3 text-right font-medium'>Vouchers</th>
            <th className='p-3 text-right font-medium'>Delivery</th>
            <th className='p-3 text-right font-medium'>Receipt</th>
            <th className='p-3 text-right font-medium'>Freight</th>
            <th className='p-3 text-right font-medium'>Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.userId ?? row.userName} className='border-b hover:bg-muted/30'>
              <td className='p-3'>
                <div className='flex items-center gap-2'>
                  <div className='flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary'>
                    {initials(row.userName)}
                  </div>
                  <span className='font-medium'>{row.userName}</span>
                </div>
              </td>
              <td className='p-3 text-right tabular-nums'>{formatNumber(row.totalVouchers ?? 0)}</td>
              <td className='p-3 text-right tabular-nums'>{formatNumber(row.delivery_notes ?? 0)}</td>
              <td className='p-3 text-right tabular-nums'>{formatNumber(row.receipt_notes ?? 0)}</td>
              <td className='p-3 text-right tabular-nums'>{formatNumber(row.freights ?? 0)}</td>
              <td className='p-3 text-right font-semibold tabular-nums'>
                {formatAmount(Number(row.total_amount ?? 0))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

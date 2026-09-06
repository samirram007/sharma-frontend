import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatAmount, formatCompactAmount } from '../utils'

const COLORS = [
  '#6366f1',
  '#22c55e',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#a855f7',
]

export interface DashboardChartDatum {
  name: string
  total: number
}

interface OverviewProps {
  data: DashboardChartDatum[]
  /** Only render the top-N rows (by value) — keeps the axis readable. */
  limit?: number
}

export function Overview({ data, limit }: OverviewProps) {
  const rows = [...data]
    .sort((a, b) => b.total - a.total)
    .slice(0, limit ?? data.length)

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={rows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          tickFormatter={formatCompactAmount}
          width={52}
        />
        <Tooltip
          cursor={{ fill: 'rgba(148, 163, 184, 0.15)' }}
          formatter={(value) => [formatAmount(Number(value ?? 0)), 'Amount']}
        />
        <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={40}>
          {rows.map((row, index) => (
            <Cell key={row.name} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

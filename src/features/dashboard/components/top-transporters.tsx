import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TransporterWiseDatum } from '../data/api'
import { formatAmount, formatCompactAmount } from '../utils'

const BAR_COLOR = '#0ea5e9'

interface TopTransportersProps {
  data: TransporterWiseDatum[]
}

function truncateLabel(value: string, max = 18): string {
  return value.length > max ? `${value.slice(0, max)}…` : value
}

export function TopTransporters({ data }: TopTransportersProps) {
  // Largest first so the biggest transporter sits at the top of the list.
  const top = [...data]
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 8)

  if (top.length === 0) return null

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={top}
          layout="vertical"
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
        >
          <XAxis
            type="number"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCompactAmount}
          />
          <YAxis
            type="category"
            dataKey="transporterName"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={150}
            tickFormatter={(value: string) => truncateLabel(value)}
          />
          <Tooltip
            cursor={{ fill: 'rgba(148, 163, 184, 0.15)' }}
            formatter={(value) => [
              formatAmount(Number(value ?? 0)),
              'Freight value',
            ]}
            labelFormatter={(label) => String(label)}
          />
          <Bar dataKey="totalAmount" radius={[0, 4, 4, 0]} maxBarSize={18}>
            {top.map((row) => (
              <Cell
                key={row.transporterName}
                fill={BAR_COLOR}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

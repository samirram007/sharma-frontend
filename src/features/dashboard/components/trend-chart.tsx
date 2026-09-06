import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MonthlyTrendDatum } from '../data/api'
import {
  formatAmount,
  formatCompactAmount,
  formatCompactNumber,
  formatNumber,
  monthLabel,
} from '../utils'

const SERIES_LABELS: Record<string, string> = {
  deliveryNoteCount: 'Delivery Notes',
  receiptNoteCount: 'Receipt Notes',
  freightCount: 'Freight Bills',
  freightAmount: 'Freight Billed (₹)',
}

const AMOUNT_KEYS = new Set(['freightAmount'])

interface TrendChartProps {
  data: MonthlyTrendDatum[]
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="trendFreightFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="rgba(148,163,184,0.2)"
          />
          <XAxis
            dataKey="month"
            tickFormatter={monthLabel}
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            minTickGap={16}
          />
          <YAxis
            yAxisId="count"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tickFormatter={formatCompactNumber}
            width={38}
          />
          <YAxis
            yAxisId="amount"
            orientation="right"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCompactAmount}
            width={46}
          />
          <Tooltip
            cursor={{ fill: 'rgba(148, 163, 184, 0.15)' }}
            formatter={(value, name) => {
              const key = String(name)
              const label = SERIES_LABELS[key] ?? key
              const numeric = Number(value ?? 0)
              const formatted = AMOUNT_KEYS.has(key)
                ? formatAmount(numeric)
                : formatNumber(numeric)
              return [formatted, label]
            }}
            labelFormatter={(label) => monthLabel(String(label))}
          />
          <Legend
            formatter={(value: string) => SERIES_LABELS[value] ?? value}
            wrapperStyle={{ fontSize: 12 }}
          />
          <Bar
            yAxisId="count"
            dataKey="deliveryNoteCount"
            fill="#6366f1"
            radius={[3, 3, 0, 0]}
            maxBarSize={16}
          />
          <Bar
            yAxisId="count"
            dataKey="receiptNoteCount"
            fill="#06b6d4"
            radius={[3, 3, 0, 0]}
            maxBarSize={16}
          />
          <Bar
            yAxisId="count"
            dataKey="freightCount"
            fill="#f59e0b"
            radius={[3, 3, 0, 0]}
            maxBarSize={16}
          />
          <Area
            yAxisId="amount"
            type="monotone"
            dataKey="freightAmount"
            stroke="#a855f7"
            strokeWidth={2}
            fill="url(#trendFreightFill)"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

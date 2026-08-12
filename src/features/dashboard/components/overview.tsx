import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

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
}

export function Overview({ data }: OverviewProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.15)' }} />
        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

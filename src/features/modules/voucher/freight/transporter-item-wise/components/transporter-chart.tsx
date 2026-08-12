import { useRef, useCallback } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { IconDownload } from '@tabler/icons-react'
import type { TransporterItemWiseItem } from '../data/schema'

interface ChartDataPoint {
  name: string
  entries: number
  amount: number
}

interface TransporterChartProps {
  data: Array<TransporterItemWiseItem>
  chartTitle?: string
}

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
  '#f97316',
  '#6366f1',
  '#14b8a6',
  '#e11d48',
  '#a855f7',
  '#0ea5e9',
  '#22c55e',
]

export default function TransporterChart({
  data,
  chartTitle = 'Transporter Wise Total Amounts',
}: TransporterChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  const chartData: ChartDataPoint[] = data
    .filter((t) => t.transporterName)
    .map((t) => ({
      name: t.transporterName,
      entries: t.totalVouchers ?? 0,
      amount: t.totalAmount ?? 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  const handleDownload = useCallback(async () => {
    const svgEl = chartRef.current?.querySelector('svg')
    if (!svgEl) return

    const svgClone = svgEl.cloneNode(true) as SVGSVGElement
    const svgData = new XMLSerializer().serializeToString(svgClone)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = svgEl.clientWidth * 2
      canvas.height = svgEl.clientHeight * 2
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.scale(2, 2)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.drawImage(img, 0, 0)

      const link = document.createElement('a')
      link.download = 'freight-transporter-item-wise-chart.png'
      link.href = canvas.toDataURL('image/png')
      link.click()

      URL.revokeObjectURL(url)
    }
    img.src = url
  }, [])

  if (chartData.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-4">
        No data available for chart.
      </div>
    )
  }

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-slate-900 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {chartTitle}
        </h3>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1"
          onClick={handleDownload}
        >
          <IconDownload className="h-3.5 w-3.5" />
          Download Chart
        </Button>
      </div>
      <div ref={chartRef}>
        <ResponsiveContainer
          width="100%"
          height={Math.max(300, chartData.length * 50)}
        >
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              angle={-35}
              textAnchor="end"
              height={70}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 6,
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
              formatter={(value: any, name: any) => [
                `₹${Number(value).toLocaleString()}`,
                name === 'amount' ? 'Total Amount' : 'Items',
              ]}
            />
            <Bar
              dataKey="amount"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
              fill="#3b82f6"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                  className="transition-opacity hover:opacity-80"
                />
              ))}
              <LabelList
                dataKey="amount"
                position="top"
                fontSize={10}
                fill="#475569"
                formatter={(value: any) =>
                  `₹${(Number(value) / 1000).toFixed(1)}k`
                }
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

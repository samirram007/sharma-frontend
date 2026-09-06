import {
  Beaker,
  Box,
  Calculator,
  CalendarDays,
  CircleDollarSign,
  Clock,
  Code,
  Compass,
  Database,
  Flame,
  Gauge,
  LayoutGrid,
  LineChart,
  Ruler,
  Sigma,
  Thermometer,
  Weight,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react'

export type CalculatorToolId =
  | 'basic'
  | 'scientific'
  | 'equation'
  | 'graphing'
  | 'programmer'
  | 'date'
  | `converter:${string}`

export interface ToolEntry {
  id: CalculatorToolId
  label: string
  group: 'calculator' | 'converter'
  icon: LucideIcon
}

const CONVERTER_ICONS: Record<string, LucideIcon> = {
  currency: CircleDollarSign,
  volume: Box,
  length: Ruler,
  weight: Weight,
  temperature: Thermometer,
  energy: Flame,
  area: LayoutGrid,
  speed: Wind,
  time: Clock,
  power: Zap,
  data: Database,
  pressure: Gauge,
  angle: Compass,
}

export const TOOL_ENTRIES: ToolEntry[] = [
  { id: 'basic', label: 'Standard', group: 'calculator', icon: Calculator },
  { id: 'scientific', label: 'Scientific', group: 'calculator', icon: Beaker },
  { id: 'graphing', label: 'Graphing', group: 'calculator', icon: LineChart },
  { id: 'programmer', label: 'Programmer', group: 'calculator', icon: Code },
  {
    id: 'date',
    label: 'Date calculation',
    group: 'calculator',
    icon: CalendarDays,
  },
  {
    id: 'equation',
    label: 'Equation solver',
    group: 'calculator',
    icon: Sigma,
  },
]

export const TOOL_IDS: CalculatorToolId[] = TOOL_ENTRIES.map(
  (entry) => entry.id,
)

export function toolEntry(id: CalculatorToolId): ToolEntry | undefined {
  if (id.startsWith('converter:')) {
    const category = id.slice('converter:'.length)
    return {
      id,
      label: categoryLabel(category),
      group: 'converter',
      icon: CONVERTER_ICONS[category] ?? Ruler,
    }
  }
  return TOOL_ENTRIES.find((entry) => entry.id === id)
}

export function toolLabel(id: CalculatorToolId): string {
  return toolEntry(id)?.label ?? 'Standard'
}

const CATEGORY_LABELS: Record<string, string> = {
  currency: 'Currency',
  volume: 'Volume',
  length: 'Length',
  weight: 'Weight and mass',
  temperature: 'Temperature',
  energy: 'Energy',
  area: 'Area',
  speed: 'Speed',
  time: 'Time',
  power: 'Power',
  data: 'Data',
  pressure: 'Pressure',
  angle: 'Angle',
}

export function categoryLabel(id: string): string {
  return CATEGORY_LABELS[id] ?? id
}

/** Converter tool ids in menu order (mirrors the Calculator nav list). */
export const CONVERTER_TOOL_IDS: CalculatorToolId[] = Object.keys(
  CATEGORY_LABELS,
).map((id) => `converter:${id}` as CalculatorToolId)

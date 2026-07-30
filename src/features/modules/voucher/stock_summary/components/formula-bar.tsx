import { cn } from '@/lib/utils'

interface FormulaBarProps {
  openingQuantity: number
  inwardQuantity: number
  outwardQuantity: number
  closingQuantity: number
  noOfDecimalPlaces: number
  unitCode: string
  className?: string
}

export default function FormulaBar({
  openingQuantity,
  inwardQuantity,
  outwardQuantity,
  closingQuantity,
  noOfDecimalPlaces,
  unitCode,
  className,
}: FormulaBarProps) {
  const dp = noOfDecimalPlaces
  const hasData = openingQuantity > 0 || inwardQuantity > 0 || outwardQuantity > 0

  if (!hasData) return null

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-1 px-4 py-2 text-sm flex-wrap',
        'bg-gradient-to-r from-blue-50/50 via-green-50/50 to-purple-50/50 dark:from-blue-950/10 dark:via-green-950/10 dark:to-purple-950/10',
        'border-t border-dashed border-muted-foreground/30',
        className,
      )}
    >
      <span className='font-medium text-blue-600 dark:text-blue-400'>Opening</span>
      <span className='font-mono text-blue-600 dark:text-blue-400'>
        {openingQuantity.toFixed(dp)}
      </span>

      <span className='text-muted-foreground mx-0.5'>+</span>

      <span className='font-medium text-green-600 dark:text-green-400'>Inward</span>
      <span className='font-mono text-green-600 dark:text-green-400'>
        {inwardQuantity.toFixed(dp)}
      </span>

      <span className='text-muted-foreground mx-0.5'>−</span>

      <span className='font-medium text-red-600 dark:text-red-400'>Outward</span>
      <span className='font-mono text-red-600 dark:text-red-400'>
        {outwardQuantity.toFixed(dp)}
      </span>

      <span className='text-muted-foreground mx-0.5'>=</span>

      <span className='font-bold text-purple-600 dark:text-purple-400'>Closing</span>
      <span className='font-mono font-bold text-purple-600 dark:text-purple-400'>
        {closingQuantity.toFixed(dp)}
      </span>

      {unitCode && (
        <span className='ml-1 text-xs text-muted-foreground'>{unitCode}</span>
      )}
    </div>
  )
}

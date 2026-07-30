import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  IconCheck,
  IconCoin,
  IconPackage,
  IconAlertTriangle,
  IconLoader2,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import type { LedgerEntry, StockEntry } from '../data/schema'
import { useState } from 'react'

interface StepReviewConfirmProps {
  ledgerEntries: LedgerEntry[]
  stockEntries: StockEntry[]
  isSubmitting: boolean
  error: string | null
  onSubmit: (remarks: string) => void
  onBack: () => void
  success: boolean
  result: { voucherNo?: string; openingJournalVoucherId?: number } | null
}

export default function StepReviewConfirm({
  ledgerEntries,
  stockEntries,
  isSubmitting,
  error,
  onSubmit,
  onBack,
  success,
  result,
}: StepReviewConfirmProps) {
  const [remarks, setRemarks] = useState('')

  const activeLedgers = ledgerEntries.filter((e) => e.amount > 0)
  const totalDebit = activeLedgers
    .filter((e) => e.natureType === 'debit')
    .reduce((s, e) => s + e.amount, 0)
  const totalCredit = activeLedgers
    .filter((e) => e.natureType !== 'debit')
    .reduce((s, e) => s + e.amount, 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  const activeStockItems = stockEntries.filter((item) =>
    item.godowns.some((g) => g.quantity > 0),
  )

  const totalStockQty = activeStockItems.reduce(
    (s, item) => s + item.godowns.reduce((gs, g) => gs + g.quantity, 0),
    0,
  )

  if (success && result) {
    return (
      <Card className='border-green-500/30 bg-green-50 dark:bg-green-950/20'>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50'>
              <IconCheck className='h-7 w-7 text-green-600 dark:text-green-400' />
            </div>
            <div>
              <CardTitle>Opening Balance Created Successfully</CardTitle>
              <CardDescription>{result.voucherNo && `Voucher: ${result.voucherNo}`}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-2'>
          <div className='flex items-center justify-between rounded-md border bg-card px-4 py-2.5'>
            <span className='text-sm font-medium'>Opening Journal Voucher</span>
            <Badge variant='outline' className='font-mono'>
              # {result.openingJournalVoucherId}
            </Badge>
          </div>
          {result.voucherNo && (
            <div className='flex items-center justify-between rounded-md border bg-card px-4 py-2.5'>
              <span className='text-sm font-medium'>Voucher Number</span>
              <Badge variant='secondary' className='font-mono'>
                {result.voucherNo}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const hasAnything = activeLedgers.length > 0 || activeStockItems.length > 0

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='flex items-center gap-2 text-lg'>
            <IconCheck className='h-5 w-5 text-purple-500' />
            Step 3: Review & Confirm
          </CardTitle>
          <CardDescription>
            Review the opening balances and stock quantities before saving.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {!hasAnything && (
            <div className='py-8 text-center text-muted-foreground'>
              No ledger balances or stock quantities entered. Go back and add some data.
            </div>
          )}

          {/* Ledger Summary */}
          {activeLedgers.length > 0 && (
            <div>
              <h4 className='mb-2 flex items-center gap-2 text-sm font-semibold'>
                <IconCoin className='h-4 w-4 text-blue-500' />
                Ledger Balances ({activeLedgers.length} ledgers)
              </h4>
              <div className='max-h-[200px] overflow-y-auto rounded-md border'>
                <table className='w-full text-sm'>
                  <thead className='sticky top-0 bg-muted/80 backdrop-blur-sm'>
                    <tr className='border-b'>
                      <th className='p-2 text-left font-medium text-muted-foreground'>Ledger</th>
                      <th className='p-2 text-center font-medium text-muted-foreground'>Dr/Cr</th>
                      <th className='p-2 text-right font-medium text-muted-foreground'>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeLedgers.map((entry) => (
                      <tr key={entry.ledgerId} className='border-b last:border-0'>
                        <td className='p-2 font-medium'>{entry.ledgerName}</td>
                        <td className='p-2 text-center'>
                          <Badge
                            variant='outline'
                            className={cn(
                              'text-xs',
                              entry.natureType === 'debit'
                                ? 'border-blue-300 text-blue-700'
                                : 'border-amber-300 text-amber-700',
                            )}
                          >
                            {entry.natureType === 'debit' ? 'DR' : 'CR'}
                          </Badge>
                        </td>
                        <td className='p-2 text-right font-mono'>
                          {entry.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    <tr className='border-t-2 border-primary/30 font-semibold'>
                      <td className='p-2'>
                        Total
                        {isBalanced ? (
                          <span className='ml-2 text-xs text-green-600'>Balanced</span>
                        ) : (
                          <span className='ml-2 text-xs text-red-500'>
                            Diff: {(totalDebit - totalCredit).toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className='p-2 text-center'>
                        <span className='text-xs'>
                          Dr: {totalDebit.toFixed(2)} / Cr: {totalCredit.toFixed(2)}
                        </span>
                      </td>
                      <td className='p-2 text-right font-mono'>
                        {Math.max(totalDebit, totalCredit).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Stock Summary */}
          {activeStockItems.length > 0 && (
            <div>
              <h4 className='mb-2 flex items-center gap-2 text-sm font-semibold'>
                <IconPackage className='h-4 w-4 text-green-500' />
                Stock Quantities ({activeStockItems.length} items, {totalStockQty.toFixed(2)} total qty)
              </h4>
              <div className='max-h-[200px] overflow-y-auto rounded-md border'>
                <table className='w-full text-sm'>
                  <thead className='sticky top-0 bg-muted/80 backdrop-blur-sm'>
                    <tr className='border-b'>
                      <th className='p-2 text-left font-medium text-muted-foreground'>Item</th>
                      <th className='p-2 text-left font-medium text-muted-foreground'>Godown</th>
                      <th className='p-2 text-right font-medium text-muted-foreground'>Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeStockItems.map((entry) => {
                      const activeGodowns = entry.godowns.filter((g) => g.quantity > 0)
                      return activeGodowns.map((godown, gi) => (
                        <tr key={`${entry.itemId}-${godown.godownId}`} className='border-b last:border-0'>
                          {gi === 0 && (
                            <td
                              className='p-2 font-medium'
                              rowSpan={activeGodowns.length}
                            >
                              {entry.itemName}
                              {entry.unitCode && (
                                <span className='ml-1 text-xs text-muted-foreground'>
                                  ({entry.unitCode})
                                </span>
                              )}
                            </td>
                          )}
                          <td className='p-2 text-muted-foreground'>{godown.godownName}</td>
                          <td className='p-2 text-right font-mono'>
                            {godown.quantity.toFixed(entry.noOfDecimalPlaces)}
                          </td>
                        </tr>
                      ))
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {hasAnything && (
            <>
              <Separator />
              <div className='space-y-2'>
                <Label htmlFor='remarks' className='text-sm font-medium'>
                  Remarks (optional)
                </Label>
                <Textarea
                  id='remarks'
                  placeholder='Add any notes about this opening balance entry...'
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className='h-20 resize-none'
                />
              </div>
            </>
          )}

          {error && (
            <div className='flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive'>
              <IconAlertTriangle className='mt-0.5 h-4 w-4 shrink-0' />
              <p>{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {hasAnything && (
        <div className='flex justify-between'>
          <Button variant='outline' onClick={onBack} disabled={isSubmitting}>
            Back: Stock Quantities
          </Button>
          <Button
            onClick={() => onSubmit(remarks)}
            disabled={isSubmitting}
            className='bg-green-600 hover:bg-green-700'
          >
            {isSubmitting ? (
              <>
                <IconLoader2 className='mr-2 h-4 w-4 animate-spin' />
                Saving...
              </>
            ) : (
              <>
                <IconCheck className='mr-2 h-4 w-4' />
                Create Opening Balance
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}



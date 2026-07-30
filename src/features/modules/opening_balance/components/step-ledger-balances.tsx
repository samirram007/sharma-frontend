import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { IconArrowRight, IconCoin } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import type { LedgerSetup, LedgerEntry } from '../data/schema'
import { cn } from '@/lib/utils'

interface StepLedgerBalancesProps {
  ledgers: LedgerSetup[]
  onNext: (entries: LedgerEntry[]) => void
  onBack?: () => void
}

export default function StepLedgerBalances({ ledgers, onNext, onBack }: StepLedgerBalancesProps) {
  const [entries, setEntries] = useState<LedgerEntry[]>([])

  useEffect(() => {
    if (entries.length === 0 && ledgers.length > 0) {
      setEntries(
        ledgers.map((l) => ({
          ledgerId: l.ledgerId,
          ledgerName: l.ledgerName,
          amount: Math.abs(l.prefilledBalance),
          nature: l.nature,
          natureType: l.natureType,
        })),
      )
    }
  }, [ledgers])

  const updateAmount = (ledgerId: number, amount: number) => {
    setEntries((prev) =>
      prev.map((e) => (e.ledgerId === ledgerId ? { ...e, amount } : e)),
    )
  }

  const hasAmounts = entries.some((e) => e.amount > 0)
  const totalDebit = entries
    .filter((e) => e.natureType === 'debit')
    .reduce((s, e) => s + e.amount, 0)
  const totalCredit = entries
    .filter((e) => e.natureType !== 'debit')
    .reduce((s, e) => s + e.amount, 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01

  const activeEntries = entries.filter((e) => e.amount > 0)

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <IconCoin className='h-5 w-5 text-blue-500' />
                Step 1: Ledger Opening Balances
              </CardTitle>
              <CardDescription>
                Enter opening balances for each balance sheet ledger.
                {ledgers.length > 0 &&
                  ` ${activeEntries.length} of ${ledgers.length} ledgers have balances.`}
              </CardDescription>
            </div>
            <div className='flex items-center gap-3 text-sm'>
              <div className='flex items-center gap-1'>
                <span className='text-muted-foreground'>Dr:</span>
                <span className='font-mono font-semibold text-blue-600 dark:text-blue-400'>
                  {totalDebit.toFixed(2)}
                </span>
              </div>
              <div className='flex items-center gap-1'>
                <span className='text-muted-foreground'>Cr:</span>
                <span className='font-mono font-semibold text-amber-600 dark:text-amber-400'>
                  {totalCredit.toFixed(2)}
                </span>
              </div>
              {isBalanced && totalDebit > 0 && (
                <Badge variant='outline' className='border-green-300 text-green-700 dark:text-green-400'>
                  Balanced ✓
                </Badge>
              )}
              {!isBalanced && totalDebit > 0 && (
                <Badge variant='outline' className='border-red-300 text-red-700 dark:text-red-400'>
                  Diff: {(totalDebit - totalCredit).toFixed(2)}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {ledgers.length === 0 ? (
            <div className='py-8 text-center text-muted-foreground'>
              No balance sheet ledgers found.
            </div>
          ) : (
            <div className='max-h-[400px] overflow-y-auto rounded-md border'>
              <table className='w-full text-sm'>
                <thead className='sticky top-0 bg-muted/80 backdrop-blur-sm'>
                  <tr className='border-b'>
                    <th className='p-2 text-left font-medium text-muted-foreground'>Ledger Name</th>
                    <th className='p-2 text-center font-medium text-muted-foreground'>Nature</th>
                    <th className='p-2 text-right font-medium text-muted-foreground w-48'>Opening Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => {
                    return (
                      <tr
                        key={entry.ledgerId}
                        className={cn(
                          'border-b last:border-0 transition-colors',
                          entry.amount > 0 ? 'bg-blue-50/30 dark:bg-blue-950/10' : '',
                        )}
                      >
                        <td className='p-2 font-medium'>{entry.ledgerName}</td>
                        <td className='p-2 text-center'>
                          <Badge
                            variant='outline'
                            className={cn(
                              'text-xs',
                              entry.nature === 'ASSET'
                                ? 'border-blue-300 text-blue-700 dark:text-blue-400'
                                : 'border-amber-300 text-amber-700 dark:text-amber-400',
                            )}
                          >
                            {entry.nature || entry.natureType || '-'}
                          </Badge>
                        </td>
                        <td className='p-2'>
                          <div className='relative'>
                            <span className='absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground'>
                              ₹
                            </span>
                            <Input
                              type='number'
                              min={0}
                              step={0.01}
                              value={entry.amount || ''}
                              onChange={(e) =>
                                updateAmount(entry.ledgerId, parseFloat(e.target.value) || 0)
                              }
                              placeholder='0.00'
                              className='h-9 w-full max-w-[180px] pl-7 text-right font-mono text-sm ml-auto'
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          {onBack && (
            <Button variant='outline' onClick={onBack}>
              Back
            </Button>
          )}
          {!hasAmounts && (
            <span className='text-xs text-muted-foreground'>
              No ledger balances? You can skip directly to stock quantities.
            </span>
          )}
        </div>
        <Button onClick={() => onNext(entries)}>
          {hasAmounts ? 'Next: Stock Quantities' : 'Skip → Stock Quantities'}
          <IconArrowRight className='ml-2 h-4 w-4' />
        </Button>
      </div>
    </div>
  )
}

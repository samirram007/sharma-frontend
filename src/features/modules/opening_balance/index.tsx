import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Main } from '@/layouts/components/main'
import { useQuery } from '@tanstack/react-query'
import {
  IconDoorEnter,
  IconEye,
  IconLoader2,
  IconAlertTriangle,
  IconRefresh,
  IconCheck,
  IconX,
} from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { openingBalanceSetupQueryOptions, useStoreOpeningBalanceMutation } from './data/queryOptions'
import type { OpeningBalanceSetup, LedgerEntry, StockEntry, OpeningBalanceStoreResponse } from './data/schema'
import StepLedgerBalances from './components/step-ledger-balances'
import StepStockQuantities from './components/step-stock-quantities'
import StepReviewConfirm from './components/step-review-confirm'
import { cn } from '@/lib/utils'

type Step = 'ledgers' | 'stock' | 'review'

const STEP_LABELS: Record<Step, string> = {
  ledgers: 'Ledger Balances',
  stock: 'Stock Quantities',
  review: 'Review & Confirm',
}

const STEP_ORDER: Step[] = ['ledgers', 'stock', 'review']

export default function OpeningBalanceWizard() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState<Step>('ledgers')
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([])
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [result, setResult] = useState<{ voucherNo?: string; openingJournalVoucherId?: number } | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    ...openingBalanceSetupQueryOptions(),
  })

  const storeMutation = useStoreOpeningBalanceMutation()

  const setupData = data?.data as OpeningBalanceSetup | undefined
  const currentFyName = setupData?.currentFiscalYear?.name
  const hasExisting = setupData?.hasExistingOpening
  const prevFy = setupData?.previousFiscalYear

  const stepIndex = STEP_ORDER.indexOf(currentStep)

  const handleLedgerNext = (entries: LedgerEntry[]) => {
    setLedgerEntries(entries)
    setCurrentStep('stock')
  }

  const handleStockNext = (entries: StockEntry[]) => {
    setStockEntries(entries)
    setCurrentStep('review')
  }

  const handleSubmit = async (remarks: string) => {
    setSubmitError(null)

    const payload: Parameters<typeof storeMutation.mutate>[0] = {
      remarks: remarks || undefined,
      ledger_entries: ledgerEntries
        .filter((e) => e.amount > 0)
        .map((e) => ({
          ledger_id: e.ledgerId,
          amount: e.amount,
        })),
      stock_entries: stockEntries
        .filter((item) => item.godowns.some((g) => g.quantity > 0))
        .map((item) => ({
          item_id: item.itemId,
          godowns: item.godowns
            .filter((g) => g.quantity > 0)
            .map((g) => ({
              godown_id: g.godownId,
              quantity: g.quantity,
            })),
        })),
    }

    storeMutation.mutate(payload, {
      onSuccess: (response) => {
        const resData = response?.data as OpeningBalanceStoreResponse | undefined
        setResult({
          voucherNo: resData?.voucherNo,
          openingJournalVoucherId: resData?.openingJournalVoucherId,
        })
        setSuccess(true)
      },
      onError: (err: any) => {
        setSubmitError(
          err?.response?.data?.message || err?.message || 'Failed to create opening balance',
        )
      },
    })
  }

  if (isLoading) {
    return (
      <Main className='flex items-center justify-center min-h-[60vh]'>
        <IconLoader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </Main>
    )
  }

  if (isError || !setupData) {
    return (
      <Main className='flex items-center justify-center min-h-[60vh]'>
        <div className='text-center space-y-4'>
          <IconX className='h-12 w-12 text-destructive mx-auto' />
          <p className='text-lg font-medium text-destructive'>Failed to load setup data</p>
          <Button variant='outline' onClick={() => refetch()}>
            <IconRefresh className='mr-2 h-4 w-4' />
            Retry
          </Button>
        </div>
      </Main>
    )
  }

  return (
    <Main className='max-w-5xl mx-auto space-y-6 py-6'>
      {/* Header */}
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-3'>
            <h1 className='text-3xl font-bold tracking-tight'>Opening Balance Setup</h1>
            <Badge variant='secondary' className='px-3 py-1'>
              <IconDoorEnter className='mr-1 h-3.5 w-3.5' />
              {currentFyName ?? `FY`}
            </Badge>
          </div>
          <p className='text-muted-foreground'>
            Set up opening balances for ledgers and opening stock quantities.
            {prevFy?.isClosed &&
              prevFy?.name &&
              ' Balances from ' + prevFy.name + ' are pre-filled where available.'}
          </p>
        </div>
        <Button
          variant='outline'
          onClick={() => navigate({ to: '/transactions' })}
        >
          <IconEye className='mr-2 h-4 w-4' />
          Back to Transactions
        </Button>
      </div>

      <Separator />

      {/* Existing Opening Warning */}
      {hasExisting && !success && (
        <div className='rounded-lg border border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 p-4 text-sm text-amber-800 dark:text-amber-300 flex items-start gap-3'>
          <IconAlertTriangle className='mt-0.5 h-5 w-5 shrink-0' />
          <div>
            <p className='font-medium'>Opening balance already exists</p>
            <p>There is already an opening journal for {currentFyName}. Creating a new one will not be allowed.</p>
          </div>
        </div>
      )}

      {/* Step Indicator */}
      <div className='flex items-center justify-center gap-1'>
        {STEP_ORDER.map((step, idx) => (
          <div key={step} className='flex items-center gap-1'>
            <div
              className={cn(
                'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                stepIndex === idx
                  ? 'bg-primary text-primary-foreground'
                  : stepIndex > idx
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-muted text-muted-foreground',
              )}
            >
              {stepIndex > idx ? (
                <IconCheck className='h-3.5 w-3.5' />
              ) : (
                <span className='flex h-4 w-4 items-center justify-center text-xs font-bold'>
                  {idx + 1}
                </span>
              )}
              {STEP_LABELS[step]}
            </div>
            {idx < STEP_ORDER.length - 1 && (
              <div
                className={cn(
                  'h-px w-6',
                  stepIndex > idx ? 'bg-green-400' : 'bg-muted-foreground/30',
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Wizard Steps */}
      {currentStep === 'ledgers' && (
        <StepLedgerBalances
          ledgers={setupData.ledgers}
          onNext={handleLedgerNext}
        />
      )}

      {currentStep === 'stock' && (
        <StepStockQuantities
          stockItems={setupData.stockItems}
          onNext={handleStockNext}
          onBack={() => setCurrentStep('ledgers')}
        />
      )}

      {currentStep === 'review' && (
        <StepReviewConfirm
          ledgerEntries={ledgerEntries}
          stockEntries={stockEntries}
          isSubmitting={storeMutation.isPending}
          error={submitError}
          onSubmit={handleSubmit}
          onBack={() => setCurrentStep('stock')}
          success={success}
          result={result}
        />
      )}

      {success && (
        <div className='flex justify-center pt-2'>
          <Button
            onClick={() => navigate({ to: '/transactions' })}
            variant='outline'
          >
            Back to Transactions
          </Button>
        </div>
      )}
    </Main>
  )
}

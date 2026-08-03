import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Main } from '@/layouts/components/main'
import { useQuery } from '@tanstack/react-query'
import {
  IconAlertTriangle,
  IconCheck,
  IconDatabase,
  IconDoorEnter,
  IconEye,
  IconPackage,
  IconRefresh,
  IconReport,
  IconX,
} from '@tabler/icons-react'
import { Loader } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { openPreviewQueryOptions, useOpenFiscalYearMutation } from './data/queryOptions'
import type { OpenPreview, OpenResponse } from './data/schema'
import { fiscalYearQueryOptions } from '@/features/modules/fiscal_year/data/queryOptions'
import type { FiscalYearList } from '@/features/modules/fiscal_year/data/schema'
import { getNatureBadge } from '@/utils/nature-badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Step = 'preview' | 'confirm' | 'success'

function formatFyDate(value: string | Date | null | undefined): string {
  if (!value) return 'N/A'
  const d = new Date(value)
  if (isNaN(d.getTime())) return typeof value === 'string' ? value : 'N/A'
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function FiscalYearOpen() {
  const navigate = useNavigate()
  const { userFiscalYear } = useAuth()
  const { id } = useParams({ from: '/_protected/masters/organization/_layout/fiscal_year/_layout/$id/open' })
  const isNewMode = id === 'new'
  const newFiscalYearId = isNewMode ? Number.NaN : Number(id)

  // When arriving via the generic /new/open picker, skip straight to the
  // user's assigned (active) fiscal year instead of showing the picker hub.
  // Falls back to the picker if the assigned FY is missing or not active.
  useEffect(() => {
    if (isNewMode && userFiscalYear?.fiscalYearId && userFiscalYear?.fiscalYear?.status === 'active') {
      navigate({
        to: '/masters/organization/fiscal_year/$id/open',
        params: { id: userFiscalYear.fiscalYearId },
        replace: true,
      })
    }
  }, [isNewMode, userFiscalYear?.fiscalYearId, userFiscalYear?.fiscalYear?.status, navigate])

  const [step, setStep] = useState<Step>('preview')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [result, setResult] = useState<OpenResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedPrevFyId, setSelectedPrevFyId] = useState<number | null>(null)

  // Fetch list of fiscal years for the selector
  const { data: allFyData } = useQuery({
    ...fiscalYearQueryOptions(),
    enabled: true,
  })

  const allFiscalYears = (allFyData?.data ?? []) as FiscalYearList
  const fiscalYears = allFiscalYears.filter((fy) => fy.id !== newFiscalYearId)
  const newFy = allFiscalYears.find((fy) => fy.id === newFiscalYearId)

  const prevFyId = selectedPrevFyId

  const { data: previewData, isLoading, isError, refetch } = useQuery({
    ...openPreviewQueryOptions(newFiscalYearId, prevFyId ?? 0),
    enabled: !!prevFyId,
  })

  const openMutation = useOpenFiscalYearMutation()

  const preview = previewData?.data as OpenPreview | undefined

  const handleOpen = async () => {
    setConfirmOpen(false)
    if (!prevFyId) return

    openMutation.mutate(
      { newFiscalYearId, previousFiscalYearId: prevFyId },
      {
        onSuccess: (data) => {
          setResult(data?.data as OpenResponse)
          setStep('success')
        },
        onError: (err: any) => {
          setError(err?.response?.data?.message || err?.message || 'Failed to open fiscal year')
        },
      },
    )
  }

  const handleRefresh = () => {
    setError(null)
    if (prevFyId) refetch()
  }

  // `new` mode — no fiscal year id in the URL yet, so show a picker hub that
  // routes into the per-FY opening journal flow (/masters/.../fiscal_year/$id/open).
  if (isNewMode) {
    return (
      <Main className='max-w-6xl mx-auto space-y-6 py-6'>
        {/* Header */}
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div className='space-y-1'>
            <div className='flex items-center gap-3'>
              <h1 className='text-3xl font-bold tracking-tight'>
                Opening Journal
              </h1>
              <Badge variant='secondary' className='px-3 py-1'>
                <IconDoorEnter className='mr-1 h-3.5 w-3.5' />
                Select Fiscal Year
              </Badge>
            </div>
            <p className='text-muted-foreground'>
              Choose the fiscal year to open. Balances from its previous closed fiscal year will be carried forward.
            </p>
          </div>
          <Button variant='outline' onClick={() => navigate({ to: '/masters/organization/fiscal_year' })}>
            <IconEye className='mr-2 h-4 w-4' />
            Back to Fiscal Years
          </Button>
        </div>

        <Separator />

        {/* Fiscal Year picker grid */}
        {!allFyData ? (
          <div className='flex items-center justify-center py-16'>
            <Loader className='h-8 w-8 animate-spin text-muted-foreground' />
          </div>
        ) : fiscalYears.length === 0 ? (
          <div className='py-16 text-center text-muted-foreground'>
            No fiscal years found.
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {fiscalYears.map((fy) => (
              <Card key={fy.id} className='transition-shadow hover:shadow-md'>
                <CardHeader className='pb-2'>
                  <div className='flex items-center justify-between gap-2'>
                    <CardTitle className='text-base'>{fy.name}</CardTitle>
                    <Badge variant={fy.status === 'active' ? 'default' : 'destructive'}>
                      {fy.status === 'active' ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardDescription>
                    {formatFyDate(fy.startDate)} — {formatFyDate(fy.endDate)}
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-2'>
                  <Button
                    className='w-full'
                    disabled={fy.status !== 'active'}
                    title={
                      fy.status === 'active'
                        ? 'Open this fiscal year'
                        : 'Only active fiscal years can be opened'
                    }
                    onClick={() =>
                      fy.id &&
                      navigate({
                        to: '/masters/organization/fiscal_year/$id/open',
                        params: { id: fy.id },
                      })
                    }
                  >
                    <IconDoorEnter className='mr-2 h-4 w-4' />
                    Open Journal
                  </Button>
                  {fy.status !== 'active' && (
                    <p className='text-center text-xs text-muted-foreground'>
                      Only active fiscal years can be opened
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Main>
    )
  }

  if (!newFy && !isLoading) {
    return (
      <Main className='flex items-center justify-center min-h-[60vh]'>
        <div className='text-center space-y-4'>
          <IconX className='h-12 w-12 text-destructive mx-auto' />
          <p className='text-lg font-medium'>Fiscal Year not found</p>
          <Button variant='outline' onClick={() => navigate({ to: '/masters/organization/fiscal_year' })}>
            Back to Fiscal Years
          </Button>
        </div>
      </Main>
    )
  }

  return (
    <Main className='max-w-6xl mx-auto space-y-6 py-6'>
      {/* Header */}
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-3'>
            <h1 className='text-3xl font-bold tracking-tight'>
              Opening Journal
            </h1>
            <Badge variant='secondary' className='px-3 py-1'>
              <IconDoorEnter className='mr-1 h-3.5 w-3.5' />
              New FY: {newFy?.name ?? `#${newFiscalYearId}`}
            </Badge>
          </div>
          <p className='text-muted-foreground'>
            Carry forward balances from the previous fiscal year to {newFy?.name ?? `FY #${newFiscalYearId}`}
          </p>
        </div>
        <Button variant='outline' onClick={() => navigate({ to: '/masters/organization/fiscal_year' })}>
          <IconEye className='mr-2 h-4 w-4' />
          Back to Fiscal Years
        </Button>
      </div>

      <Separator />

      {/* Previous Fiscal Year Selector */}
      {!prevFyId && step === 'preview' && (
        <Card>
          <CardHeader>
            <CardTitle>Select Previous Fiscal Year</CardTitle>
            <CardDescription>
              Choose the closed fiscal year from which to carry forward balances and stock.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='max-w-sm space-y-4'>
              <Select
                value={selectedPrevFyId?.toString() ?? ''}
                onValueChange={(val) => setSelectedPrevFyId(Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select a closed fiscal year...' />
                </SelectTrigger>
                <SelectContent>
                  {fiscalYears.map((fy) => (
                    <SelectItem key={fy.id} value={String(fy.id)}>
                      {fy.name} ({formatFyDate(fy.startDate)} — {formatFyDate(fy.endDate)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <div className='rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive flex items-start gap-3'>
          <IconAlertTriangle className='mt-0.5 h-5 w-5 shrink-0' />
          <div>
            <p className='font-medium'>Error</p>
            <p>{error}</p>
          </div>
          <Button variant='ghost' size='sm' className='ml-auto shrink-0' onClick={() => setError(null)}>
            <IconX className='h-4 w-4' />
          </Button>
        </div>
      )}

      {/* Success View */}
      {step === 'success' && result?.success && (
        <Card className='border-green-500/30 bg-green-50 dark:bg-green-950/20'>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50'>
                <IconCheck className='h-6 w-6 text-green-600 dark:text-green-400' />
              </div>
              <div>
                <CardTitle>Fiscal Year Opened Successfully</CardTitle>
                <CardDescription>{result.message}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-3'>
            {result.openingJournalVoucherId && (
              <div className='flex items-center justify-between rounded-md border bg-card px-4 py-2.5'>
                <span className='text-sm font-medium'>Opening Journal Voucher</span>
                <Badge variant='outline' className='font-mono'>
                  # {result.openingJournalVoucherId}
                </Badge>
              </div>
            )}
            {result.newFiscalYearId && (
              <div className='flex items-center justify-between rounded-md border bg-card px-4 py-2.5'>
                <span className='text-sm font-medium'>New Fiscal Year ID</span>
                <Badge variant='secondary' className='font-mono'>
                  # {result.newFiscalYearId}
                </Badge>
              </div>
            )}
            {result.newFiscalYearId && (
              <Button
                className='w-full'
                onClick={() =>
                  navigate({
                    to: '/reports/opening_entry',
                    search: { fy: result.newFiscalYearId },
                  })
                }
              >
                <IconReport className='mr-2 h-4 w-4' />
                View Opening Entry Report
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview Loading */}
      {prevFyId && isLoading && (
        <div className='flex items-center justify-center py-12'>
          <Loader className='h-8 w-8 animate-spin text-muted-foreground' />
        </div>
      )}

      {/* Preview Error */}
      {prevFyId && isError && !preview && (
        <div className='text-center space-y-4 py-12'>
          <IconX className='h-12 w-12 text-destructive mx-auto' />
          <p className='text-lg font-medium text-destructive'>Failed to load opening preview</p>
          <Button variant='outline' onClick={handleRefresh}>
            <IconRefresh className='mr-2 h-4 w-4' />
            Retry
          </Button>
        </div>
      )}

      {/* Preview Content */}
      {prevFyId && preview && step === 'preview' && (
        <>
          {/* Summary Cards */}
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <Card className='transition-shadow hover:shadow-md'>
              <CardHeader className='pb-2'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-2xl font-bold'>{preview.totalLedgers}</CardTitle>
                  <IconDatabase className='h-5 w-5 text-muted-foreground' />
                </div>
                <CardDescription>
                  Balance Sheet Ledgers from <strong>{preview.previousFiscalYear.name}</strong>
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className='transition-shadow hover:shadow-md'>
              <CardHeader className='pb-2'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-2xl font-bold'>{preview.totalStockItems}</CardTitle>
                  <IconPackage className='h-5 w-5 text-muted-foreground' />
                </div>
                <CardDescription>
                  Stock Items from <strong>{preview.previousFiscalYear.name}</strong>
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Balance Sheet Ledgers */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Balance Sheet Ledgers</CardTitle>
              <CardDescription>
                These ledger balances will be carried forward to {preview.newFiscalYear.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {preview.balanceSheetLedgers.length === 0 ? (
                <div className='py-8 text-center text-muted-foreground'>
                  No balance sheet ledgers found to carry forward.
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='border-b text-left'>
                        <th className='pb-2 font-medium text-muted-foreground'>#</th>
                        <th className='pb-2 font-medium text-muted-foreground'>Ledger Name</th>
                        <th className='pb-2 font-medium text-muted-foreground'>Nature</th>
                        <th className='pb-2 text-right font-medium text-muted-foreground'>Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.balanceSheetLedgers.map((ledger, idx) => (
                        <tr key={ledger.ledgerId} className='border-b last:border-0'>
                          <td className='py-2 text-muted-foreground'>{idx + 1}</td>
                          <td className='py-2 font-medium'>{ledger.ledgerName}</td>
                          <td className='py-2'>
                          <Badge variant='outline' className={getNatureBadge(ledger.nature).className}>
                            {getNatureBadge(ledger.nature).label}
                          </Badge>
                          </td>
                          <td className='py-2 text-right font-mono'>{ledger.balance.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className='border-t-2 border-primary/30'>
                        <td colSpan={2} className='py-2 font-semibold'>Total</td>
                        <td className='py-2 font-semibold'>{preview.totalLedgers} ledgers</td>
                        <td className='py-2 text-right font-mono font-semibold'>
                          {preview.balanceSheetLedgers.reduce((sum, l) => sum + Math.abs(l.balance), 0).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stock Items */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>Stock Items</CardTitle>
              <CardDescription>
                These stock quantities will be carried forward to {preview.newFiscalYear.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {preview.stockItems.length === 0 ? (
                <div className='py-8 text-center text-muted-foreground'>
                  No stock items found to carry forward.
                </div>
              ) : (
                <div className='space-y-3'>
                  {preview.stockItems.map((item) => (
                    <div key={item.itemId} className='rounded-md border bg-card p-3'>
                      <div className='flex items-center justify-between mb-2'>
                        <span className='font-medium'>{item.itemName ?? `Item #${item.itemId}`}</span>
                        <Badge variant='secondary'>{item.totalQuantity.toFixed(2)} total qty</Badge>
                      </div>
                      {item.godowns.length > 0 && (
                        <div className='ml-4 border-l-2 pl-3 space-y-1'>
                          {item.godowns.map((ge, gidx) => (
                            <div key={gidx} className='flex items-center justify-between text-sm text-muted-foreground'>
                              <span>
                                {ge.godownName ?? `Godown #${ge.godownId}`}
                                {ge.batchNo && (
                                  <span className='ml-2 rounded border px-1.5 py-0 font-mono text-[11px]'>
                                    {ge.batchNo}
                                  </span>
                                )}
                              </span>
                              <span className='font-mono'>{ge.quantity.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Execute Button */}
          <div className='flex justify-center pt-2'>
            <Button
              size='lg'
              className='w-full sm:w-auto'
              onClick={() => setConfirmOpen(true)}
              disabled={openMutation.isPending}
            >
              {openMutation.isPending ? (
                <>
                  <Loader className='mr-2 h-5 w-5 animate-spin' />
                  Opening Fiscal Year...
                </>
              ) : (
                <>
                  <IconDoorEnter className='mr-2 h-5 w-5' />
                  Open Fiscal Year {preview.newFiscalYear.name}
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {/* Open Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              <IconDoorEnter className='h-5 w-5 text-blue-500' />
              Open Fiscal Year {preview?.newFiscalYear?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription className='space-y-2'>
              <p>
                This will create a single <strong>OpeningJournal</strong> voucher that carries forward:
              </p>
              <ul className='list-disc pl-5 text-sm space-y-1'>
                <li>
                  <strong>{preview?.totalLedgers ?? 0} balance sheet ledgers</strong> — Assets, Liabilities, and Equity
                </li>
                <li>
                  <strong>{preview?.totalStockItems ?? 0} stock items</strong> — with godown-wise quantities
                </li>
              </ul>
              <p className='font-medium text-foreground'>
                The previous fiscal year must be closed before proceeding.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleOpen} disabled={openMutation.isPending}>
              {openMutation.isPending ? (
                <>
                  <Loader className='mr-2 h-4 w-4 animate-spin' />
                  Opening...
                </>
              ) : (
                'Confirm Opening'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Main>
  )
}

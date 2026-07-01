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
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { Main } from '@/layouts/components/main'
import { useQuery } from '@tanstack/react-query'
import {
  IconAlertTriangle,
  IconArchive,
  IconCheck,
  IconEye,
  IconLock,
  IconLockOpen,
  IconRefresh,
  IconX,
} from '@tabler/icons-react'
import { Loader } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { closePreviewQueryOptions, useCloseFiscalYearMutation, useReopenFiscalYearMutation } from './data/queryOptions'
import type { ClosePreview, CloseResponse } from './data/schema'

type Step = 'preview' | 'confirm' | 'success'

export default function FiscalYearClose() {
  const navigate = useNavigate()
  const { id } = useParams({ from: '/_protected/masters/organization/_layout/fiscal_year/_layout/$id/close' })
  const fiscalYearId = Number(id)
  const isValidId = !isNaN(fiscalYearId) && fiscalYearId > 0
  const { userFiscalYear } = useAuth()

  const [step, setStep] = useState<Step>('preview')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [reopenConfirmOpen, setReopenConfirmOpen] = useState(false)
  const [result, setResult] = useState<CloseResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data: previewData, isLoading, isError, refetch } = useQuery({
    ...closePreviewQueryOptions(fiscalYearId),
    enabled: isValidId,
  })
  const closeMutation = useCloseFiscalYearMutation()
  const reopenMutation = useReopenFiscalYearMutation()

  const preview = previewData?.data as ClosePreview | undefined

  const isCurrentFY = userFiscalYear?.fiscalYearId === fiscalYearId

  const handleClose = async () => {
    setConfirmOpen(false)
    closeMutation.mutate(fiscalYearId, {
      onSuccess: (data) => {
        setResult(data?.data as CloseResponse)
        setStep('success')
      },
      onError: (err: any) => {
        setError(err?.response?.data?.message || err?.message || 'Failed to close fiscal year')
      },
    })
  }

  const handleReopen = async () => {
    setReopenConfirmOpen(false)
    reopenMutation.mutate(fiscalYearId, {
      onSuccess: (data) => {
        setResult(data?.data as CloseResponse)
        setStep('preview')
        refetch()
      },
      onError: (err: any) => {
        setError(err?.response?.data?.message || err?.message || 'Failed to reopen fiscal year')
      },
    })
  }

  if (!isValidId) {
    return (
      <Main className='flex items-center justify-center min-h-[60vh]'>
        <div className='text-center space-y-4'>
          <IconX className='h-12 w-12 text-destructive mx-auto' />
          <p className='text-lg font-medium text-destructive'>Invalid Fiscal Year ID</p>
          <Button variant='outline' onClick={() => navigate({ to: '/masters/organization/fiscal_year' })}>
            Back to Fiscal Years
          </Button>
        </div>
      </Main>
    )
  }

  if (isLoading) {
    return (
      <Main className='flex items-center justify-center min-h-[60vh]'>
        <Loader className='h-8 w-8 animate-spin text-muted-foreground' />
      </Main>
    )
  }

  if (isError || !preview) {
    return (
      <Main className='flex items-center justify-center min-h-[60vh]'>
        <div className='text-center space-y-4'>
          <IconX className='h-12 w-12 text-destructive mx-auto' />
          <p className='text-lg font-medium text-destructive'>Failed to load closing preview</p>
          <Button variant='outline' onClick={() => refetch()}>
            <IconRefresh className='mr-2 h-4 w-4' />
            Retry
          </Button>
        </div>
      </Main>
    )
  }

  return (
    <Main className='max-w-4xl mx-auto space-y-6 py-6'>
      {/* Header */}
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-3'>
            <h1 className='text-3xl font-bold tracking-tight'>{preview.fiscalYear.name}</h1>
            {preview.isClosed ? (
              <Badge variant='destructive' className='px-3 py-1'>
                <IconLock className='mr-1 h-3.5 w-3.5' />
                Closed
              </Badge>
            ) : (
              <Badge variant='default' className='px-3 py-1'>
                <IconLockOpen className='mr-1 h-3.5 w-3.5' />
                Active
              </Badge>
            )}
          </div>
          <p className='text-muted-foreground'>
            {preview.fiscalYear.startDate} — {preview.fiscalYear.endDate}
            {isCurrentFY && (
              <Badge variant='secondary' className='ml-2'>
                Current FY
              </Badge>
            )}
          </p>
        </div>
        <Button variant='outline' onClick={() => navigate({ to: '/masters/organization/fiscal_year' })}>
          <IconEye className='mr-2 h-4 w-4' />
          Back to Fiscal Years
        </Button>
      </div>

      <Separator />

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
                <CardTitle>Fiscal Year Closed Successfully</CardTitle>
                <CardDescription>{result.message}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-3'>
            {result.closingAccountVoucherId && (
              <div className='flex items-center justify-between rounded-md border bg-card px-4 py-2.5'>
                <span className='text-sm font-medium'>Closing Account Voucher</span>
                <Badge variant='outline' className='font-mono'>
                  # {result.closingAccountVoucherId}
                </Badge>
              </div>
            )}
            {result.closingStockVoucherId && (
              <div className='flex items-center justify-between rounded-md border bg-card px-4 py-2.5'>
                <span className='text-sm font-medium'>Closing Stock Voucher</span>
                <Badge variant='outline' className='font-mono'>
                  # {result.closingStockVoucherId}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview Cards */}
      {step === 'preview' && !preview.isClosed && (
        <>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            <Card className='transition-shadow hover:shadow-md'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-2xl font-bold'>{preview.totalVouchers}</CardTitle>
                <CardDescription>Total Vouchers</CardDescription>
              </CardHeader>
            </Card>
            <Card className='transition-shadow hover:shadow-md'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-2xl font-bold'>{preview.totalLedgersWithBalance}</CardTitle>
                <CardDescription>Ledgers with Balance</CardDescription>
              </CardHeader>
            </Card>
            <Card className='transition-shadow hover:shadow-md'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-2xl font-bold'>{preview.totalStockItems}</CardTitle>
                <CardDescription>Stock Items</CardDescription>
              </CardHeader>
            </Card>
            <Card className='transition-shadow hover:shadow-md'>
              <CardHeader className='pb-2'>
                <CardTitle className='text-2xl font-bold'>{preview.totalGodowns}</CardTitle>
                <CardDescription>Godowns with Stock</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Card className='border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/10'>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <IconAlertTriangle className='h-5 w-5 text-amber-600 dark:text-amber-400' />
                <CardTitle className='text-base'>Before You Close</CardTitle>
              </div>
              <CardDescription>
                Closing a fiscal year is irreversible. All P&amp;L balances will be transferred to the Capital account,
                and stock quantities will be frozen. Make sure all vouchers for this year are finalized.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size='lg' className='w-full sm:w-auto' onClick={() => setConfirmOpen(true)}>
                <IconArchive className='mr-2 h-5 w-5' />
                Close Fiscal Year {preview.fiscalYear.name}
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {/* Already Closed View */}
      {step === 'preview' && preview.isClosed && (
        <Card>
          <CardHeader>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted'>
                <IconLock className='h-5 w-5 text-muted-foreground' />
              </div>
              <div>
                <CardTitle>Fiscal Year Already Closed</CardTitle>
                <CardDescription>
                  This fiscal year has already been closed. You can reopen it if needed.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant='outline' size='lg' onClick={() => setReopenConfirmOpen(true)}>
              <IconRefresh className='mr-2 h-5 w-5' />
              Reopen Fiscal Year
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Close Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              <IconAlertTriangle className='h-5 w-5 text-amber-500' />
              Close Fiscal Year {preview.fiscalYear.name}?
            </AlertDialogTitle>
            <AlertDialogDescription className='space-y-2'>
              <p>
                This action will <strong>close</strong> the fiscal year and perform the following:
              </p>
              <ul className='list-disc pl-5 text-sm space-y-1'>
                <li>Create a Closing Account voucher (P&amp;L → Capital transfer)</li>
                <li>Create a Closing Stock voucher (freeze stock quantities)</li>
                <li>Mark the fiscal year as <strong>inactive</strong></li>
              </ul>
              <p className='font-medium text-foreground'>
                This action cannot be undone without reopening.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClose} disabled={closeMutation.isPending}>
              {closeMutation.isPending ? (
                <>
                  <Loader className='mr-2 h-4 w-4 animate-spin' />
                  Closing...
                </>
              ) : (
                'Confirm Close'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reopen Confirmation Dialog */}
      <AlertDialog open={reopenConfirmOpen} onOpenChange={setReopenConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className='flex items-center gap-2'>
              <IconRefresh className='h-5 w-5 text-amber-500' />
              Reopen Fiscal Year {preview.fiscalYear.name}?
            </AlertDialogTitle>
            <AlertDialogDescription className='space-y-2'>
              <p>Reopening will:</p>
              <ul className='list-disc pl-5 text-sm space-y-1'>
                <li>Delete the closing account and closing stock vouchers</li>
                <li>Restore the fiscal year to <strong>active</strong> status</li>
              </ul>
              <p className='font-medium text-foreground'>
                Ensure no opening entries have been created in the next fiscal year before reopening.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReopen} disabled={reopenMutation.isPending}>
              {reopenMutation.isPending ? (
                <>
                  <Loader className='mr-2 h-4 w-4 animate-spin' />
                  Reopening...
                </>
              ) : (
                'Confirm Reopen'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Main>
  )
}

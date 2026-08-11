import { Loader2, Printer, Settings2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { toast } from 'sonner'
import { date_format } from '@/utils/removeEmptyStrings'
import type { FreightSchema } from '../../data/schema'
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { numberToWords } from '@/utils/helper'
import { Dialog } from '@radix-ui/react-dialog'
import { buildPrintCss, PAPER_SIZES, type PaperSizeId } from './print-styles'
import {
  FareBreakdown,
  type FareDispatchDetail,
} from '../../../shared/fare-breakdown'
import {
  usePrintPreferences,
  useUpdatePrintPreferences,
  type PrintPreferences,
} from './print-prefs-api'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  freightData: FreightSchema
  /** Direct dispatch detail data from the source voucher row */
  dispatchDetail?: Record<string, unknown> | null
}

const PrintFreightDialog = (props: Props) => {
  const printRef = useRef<HTMLDivElement>(null)
  const {
    open,
    onOpenChange,
    freightData,
    dispatchDetail: propDispatchDetail,
  } = props
  // Paper size + section visibility (Document Info, Paid To / Amount,
  // Fare Details, Authorizations) are persisted across sessions via the
  // shared useLocalStorage hook (hidden sections are excluded from both the
  // preview and the printed output since print uses the preview DOM).
  const [paperSize, setPaperSize] = useLocalStorage<PaperSizeId>(
    'print-paper-size',
    'a5-landscape',
  )
  // Defensive: fall back to the default if a manually-edited stored value
  // isn't a known paper size.
  const resolvedPaperSize = PAPER_SIZES.some((s) => s.id === paperSize)
    ? paperSize
    : 'a5-landscape'

  const [showFareDetails, setShowFareDetails] = useLocalStorage<boolean>(
    'print-show-fare-details',
    true,
  )
  const [showDocumentInfo, setShowDocumentInfo] = useLocalStorage<boolean>(
    'print-show-document-info',
    true,
  )
  const [showAuthorizations, setShowAuthorizations] = useLocalStorage<boolean>(
    'print-show-authorizations',
    true,
  )
  const [showPaidToAmount, setShowPaidToAmount] = useLocalStorage<boolean>(
    'print-show-paid-to-amount',
    true,
  )

  const hiddenSectionsCount = [
    showDocumentInfo,
    showPaidToAmount,
    showFareDetails,
    showAuthorizations,
  ].filter((visible) => !visible).length

  // Server-side sync: once the user has saved preferences server-side they are
  // authoritative (they apply on every device) and override the localStorage
  // cache as soon as they load. Until then (serverPrintPrefs is null) the
  // device-local values are kept so pre-existing local choices aren't wiped.
  const { data: serverPrintPrefs } = usePrintPreferences()
  const updatePrintPrefs = useUpdatePrintPreferences()

  useEffect(() => {
    if (!serverPrintPrefs) return
    setShowFareDetails(serverPrintPrefs.showFareDetails)
    setShowDocumentInfo(serverPrintPrefs.showDocumentInfo)
    setShowAuthorizations(serverPrintPrefs.showAuthorizations)
    setShowPaidToAmount(serverPrintPrefs.showPaidToAmount)
  }, [
    serverPrintPrefs,
    setShowFareDetails,
    setShowDocumentInfo,
    setShowAuthorizations,
    setShowPaidToAmount,
  ])

  const handlePrefToggle = (key: keyof PrintPreferences, checked: boolean) => {
    const next: PrintPreferences = {
      showFareDetails,
      showDocumentInfo,
      showAuthorizations,
      showPaidToAmount,
      [key]: checked,
    }
    setShowFareDetails(next.showFareDetails)
    setShowDocumentInfo(next.showDocumentInfo)
    setShowAuthorizations(next.showAuthorizations)
    setShowPaidToAmount(next.showPaidToAmount)
    updatePrintPrefs.mutate(next, {
      onError: () => toast.message('Failed to save print preferences'),
    })
  }

  const dispatchDetail = useMemo(() => {
    // Use passed dispatchDetail prop directly when available (most reliable)
    if (propDispatchDetail) return propDispatchDetail
    // Fall back to extracting from voucher references
    const ref =
      freightData?.voucherReferences?.find(
        (vr) => vr.referenceVoucher?.voucherTypeId === 2001,
      ) ?? freightData?.voucherReferences?.[0]
    return ref?.referenceVoucher?.voucherDispatchDetail as
      Record<string, unknown> | undefined
  }, [freightData, propDispatchDetail])

  const totalFare = useMemo(() => {
    return Number(freightData?.amount) || Number(dispatchDetail?.totalFare) || 0
  }, [freightData?.amount, dispatchDetail])

  const discount = useMemo(
    () => Number(dispatchDetail?.discount) || 0,
    [dispatchDetail],
  )

  const printCss = useMemo(
    () => buildPrintCss(resolvedPaperSize),
    [resolvedPaperSize],
  )

  // Live preview dimensions reflect the selected paper size
  const previewStyle = useMemo(() => {
    switch (resolvedPaperSize) {
      case 'a4-portrait':
        return {
          maxWidth: '580px',
          minHeight: '780px',
          boxShadow: '0 1px 6px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
          borderRadius: '2px',
        }
      case 'a4-landscape':
        return {
          maxWidth: '740px',
          minHeight: '510px',
          boxShadow: '0 1px 6px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
          borderRadius: '2px',
        }
      case 'a5-portrait':
        return {
          maxWidth: '480px',
          minHeight: '660px',
          boxShadow: '0 1px 6px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
          borderRadius: '2px',
        }
      case 'a5-landscape':
      default:
        return {
          maxWidth: '660px',
          minHeight: '465px',
          boxShadow: '0 1px 6px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)',
          borderRadius: '2px',
        }
    }
  }, [resolvedPaperSize])

  const [isPrinting, setIsPrinting] = useState(false)

  // Safely extract string values from unknown-typed dispatch detail
  const str = (key: string): string | undefined => {
    const val = dispatchDetail?.[key]
    return typeof val === 'string' ? val : undefined
  }

  const handleOnClick = () => {
    if (printRef.current) {
      setIsPrinting(true)
      toast.message('Opening print dialog...', {
        id: 'print-toast',
        duration: 5000,
      })

      const printContent = printRef.current.innerHTML
      const style = document.createElement('style')
      style.textContent = printCss

      // Use a hidden iframe for printing to avoid mutating the main page DOM
      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.top = '-9999px'
      iframe.style.left = '-9999px'
      iframe.style.width = '800px'
      iframe.style.height = '600px'
      iframe.style.border = 'none'
      document.body.appendChild(iframe)

      const iframeDoc = iframe.contentWindow!.document
      iframeDoc.open()
      iframeDoc.write(
        '<!DOCTYPE html><html><head>' +
          style.outerHTML +
          '</head><body>' +
          printContent +
          '</body></html>',
      )
      iframeDoc.close()

      // Clean up the iframe after printing
      const cleanup = () => {
        setIsPrinting(false)
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe)
        }
      }

      // Firefox/Safari: afterprint event fires when print completes
      iframe.contentWindow!.addEventListener('afterprint', cleanup, {
        once: true,
      })

      // Chrome: print() is synchronous, so this runs after dialog closes.
      // The timeout covers the async case and acts as a safe fallback.
      iframe.contentWindow!.focus()
      iframe.contentWindow!.print()
      setTimeout(cleanup, 500)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        onOpenChange(state)
      }}
    >
      <DialogTrigger asChild>
        <div className="hidden" title="Print Freight" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-slate-200 pb-3 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <Printer className="h-5 w-5 text-blue-600" />
            <DialogTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">
              Print Freight Receipt
            </DialogTitle>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Preview and print the freight receipt for voucher{' '}
            {freightData?.voucherNo}.
          </p>
        </DialogHeader>
        <div ref={printRef} className="flex-1 overflow-y-auto -mx-6 px-6 py-4">
          <div
            className="mx-auto space-y-3 transition-all duration-300 ease-in-out"
            style={previewStyle}
          >
            {/* Document Info Section */}
            {showDocumentInfo && (
              <div className="print-section rounded-lg border border-slate-200 bg-white shadow-xs dark:border-slate-700 dark:bg-slate-900/50 overflow-hidden">
                <div className="print-section-header flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Document Information
                </div>
                <div className="print-section-body p-4">
                  <div className="print-title text-xl font-bold text-center text-slate-800 dark:text-slate-200 mb-1">
                    {freightData?.company?.name}
                  </div>
                  <div className="print-subtitle text-sm font-semibold text-center text-blue-700 underline underline-offset-4 decoration-2 dark:text-blue-400 mb-4">
                    Freight Receipt
                  </div>
                  <div className="print-info-grid grid grid-cols-2 gap-x-4">
                    <div className="print-info-row flex justify-between py-1.5 text-sm border-b border-dashed border-slate-200 dark:border-slate-700">
                      <span className="print-info-label text-slate-500 dark:text-slate-400 font-medium">
                        Voucher No:
                      </span>
                      <span className="print-info-value font-semibold underline decoration-dotted underline-offset-4 text-slate-800 dark:text-slate-200">
                        {freightData?.voucherNo}
                      </span>
                    </div>
                    <div className="print-info-row flex justify-between py-1.5 text-sm border-b border-dashed border-slate-200 dark:border-slate-700">
                      <span className="print-info-label text-slate-500 dark:text-slate-400 font-medium">
                        Dl. No.:
                      </span>
                      <span className="print-info-value font-semibold underline decoration-dotted underline-offset-4 text-slate-800 dark:text-slate-200">
                        {freightData?.referenceNo}
                      </span>
                    </div>
                    <div className="print-info-row flex justify-between py-1.5 text-sm">
                      <span className="print-info-label text-slate-500 dark:text-slate-400 font-medium">
                        Voucher Date:
                      </span>
                      <span className="print-info-value font-semibold underline decoration-dotted underline-offset-4 text-slate-800 dark:text-slate-200">
                        {date_format(freightData?.voucherDate)}
                      </span>
                    </div>
                    <div className="print-info-row flex justify-between py-1.5 text-sm">
                      <span className="print-info-label text-slate-500 dark:text-slate-400 font-medium">
                        Dl. Date:
                      </span>
                      <span className="print-info-value font-semibold underline decoration-dotted underline-offset-4 text-slate-800 dark:text-slate-200">
                        {date_format(freightData?.referenceDate!)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment + Amount side-by-side */}
            {showPaidToAmount && (
              <div className="print-grid-2 flex flex-wrap gap-5">
                <div className="print-section print-section-paid-to flex-[1.4] min-w-[280px] rounded-lg border border-slate-200 bg-white shadow-xs dark:border-slate-700 dark:bg-slate-900/50 overflow-hidden">
                  <div className="print-section-header flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Paid To
                  </div>
                  <div className="print-section-body p-4 space-y-3">
                    <div className="print-carrier-name text-lg font-semibold text-slate-800 dark:text-slate-200 border-b-2 border-dotted border-slate-300 dark:border-slate-600 pb-1">
                      {str('carrierName') ?? '-'}
                    </div>
                    <div className="print-body-text text-sm leading-relaxed text-justify text-slate-600 italic dark:text-slate-400">
                      Being the payment towards Freight Charges for material
                      shifting to party:{' '}
                      <strong className="text-slate-800 dark:text-slate-200">
                        {freightData?.partyLedger?.name}
                      </strong>
                      , Destination:{' '}
                      <strong className="text-slate-800 dark:text-slate-200">
                        {str('destinationSecondary') ??
                          str('destination') ??
                          'Unknown'}
                      </strong>
                      , through by vehicle:{' '}
                      <strong className="text-slate-800 dark:text-slate-200">
                        {str('motorVehicleNo')}
                      </strong>
                      .
                    </div>
                    <div className="print-amount-words text-base italic text-slate-700 dark:text-slate-300 border-b-2 border-dotted border-slate-700 dark:border-slate-400 pb-1">
                      <strong>Rupees </strong>
                      {numberToWords(freightData?.amount!)}
                      {discount > 0 && (
                        <span className="text-red-600 dark:text-red-400">
                          {' '}
                          (after discount of{' '}
                          {numberToWords(Math.round(discount))})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="print-section print-section-amount flex-[0.6] min-w-[160px] rounded-lg border border-slate-200 bg-white shadow-xs dark:border-slate-700 dark:bg-slate-900/50 overflow-hidden">
                  <div className="print-section-header flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Amount
                  </div>
                  <div className="print-section-body p-3">
                    <table className="print-amount-table w-full text-center text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-slate-300 dark:border-slate-600">
                          <th className="py-1.5 font-medium text-slate-500 dark:text-slate-400 border-r border-slate-300 dark:border-slate-600 w-[60%]">
                            Rs.
                          </th>
                          <th className="py-1.5 font-medium text-slate-500 dark:text-slate-400">
                            P.
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-300 dark:border-slate-600">
                          <td className="py-4 text-left pl-3 text-lg font-bold text-slate-800 dark:text-slate-200 border-r border-slate-300 dark:border-slate-600">
                            {freightData?.amount?.toFixed(0)}
                          </td>
                          <td className="py-4 text-lg font-bold text-slate-800 dark:text-slate-200">
                            {
                              ((freightData?.amount ?? 0) % 1)
                                .toFixed(2)
                                .split('.')[1]
                            }
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1 text-left pl-3 font-semibold text-slate-600 dark:text-slate-400 border-r border-slate-300 dark:border-slate-600 text-xs">
                            {freightData?.amount?.toFixed(0)}
                          </td>
                          <td className="py-1 font-semibold text-slate-600 dark:text-slate-400 text-xs">
                            {
                              ((freightData?.amount ?? 0) % 1)
                                .toFixed(2)
                                .split('.')[1]
                            }
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Fare Details Section — charge breakdown incl. discount & additional charges */}
            {showFareDetails && (
              <div className="print-section rounded-lg border border-slate-200 bg-white shadow-xs dark:border-slate-700 dark:bg-slate-900/50 overflow-hidden">
                <div className="print-section-header flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Fare Details
                </div>
                <div className="print-section-body p-4">
                  <FareBreakdown
                    dispatchDetail={dispatchDetail as FareDispatchDetail}
                    totalFare={totalFare}
                    variant="flex"
                    currencySymbol="₹"
                    showNetAdjustment
                    rowClassName="py-1 border-b border-dashed border-slate-100 dark:border-slate-800"
                    totalRowClassName="mb-2 flex items-baseline justify-between gap-4 border-b-2 border-slate-700 pb-2 text-sm font-bold"
                  />
                </div>
              </div>
            )}

            {/* Signatures Section */}
            {showAuthorizations && (
              <div className="print-section rounded-lg border border-slate-200 bg-white shadow-xs dark:border-slate-700 dark:bg-slate-900/50 overflow-hidden">
                <div className="print-section-header flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 dark:border-slate-700 dark:bg-slate-900/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Authorizations
                </div>
                <div className="print-section-body p-4">
                  <div className="print-signatures flex items-end justify-between">
                    <div>
                      <div className="print-signature-box mb-2 h-12 w-12 rounded border-2 border-dashed border-slate-400 dark:border-slate-500" />
                      <div className="print-signature-label text-sm font-medium text-slate-600 dark:text-slate-400">
                        Distributor Signature
                      </div>
                      <div className="print-signature-sublabel text-xs text-slate-400 dark:text-slate-500">
                        Signature of Drawer
                      </div>
                    </div>
                    <div className="print-company-signature text-right">
                      <div className="print-signature-label text-sm font-semibold text-slate-600 dark:text-slate-400">
                        For {freightData?.company?.name}
                      </div>
                      <div className="print-signature-box mt-2 h-12 w-48 ml-auto rounded border-2 border-dashed border-slate-400 dark:border-slate-500" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="flex items-center justify-between border-t border-slate-200 px-6 py-3 dark:border-slate-700">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <div className="flex items-center gap-2">
              <label
                htmlFor="paper-size"
                className="text-xs font-medium text-slate-500 dark:text-slate-400"
              >
                Paper Size:
              </label>
              <select
                id="paper-size"
                value={resolvedPaperSize}
                onChange={(e) => setPaperSize(e.target.value as PaperSizeId)}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 shadow-xs transition-colors hover:border-slate-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-900"
              >
                {PAPER_SIZES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 px-2.5 text-xs font-medium text-slate-600 dark:text-slate-300"
                  title={
                    hiddenSectionsCount > 0
                      ? `${hiddenSectionsCount} section${hiddenSectionsCount === 1 ? '' : 's'} hidden`
                      : 'Toggle which sections appear in the preview and print'
                  }
                >
                  <Settings2 className="h-3.5 w-3.5" />
                  Sections
                  {hiddenSectionsCount > 0 && (
                    <span
                      aria-label={`${hiddenSectionsCount} section${hiddenSectionsCount === 1 ? '' : 's'} hidden`}
                      className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-100 px-1 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
                    >
                      {hiddenSectionsCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" side="top" className="w-64 p-3">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Section Visibility
                </h4>
                <div className="flex flex-col gap-2.5">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Document Info
                    </span>
                    <Switch
                      checked={showDocumentInfo}
                      onCheckedChange={(checked) =>
                        handlePrefToggle('showDocumentInfo', checked)
                      }
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Paid To / Amount
                    </span>
                    <Switch
                      checked={showPaidToAmount}
                      onCheckedChange={(checked) =>
                        handlePrefToggle('showPaidToAmount', checked)
                      }
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Fare Details
                    </span>
                    <Switch
                      checked={showFareDetails}
                      onCheckedChange={(checked) =>
                        handlePrefToggle('showFareDetails', checked)
                      }
                    />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-300">
                      Authorizations
                    </span>
                    <Switch
                      checked={showAuthorizations}
                      onCheckedChange={(checked) =>
                        handlePrefToggle('showAuthorizations', checked)
                      }
                    />
                  </label>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Button
            onClick={handleOnClick}
            disabled={isPrinting}
            className="h-9 min-w-[90px] rounded-lg bg-blue-600 px-5 text-xs font-medium text-white shadow-xs transition-all hover:bg-blue-700 hover:shadow-sm active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPrinting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Printer className="mr-2 h-4 w-4" />
            )}
            {isPrinting ? 'Printing...' : 'Print'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PrintFreightDialog

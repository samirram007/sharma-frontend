import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { date_format } from '@/utils/removeEmptyStrings'
import { numberToWords } from '@/utils/helper'
import { Download, Eye, Printer, Settings2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { Switch } from '@/components/ui/switch'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  PAPER_SIZES,
  type PaperSizeId,
} from '../../freight/components/print-freight-dialog/print-styles'
import type { DayBookSchema } from '../data/schema'
import { resolveDispatchWeight } from '../../shared/dispatch-defaults'

type Props = {
  data: DayBookSchema
}

type ChallanPaperSize = PaperSizeId

type ChallanSections = {
  showDocumentInfo: boolean
  showParties: boolean
  showItems: boolean
  showFreight: boolean
  showAuthorizations: boolean
}

function challanStyles(paperSize: ChallanPaperSize) {
  const size =
    PAPER_SIZES.find((item) => item.id === paperSize) ?? PAPER_SIZES[0]
  const landscape = paperSize.endsWith('landscape')
  const previewDimensions: Record<PaperSizeId, [string, string]> = {
    'a5-landscape': ['660px', '465px'],
    'a4-landscape': ['740px', '510px'],
    'a5-portrait': ['480px', '660px'],
    'a4-portrait': ['580px', '780px'],
  }
  const [width, minHeight] = previewDimensions[paperSize]

  return `
    @page { size: ${size.pageSize}; margin: ${size.margin}; }
    .challan-sheet { box-sizing: border-box; width: ${width}; min-height: ${minHeight}; padding: 16px; background: white; color: #111; font-family: Arial, Helvetica, sans-serif; font-size: ${size.fontSize}; line-height: 1.3; }
    .challan-sheet * { box-sizing: border-box; }
    .challan-heading { display: grid; grid-template-columns: 1fr 0.8fr; border: 2px solid #111; }
    .challan-company { padding: 12px; text-align: center; border-right: 2px solid #111; }
    .challan-company-name { font-size: 25px; font-weight: 800; text-transform: uppercase; }
    .challan-company-address { margin-top: 4px; line-height: 1.35; }
    .challan-meta { display: grid; grid-template-columns: 1fr 1fr; }
    .challan-meta div { min-height: 40px; padding: 7px; border-bottom: 1px solid #111; }
    .challan-meta div:nth-child(odd) { border-right: 1px solid #111; }
    .challan-meta div:nth-last-child(-n+2) { border-bottom: 0; }
    .challan-from-to { display: grid; grid-template-columns: 1fr 1fr; border: 2px solid #111; border-top: 0; }
    .challan-from-to div { min-height: 36px; padding: 8px; }
    .challan-from-to div + div { border-left: 1px solid #111; }
    .challan-parties { border: 2px solid #111; border-top: 0; }
    .challan-party { min-height: 34px; padding: 7px; }
    .challan-party + .challan-party { border-top: 1px dotted #111; }
    .challan-label { font-weight: 700; }
    .challan-items { width: 100%; border-collapse: collapse; table-layout: fixed; }
    .challan-items th, .challan-items td { border: 1px solid #111; padding: 5px; vertical-align: top; }
    .challan-items th { text-align: center; font-size: 11px; }
    .challan-items .challan-qty { width: 16%; }
    .challan-items .challan-particulars { width: 55%; }
    .challan-items .challan-rate { width: 14%; }
    .challan-items .challan-total { width: 15%; }
    .challan-items tbody td { min-height: 170px; height: 170px; }
    .challan-item-particulars { white-space: pre-line; }
    .challan-item-extra-space { min-height: 105px; }
    .challan-items tfoot td { font-weight: 700; }
    .challan-payment-details { margin: 5px 0 8px; }
    .challan-mode-payment { padding: 3px 2px; }
    .challan-value-words { border-top: 1px dotted #777; border-bottom: 1px dotted #777; padding: 5px 2px; font-style: italic; }
    .challan-freight-section { display: flex; justify-content: flex-end; margin-top: 10px; }
    .challan-freight { width: 48%; border-collapse: collapse; table-layout: fixed; }
    .challan-freight caption { border: 1px solid #111; border-bottom: 0; padding: 5px; font-weight: 700; text-align: center; letter-spacing: .04em; }
    .challan-freight th, .challan-freight td { border: 1px solid #111; padding: 4px 6px; }
    .challan-freight th { background: #f1f1f1; text-align: center; font-weight: 700; }
    .challan-freight .challan-freight-label { width: 68%; text-align: left; }
    .challan-freight .challan-freight-rupees, .challan-freight .challan-freight-paise { width: 16%; text-align: right; }
    .challan-freight-total td { border-top: 2px solid #111; font-weight: 700; }
    .challan-payment-cell { text-align: center; vertical-align: middle !important; font-weight: 700; }
    .challan-bottom { display: flex; justify-content: space-between; align-items: flex-end; min-height: 60px; padding: 10px 4px 0; font-weight: 700; }
    .challan-signature { min-width: 180px; border-top: 1px solid #111; padding-top: 6px; text-align: center; }
    ${
      !landscape
        ? `
      .challan-sheet { padding: 12px; font-size: 9px; }
      .challan-heading { grid-template-columns: 1fr; }
      .challan-company { padding: 8px; border-right: 0; border-bottom: 1px solid #111; }
      .challan-company-name { font-size: 19px; }
      .challan-meta div { min-height: 30px; padding: 5px; }
      .challan-from-to div { min-height: 30px; padding: 6px; }
      .challan-party { min-height: 28px; padding: 5px; }
      .challan-items th, .challan-items td { padding: 3px; font-size: 7px; }
      .challan-items th { font-size: 7px; }
      .challan-items tbody td { min-height: 130px; height: 130px; }
      .challan-freight { width: 56%; }
      .challan-freight th, .challan-freight td, .challan-freight caption { padding: 3px 5px; font-size: 7px; }
      .challan-items .challan-qty { width: 16%; }
      .challan-items .challan-particulars { width: 55%; }
      .challan-items .challan-rate { width: 14%; }
      .challan-items .challan-total { width: 15%; }
      .challan-item-extra-space { min-height: 75px; }
      .challan-payment-details { margin: 4px 0 5px; }
      .challan-value-words { padding: 3px 2px; }
      .challan-bottom { min-height: 44px; }
      .challan-signature { min-width: 120px; }
    `
        : ''
    }
    @media print {
      body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .challan-sheet { width: 100%; min-height: 0; padding: 0; }
    }
  `
}

const displayValue = (value?: string | number | null) => value || '\u00a0'
const amount = (value?: number | string | null) =>
  (Number(value) || 0).toFixed(2)

type ChallanCurrency = NonNullable<
  NonNullable<DayBookSchema['company']>['currency']
>

function formatCurrencyAmount(
  value: number | string | null | undefined,
  currency: ChallanCurrency | null | undefined,
) {
  const parsedDecimalPlaces = Number.parseInt(
    currency?.decimalPlaces ?? '2',
    10,
  )
  const decimalPlaces = Number.isFinite(parsedDecimalPlaces)
    ? Math.max(0, Math.min(6, parsedDecimalPlaces))
    : 2
  const [integerPart, fractionPart] = (Number(value) || 0)
    .toFixed(decimalPlaces)
    .split('.')
  const thousandsSeparator = currency?.thousandsSeparator ?? ','
  const decimalSeparator = currency?.decimalSeparator ?? '.'
  const groupedInteger = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    thousandsSeparator,
  )
  const formattedNumber = fractionPart
    ? `${groupedInteger}${decimalSeparator}${fractionPart}`
    : groupedInteger
  const symbol = currency?.symbol?.trim()

  if (!symbol) return formattedNumber
  return currency?.symbolPosition === 'after'
    ? `${formattedNumber} ${symbol}`
    : `${symbol}${formattedNumber}`
}

function formatItemAmount(
  value: number | string | null | undefined,
  currency: ChallanCurrency | null | undefined,
) {
  return value == null || value === ''
    ? ''
    : formatCurrencyAmount(value, currency)
}

function splitRupeesPaise(value: number | string | null | undefined) {
  const numericValue = Number(value) || 0
  const [rupees, paise = '00'] = Math.abs(numericValue).toFixed(2).split('.')
  return {
    rupees: numericValue < 0 ? `− ${rupees}` : rupees,
    paise,
  }
}

type ChallanItemRow = {
  quantity: string
  quantityValue: number
  particulars: string
  rate: string
  total: string
  totalValue: number
}

function getChallanItemRows(data: DayBookSchema): ChallanItemRow[] {
  const entries = data.stockJournal?.stockJournalEntries?.filter(Boolean) ?? []
  const dispatch = data.voucherDispatchDetail
  const resolvedWeight = resolveDispatchWeight(data)
  const weightUnit = dispatch?.weightUnit?.code

  if (entries.length === 0) {
    return [
      {
        quantity: '',
        quantityValue: 0,
        particulars:
          resolvedWeight > 0
            ? `Weight: ${resolvedWeight.toFixed(dispatch?.weightUnit?.noOfDecimalPlaces ?? 2)}${weightUnit ? ` ${weightUnit}` : ''}`
            : '',
        rate: Number(dispatch?.rate) > 0 ? amount(dispatch?.rate) : '',
        total:
          Number(dispatch?.totalFare) > 0 ? amount(dispatch?.totalFare) : '',
        totalValue: Number(dispatch?.totalFare) || 0,
      },
    ]
  }

  return entries.flatMap((entry, entryIndex) => {
    const item = entry?.stockItem
    const trackingRows = entry?.stockJournalGodownEntries?.filter(Boolean) ?? []
    const details = [
      item?.printName ?? item?.name,
      item?.code ? `Code: ${item.code}` : undefined,
      item?.sku ? `SKU: ${item.sku}` : undefined,
      item?.articleNo ? `Article No.: ${item.articleNo}` : undefined,
      item?.partNo ? `Part No.: ${item.partNo}` : undefined,
      item?.description,
    ].filter(Boolean)
    const sourceRows = trackingRows.length > 0 ? trackingRows : [null]

    return sourceRows.map((tracking, trackingIndex) => {
      const unit =
        tracking?.stockUnit?.code ??
        entry?.stockUnit?.code ??
        item?.stockUnit?.code ??
        ''
      const rawQuantity = Number(
        tracking?.actualQuantity ?? entry?.actualQuantity ?? 0,
      )
      const itemRate = Number(tracking?.rate ?? entry?.rate ?? 0)
      const usesDispatchRate =
        entryIndex === 0 && trackingIndex === 0 && itemRate <= 0
      const rateValue =
        itemRate > 0
          ? itemRate
          : usesDispatchRate
            ? Number(dispatch?.rate) || 0
            : 0
      const entryQuantity = Number(entry?.actualQuantity) || 0
      const entryAmount = Number(entry?.amount) || 0
      const trackingAmount = Number(tracking?.amount) || 0
      const totalValue =
        tracking?.amount != null
          ? trackingAmount
          : entry?.amount != null && trackingRows.length <= 1
            ? entryAmount
            : entryAmount > 0 && entryQuantity > 0
              ? (entryAmount * rawQuantity) / entryQuantity
              : usesDispatchRate
                ? Number(dispatch?.totalFare) ||
                  resolveDispatchWeight(data) * rateValue
                : rawQuantity * rateValue
      const decimals =
        tracking?.stockUnit?.noOfDecimalPlaces ??
        entry?.stockUnit?.noOfDecimalPlaces ??
        item?.stockUnit?.noOfDecimalPlaces ??
        2
      const particulars = [
        ...details,
        tracking?.batchNo ? `Batch No.: ${tracking.batchNo}` : undefined,
        resolvedWeight > 0 && entryIndex === 0 && trackingIndex === 0
          ? `Weight: ${resolvedWeight.toFixed(dispatch?.weightUnit?.noOfDecimalPlaces ?? 2)}${weightUnit ? ` ${weightUnit}` : ''}`
          : undefined,
        tracking?.godown?.name ? `Godown: ${tracking.godown.name}` : undefined,
        tracking?.serialNo ? `Serial No.: ${tracking.serialNo}` : undefined,
        tracking?.mfgDate
          ? `Mfg. Date: ${date_format(tracking.mfgDate)}`
          : undefined,
        tracking?.expiryDate
          ? `Expiry Date: ${date_format(tracking.expiryDate)}`
          : undefined,
        tracking?.remarks,
      ]
        .filter(Boolean)
        .join('\n')

      return {
        quantity: `${rawQuantity.toFixed(decimals)}${unit ? ` ${unit}` : ''}`,
        quantityValue: rawQuantity,
        particulars,
        rate: rateValue > 0 ? amount(rateValue) : '',
        total: totalValue > 0 ? amount(totalValue) : '',
        totalValue,
      }
    })
  })
}

function getFreightTotal(
  dispatch: NonNullable<DayBookSchema['voucherDispatchDetail']>,
) {
  const savedTotal = Number(dispatch.totalFare) || 0
  if (savedTotal > 0) return savedTotal

  return Math.max(
    0,
    (Number(dispatch.freightCharges) ||
      (Number(dispatch.rate) || 0) * (Number(dispatch.weight) || 0)) +
      (Number(dispatch.loadingCharges) || 0) +
      (Number(dispatch.unloadingCharges) || 0) +
      (Number(dispatch.insuranceCharges) || 0) +
      (Number(dispatch.otherCharges) || 0) +
      (Number(dispatch.packingCharges) || 0) -
      (Number(dispatch.discount) || 0),
  )
}

function getFreightLines(data: DayBookSchema) {
  const dispatch = data.voucherDispatchDetail
  const baseFare =
    dispatch?.freightCharges ??
    (Number(dispatch?.rate) || 0) * resolveDispatchWeight(data)

  return [
    ['Freight', baseFare],
    ['Surcharge', dispatch?.loadingCharges],
    ['Hamili', dispatch?.unloadingCharges],
    ['Risk Ch.', dispatch?.insuranceCharges],
    ['O/Cl', dispatch?.otherCharges],
    ['St.', dispatch?.packingCharges],
    ['Less: Discount', -(Number(dispatch?.discount) || 0)],
  ] as [string, number | string | null | undefined][]
}

function amountInWords(value: number) {
  const rupees = Math.floor(value)
  const paise = Math.round((value - rupees) * 100)
  const rupeesInWords = numberToWords(rupees)
  const paiseInWords = paise > 0 ? ` and ${numberToWords(paise)} Paise` : ''
  return `Rupees ${rupeesInWords}${paiseInWords} Only`
}

function ChallanPreview({
  data,
  paperSize,
  showDocumentInfo,
  showParties,
  showItems,
  showFreight,
  showAuthorizations,
}: Props & { paperSize: ChallanPaperSize } & ChallanSections) {
  const dispatch = data.voucherDispatchDetail
  const company = data.company
  const companyAddress = company?.address
  const party = data.party
  const itemRows = getChallanItemRows(data)
  const currency = company?.currency ?? null
  const entries = data.stockJournal?.stockJournalEntries?.filter(Boolean) ?? []
  const totalQuantity = itemRows.reduce(
    (sum, row) => sum + row.quantityValue,
    0,
  )

  const quantityDecimals =
    entries[0]?.stockUnit?.noOfDecimalPlaces ??
    entries[0]?.stockItem?.stockUnit?.noOfDecimalPlaces ??
    2
  const quantityUnit =
    entries[0]?.stockUnit?.code ?? entries[0]?.stockItem?.stockUnit?.code
  const freightTotal = dispatch ? getFreightTotal(dispatch) : 0
  const insuredValue = Number(data.amount) || 0
  const address = [
    companyAddress?.line1,
    companyAddress?.line2,
    companyAddress?.city,
    companyAddress?.district,
    companyAddress?.state?.name,
    companyAddress?.postalCode,
  ]
    .filter(Boolean)
    .join(', ')
  const consigneeAddress = [party?.line1, party?.line2, party?.line3]
    .filter(Boolean)
    .join(', ')

  return (
    <div className={`challan-sheet challan-sheet-${paperSize}`}>
      <style>{challanStyles(paperSize)}</style>
      {showDocumentInfo && (
        <>
          <div className="challan-heading">
            <div className="challan-company">
              <div className="challan-company-name">
                {company?.name ?? 'Company'}
              </div>
              <div className="challan-company-address">
                {address || 'Company address'}
                {(company?.phoneNo || company?.mobileNo) && (
                  <div>
                    Phone:{' '}
                    {[company.phoneNo, company.mobileNo]
                      .filter(Boolean)
                      .join(' / ')}
                  </div>
                )}
              </div>
            </div>
            <div className="challan-meta">
              <div>
                <span className="challan-label">No.:</span>{' '}
                {displayValue(data.voucherNo)}
              </div>
              <div>
                <span className="challan-label">Truck No.:</span>{' '}
                {displayValue(dispatch?.motorVehicleNo)}
              </div>
              <div>
                <span className="challan-label">From:</span>{' '}
                {displayValue(dispatch?.source)}
              </div>
              <div>
                <span className="challan-label">Date:</span>{' '}
                {date_format(data.voucherDate)}
              </div>
              <div>
                <span className="challan-label">To:</span>{' '}
                {displayValue(dispatch?.destination)}
              </div>
              <div>
                <span className="challan-label">Reference:</span>{' '}
                {displayValue(data.referenceNo)}
              </div>
            </div>
          </div>
          <div className="challan-from-to">
            <div>
              <span className="challan-label">Consignor:</span>{' '}
              {company?.name ?? ''}
            </div>
            <div>
              <span className="challan-label">Consignee:</span>{' '}
              {party?.name ?? data.partyLedger?.name ?? ''}
            </div>
          </div>
        </>
      )}
      {showParties && (
        <div className="challan-parties">
          <div className="challan-party">
            <span className="challan-label">
              Consignor's Name &amp; Address:
            </span>{' '}
            {[company?.name, address].filter(Boolean).join(', ')}
          </div>
          <div className="challan-party">
            <span className="challan-label">
              Consignee's Name &amp; Address:
            </span>{' '}
            {[
              party?.name ?? data.partyLedger?.name,
              consigneeAddress,
              party?.state?.name,
              party?.country?.name,
            ]
              .filter(Boolean)
              .join(', ')}
          </div>
        </div>
      )}
      {showItems && (
        <table className="challan-items">
          <thead>
            <tr>
              <th className="challan-qty">No. Bags / Qty</th>
              <th className="challan-particulars">Particulars</th>
              <th className="challan-rate">Rate Per MT</th>
              <th className="challan-total">Total</th>
            </tr>
          </thead>
          <tbody>
            {itemRows.map((row, index) => (
              <tr key={`${row.quantity}-${index}`}>
                <td>{row.quantity}</td>
                <td className="challan-item-particulars">
                  {row.particulars}
                  <div className="challan-item-extra-space" />
                </td>
                <td>{formatItemAmount(row.rate, currency)}</td>
                <td>{formatItemAmount(row.total, currency)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>
                {totalQuantity > 0
                  ? `${totalQuantity.toFixed(quantityDecimals)}${quantityUnit ? ` ${quantityUnit}` : ''}`
                  : ''}
              </td>
              <td>Total</td>
              <td></td>
              <td>
                {formatItemAmount(
                  itemRows.reduce((sum, row) => sum + row.totalValue, 0),
                  currency,
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      )}
      <div className="challan-payment-details">
        <div className="challan-mode-payment">
          <span className="challan-label">Mode of Payment: </span>
          {dispatch?.billingPreference === 'due'
            ? 'To be billed'
            : dispatch?.billingPreference || 'To be billed'}
        </div>
        <div className="challan-value-words">
          <span className="challan-label">Insured Value: </span>
          {formatCurrencyAmount(insuredValue, currency)}
          {' — '}
          <span className="challan-label">Value in words: </span>
          {amountInWords(insuredValue)}
        </div>
      </div>
      {showFreight && (
        <div className="challan-freight-section">
          <table className="challan-freight">
            <caption>FREIGHT CHARGES</caption>
            <thead>
              <tr>
                <th className="challan-freight-label">Particulars</th>
                <th className="challan-freight-rupees">Rs.</th>
                <th className="challan-freight-paise">P.</th>
              </tr>
            </thead>
            <tbody>
              {getFreightLines(data).map(([label, value], index) => {
                const parts = splitRupeesPaise(value)
                return (
                  <tr key={`${label}-${index}`}>
                    <td className="challan-freight-label">{label}</td>
                    <td className="challan-freight-rupees">
                      {Number(value) ? parts.rupees : ''}
                    </td>
                    <td className="challan-freight-paise">
                      {Number(value) ? parts.paise : ''}
                    </td>
                  </tr>
                )
              })}
              <tr className="challan-freight-total">
                <td className="challan-freight-label">NET TOTAL</td>
                <td className="challan-freight-rupees">
                  {splitRupeesPaise(freightTotal).rupees}
                </td>
                <td className="challan-freight-paise">
                  {splitRupeesPaise(freightTotal).paise}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {showAuthorizations && (
        <div className="challan-bottom">
          <div>AT OWNERS RISK</div>
          <div className="challan-signature">
            For {company?.name ?? 'Company'}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ChallanDialog({ data }: Props) {
  const printRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [paperSize, setPaperSize] = useLocalStorage<ChallanPaperSize>(
    'print-paper-size',
    'a5-landscape',
    {
      deserialize: (stored, fallback) =>
        PAPER_SIZES.some((size) => size.id === stored)
          ? (stored as ChallanPaperSize)
          : fallback,
    },
  )
  const [showDocumentInfo, setShowDocumentInfo] = useLocalStorage(
    'challan-show-document-info',
    true,
  )
  const [showParties, setShowParties] = useLocalStorage(
    'challan-show-parties',
    true,
  )
  const [showItems, setShowItems] = useLocalStorage('challan-show-items', true)
  const [showFreight, setShowFreight] = useLocalStorage(
    'challan-show-freight',
    true,
  )
  const [showAuthorizations, setShowAuthorizations] = useLocalStorage(
    'challan-show-authorizations',
    true,
  )
  const hiddenSectionsCount = [
    showDocumentInfo,
    showParties,
    showItems,
    showFreight,
    showAuthorizations,
  ].filter((visible) => !visible).length
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  const printChallan = () => {
    if (!printRef.current) return
    const iframe = document.createElement('iframe')
    iframe.title = 'Delivery challan print preview'
    iframe.style.position = 'fixed'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    iframe.style.left = '-10000px'
    document.body.appendChild(iframe)

    const printWindow = iframe.contentWindow
    if (!printWindow) {
      iframe.remove()
      return
    }

    printWindow.document.open()
    printWindow.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>Delivery Challan ${data.voucherNo ?? ''}</title></head><body>${printRef.current.innerHTML}</body></html>`,
    )
    printWindow.document.close()
    const cleanup = () => iframe.remove()
    printWindow.addEventListener('afterprint', cleanup, { once: true })
    printWindow.focus()
    printWindow.print()
    window.setTimeout(cleanup, 1000)
  }

  const downloadChallanPdf = async () => {
    if (isExportingPdf) return
    setIsExportingPdf(true)
    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ])
      const entries =
        data.stockJournal?.stockJournalEntries?.filter(Boolean) ?? []
      const itemRows = getChallanItemRows(data)
      const dispatch = data.voucherDispatchDetail
      const company = data.company
      const party = data.party
      const address = [
        company?.address?.line1,
        company?.address?.line2,
        company?.address?.city,
        company?.address?.district,
        company?.address?.state?.name,
        company?.address?.postalCode,
      ]
        .filter(Boolean)
        .join(', ')
      const consigneeAddress = [party?.line1, party?.line2, party?.line3]
        .filter(Boolean)
        .join(', ')
      const freightTotal = dispatch ? getFreightTotal(dispatch) : 0
      const insuredValue = Number(data.amount) || 0
      const filename = `delivery-challan-${(data.voucherNo || String(data.id || 'voucher')).replace(/[^a-zA-Z0-9-_]/g, '-')}.pdf`

      const paper =
        PAPER_SIZES.find((size) => size.id === paperSize) ?? PAPER_SIZES[0]
      const landscape = paperSize.endsWith('landscape')
      const format: [number, number] =
        paperSize === 'a5-landscape'
          ? [210, 148]
          : paperSize === 'a4-landscape'
            ? [297, 210]
            : paperSize === 'a5-portrait'
              ? [148, 210]
              : [210, 297]
      const pageWidth = format[0]
      const pageHeight = format[1]
      const margin = Number.parseFloat(paper.margin)
      const doc = new jsPDF({
        orientation: landscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format,
      })
      const center = pageWidth / 2
      let y = margin + 5
      if (showDocumentInfo) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(14)
        doc.text(company?.name ?? 'Company', center, y, { align: 'center' })
        y += 5
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.text(address, center, y, { align: 'center' })
        y += 5
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.text('DELIVERY CHALLAN', center, y, { align: 'center' })
        y += 7
        doc.setFontSize(8)
        doc.text(`No: ${data.voucherNo ?? ''}`, margin, y)
        doc.text(
          `Date: ${date_format(data.voucherDate)}`,
          pageWidth - margin,
          y,
          {
            align: 'right',
          },
        )
        y += 5
        doc.setFont('helvetica', 'normal')
        doc.text(`Truck No: ${dispatch?.motorVehicleNo ?? ''}`, margin, y)
        doc.text(`From: ${dispatch?.source ?? ''}`, center, y, {
          align: 'center',
        })
        doc.text(`To: ${dispatch?.destination ?? ''}`, pageWidth - margin, y, {
          align: 'right',
        })
        y += 6
      }
      if (showParties) {
        doc.setFontSize(8)
        doc.text(`Consignor: ${company?.name ?? ''}  ${address}`, margin, y, {
          maxWidth: pageWidth - margin * 2,
        })
        y += 5
        doc.text(
          `Consignee: ${party?.name ?? data.partyLedger?.name ?? ''}  ${consigneeAddress}`,
          margin,
          y,
          { maxWidth: pageWidth - margin * 2 },
        )
        y += 5
      }
      let itemFinalY = y
      if (showItems) {
        const totalQuantity = itemRows.reduce(
          (sum, row) => sum + row.quantityValue,
          0,
        )
        const quantityDecimals =
          entries[0]?.stockUnit?.noOfDecimalPlaces ??
          entries[0]?.stockItem?.stockUnit?.noOfDecimalPlaces ??
          2
        autoTable(doc, {
          startY: y,
          head: [['No. Bags / Qty', 'Particulars', 'Rate Per MT', 'Total']],
          body: itemRows.map((row) => [
            row.quantity,
            row.particulars,
            formatItemAmount(row.rate, company?.currency ?? null),
            formatItemAmount(row.total, company?.currency ?? null),
          ]),
          foot: [
            [
              `${totalQuantity.toFixed(quantityDecimals)}${(entries[0]?.stockUnit?.code ?? entries[0]?.stockItem?.stockUnit?.code) ? ` ${entries[0]?.stockUnit?.code ?? entries[0]?.stockItem?.stockUnit?.code}` : ''}`,
              'Total',
              '',
              formatItemAmount(
                itemRows.reduce((sum, row) => sum + row.totalValue, 0),
                company?.currency ?? null,
              ),
            ],
          ],
          theme: 'grid',
          styles: {
            font: 'helvetica',
            fontSize: 7,
            cellPadding: 1.5,
            minCellHeight: 28,
            overflow: 'linebreak',
            textColor: [17, 17, 17],
            lineColor: [17, 17, 17],
            valign: 'top',
          },
          headStyles: {
            fontStyle: 'bold',
            halign: 'center',
            fillColor: [255, 255, 255],
            textColor: [17, 17, 17],
          },
          footStyles: {
            fontStyle: 'bold',
            fillColor: [255, 255, 255],
            textColor: [17, 17, 17],
          },
          columnStyles: landscape
            ? {
                0: { cellWidth: 28 },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 30 },
                3: { cellWidth: 30 },
              }
            : {
                0: { cellWidth: 23 },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 22 },
                3: { cellWidth: 23 },
              },
          margin: { left: margin, right: margin },
        })
        itemFinalY =
          (doc as typeof doc & { lastAutoTable?: { finalY: number } })
            .lastAutoTable?.finalY ?? y
        y = itemFinalY + 5
      }
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.text(
        `Mode of Payment: ${dispatch?.billingPreference === 'due' ? 'To be billed' : dispatch?.billingPreference || 'To be billed'}`,
        margin,
        y,
      )
      y += 5
      doc.text(
        `Insured Value: ${formatCurrencyAmount(insuredValue, company?.currency ?? null)} — Value in words: ${amountInWords(insuredValue)}`,
        margin,
        y,
        { maxWidth: pageWidth - margin * 2 },
      )
      y += 5
      if (showFreight) {
        const freightLines = getFreightLines(data)
        autoTable(doc, {
          startY: y,
          head: [['FREIGHT CHARGES', 'Rs.', 'P.']],
          body: freightLines.map(([label, value]) => {
            const parts = splitRupeesPaise(value)
            return [
              label,
              Number(value) ? parts.rupees : '',
              Number(value) ? parts.paise : '',
            ]
          }),
          foot: [
            [
              'NET TOTAL',
              splitRupeesPaise(freightTotal).rupees,
              splitRupeesPaise(freightTotal).paise,
            ],
          ],
          theme: 'grid',
          styles: {
            font: 'helvetica',
            fontSize: 7,
            cellPadding: 1.5,
            textColor: [17, 17, 17],
            lineColor: [17, 17, 17],
          },
          headStyles: {
            fontStyle: 'bold',
            halign: 'center',
            fillColor: [255, 255, 255],
            textColor: [17, 17, 17],
          },
          footStyles: {
            fontStyle: 'bold',
            fillColor: [255, 255, 255],
            textColor: [17, 17, 17],
          },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 18, halign: 'right' },
            2: { cellWidth: 12, halign: 'right' },
          },
          tableWidth: Math.min(pageWidth - margin * 2, pageWidth * 0.48),
          margin: {
            left:
              pageWidth -
              margin -
              Math.min(pageWidth - margin * 2, pageWidth * 0.48),
            right: margin,
          },
        })
        const freightFinalY =
          (doc as typeof doc & { lastAutoTable?: { finalY: number } })
            .lastAutoTable?.finalY ?? y
        y = freightFinalY + 4
      }
      const finalY = Math.max(
        (doc as typeof doc & { lastAutoTable?: { finalY: number } })
          .lastAutoTable?.finalY ?? itemFinalY,
        y,
      )
      const footerY = Math.min(finalY + 8, pageHeight - 8)
      if (showAuthorizations) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7)
        doc.text('AT OWNERS RISK', margin, footerY)
        doc.line(
          pageWidth - margin - 48,
          footerY - 2,
          pageWidth - margin,
          footerY - 2,
        )
        doc.text(
          `For ${company?.name ?? 'Company'}`,
          pageWidth - margin,
          footerY + 3,
          { align: 'right' },
        )
      }
      doc.save(filename)
    } catch (error) {
      console.error('Delivery challan PDF export failed:', error)
    } finally {
      setIsExportingPdf(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={`Preview challan ${data.voucherNo ?? ''}`}
        >
          <Eye className="h-4 w-4" /> Challan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[min(96vw,1500px)] max-w-[min(96vw,1500px)] sm:max-w-[min(96vw,1500px)] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Delivery Challan Preview</DialogTitle>
          <DialogDescription>
            Preview the challan for delivery note {data.voucherNo ?? ''} before
            printing.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
          <div className="flex items-center gap-2">
            <label htmlFor="challan-paper-size" className="text-sm font-medium">
              Paper Size:
            </label>
            <select
              id="challan-paper-size"
              aria-label="Paper size"
              value={paperSize}
              onChange={(event) =>
                setPaperSize(event.target.value as ChallanPaperSize)
              }
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              {PAPER_SIZES.map((size) => (
                <option key={size.id} value={size.id}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                title={
                  hiddenSectionsCount > 0
                    ? `${hiddenSectionsCount} section${hiddenSectionsCount === 1 ? '' : 's'} hidden`
                    : 'Toggle which sections appear in the preview and print'
                }
              >
                <Settings2 className="h-4 w-4" />
                Sections
                {hiddenSectionsCount > 0 && (
                  <span
                    aria-label={`${hiddenSectionsCount} section${hiddenSectionsCount === 1 ? '' : 's'} hidden`}
                    className="ml-1 rounded-full bg-amber-100 px-1.5 text-xs font-semibold text-amber-700"
                  >
                    {hiddenSectionsCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" side="top" className="w-64 p-3">
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Section Visibility
              </h4>
              <div className="flex flex-col gap-3">
                {(
                  [
                    ['Document Info', showDocumentInfo, setShowDocumentInfo],
                    ['Parties', showParties, setShowParties],
                    ['Items', showItems, setShowItems],
                    ['Freight', showFreight, setShowFreight],
                    [
                      'Authorizations',
                      showAuthorizations,
                      setShowAuthorizations,
                    ],
                  ] as const
                ).map(([label, checked, setChecked]) => (
                  <label
                    key={label}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-sm">{label}</span>
                    <Switch
                      aria-label={label}
                      checked={checked}
                      onCheckedChange={setChecked}
                    />
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex-1 overflow-auto rounded-md border bg-slate-100 p-3 dark:bg-slate-900">
          <div ref={printRef} className="mx-auto w-fit shadow-md">
            <ChallanPreview
              data={data}
              paperSize={paperSize}
              showDocumentInfo={showDocumentInfo}
              showParties={showParties}
              showItems={showItems}
              showFreight={showFreight}
              showAuthorizations={showAuthorizations}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={downloadChallanPdf}
            disabled={isExportingPdf}
          >
            <Download className="h-4 w-4" />{' '}
            {isExportingPdf ? 'Preparing PDF…' : 'Download PDF'}
          </Button>
          <Button type="button" onClick={printChallan}>
            <Printer className="h-4 w-4" /> Print Challan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

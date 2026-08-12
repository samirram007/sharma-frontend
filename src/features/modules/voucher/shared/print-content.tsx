import { numberToWords } from '@/utils/helper'
import { date_format } from '@/utils/removeEmptyStrings'
import type { z } from 'zod'
import type { companySchema } from '@/features/modules/company/data/schema'
import type { VoucherSchema } from '../data-schema/voucher-schema'
import { buildChargeRows, FareBreakdown } from './fare-breakdown'

/**
 * Shared print bodies for Freight and Delivery Note vouchers, used by the
 * day_book and receipt print dialogs. Both list schemas extend voucherSchema;
 * `voucherReferences` (the freight voucher → delivery note link, which carries
 * the dispatch detail incl. discount) is only declared on some schemas.
 */
export type PrintContentData = VoucherSchema & {
  company?: z.infer<typeof companySchema> | null
  voucherReferences?: Array<{ referenceVoucher?: VoucherSchema | null }> | null
}

export const FreightPrintContent = (printData: PrintContentData) => {
  const dispatchDetail =
    printData.voucherDispatchDetail ??
    printData.voucherReferences?.find(
      (vr) => vr.referenceVoucher?.voucherTypeId === 2001,
    )?.referenceVoucher?.voucherDispatchDetail ??
    printData.voucherReferences?.[0]?.referenceVoucher?.voucherDispatchDetail ??
    null
  const { discount } = buildChargeRows(dispatchDetail)
  const totalFare =
    Number(printData.amount) || Number(dispatchDetail?.totalFare) || 0
  const weight = Number(dispatchDetail?.weight) || 0
  const weightUnitCode = dispatchDetail?.weightUnit?.code
  const weightDecimals = dispatchDetail?.weightUnit?.noOfDecimalPlaces ?? 2
  const rate = Number(dispatchDetail?.rate) || 0

  return (
    <>
      <div className="x-header">
        <div className="text-center text-4xl">{printData?.company?.name}</div>
        <div className="text-center font-semibold underline underline-offset-4 decoration-2 decoration-blue-700">
          Freight Receipt
        </div>
        <div className="grid grid-cols-2">
          <div>
            <span>Voucher No:</span>{' '}
            <span className="underline decoration-dotted underline-offset-4 ">
              {' '}
              {printData?.voucherNo}
            </span>
          </div>
          <div className="flex justify-end">
            Voucher Date:{' '}
            <span className="underline decoration-dotted underline-offset-4 ">
              {' '}
              {date_format(printData?.voucherDate)}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2">
          <div className="flex gap-2">
            <span>Dl. No.:</span>{' '}
            <span className="underline decoration-dotted underline-offset-4 ">
              {' '}
              {printData?.referenceNo}
            </span>
          </div>
          <div className="flex justify-end gap-2">
            <span>Dl. Date:</span>{' '}
            <span className="underline decoration-dotted underline-offset-4 ">
              {' '}
              {printData?.referenceDate
                ? date_format(printData.referenceDate)
                : ''}
            </span>
          </div>
        </div>
        {/* Dispatch details live on the referenced delivery note — the freight
            voucher itself has none, so the fallback chain is the data source. */}
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className="flex gap-2">
            <span>Transport Name:</span>{' '}
            <span className="underline decoration-dotted underline-offset-4 ">
              {' '}
              {dispatchDetail?.carrierName}
            </span>
          </div>
          <div className="flex justify-end gap-2">
            <span>Truck No:</span>{' '}
            <span className="underline decoration-dotted underline-offset-4 ">
              {' '}
              {dispatchDetail?.motorVehicleNo}
            </span>
          </div>
          {weight > 0 && (
            <div className="flex gap-2">
              <span>Weight:</span>{' '}
              <span className="underline decoration-dotted underline-offset-4 ">
                {' '}
                {weight.toFixed(weightDecimals)}
                {weightUnitCode ? ` ${weightUnitCode}` : ''}
              </span>
            </div>
          )}
          {rate > 0 && (
            <div className="flex justify-end gap-2">
              <span>Rate:</span>{' '}
              <span className="underline decoration-dotted underline-offset-4 ">
                {' '}
                {rate.toFixed(2)}
              </span>
            </div>
          )}
        </div>
        {dispatchDetail?.billingPreference && (
          <div className="grid grid-cols-2 mt-1">
            <div className="flex gap-2">
              <span>Billing:</span>{' '}
              <span className="capitalize underline decoration-dotted underline-offset-4 font-semibold">
                {dispatchDetail.billingPreference}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="x-body mt-16 grid grid-cols-[1fr_200px] gap-6">
        <div className="grid  gap-4">
          <div className="grid grid-cols-[auto_1fr] items-start  gap-4">
            <div>Received with thanks from</div>
            <div className="border-b-2 border-y-zinc-400 border-dotted text-xl">
              <span className="px-4"></span>
              {printData?.partyLedger?.name}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 border-dotted">
            <div className="italic space-y-8 underline decoration-2 decoration-dotted text-justify underline-offset-8">
              {printData?.remarks}
            </div>
          </div>
          <div>
            <div className="border-b-2 border-zinc-900 border-dotted italic">
              <span>Rupees </span> {numberToWords(printData?.amount!)}
              {discount > 0 && (
                <> (after discount of {numberToWords(Math.round(discount))})</>
              )}
            </div>
          </div>
          <div className="mt-2 border-t-2 border-gray-900 pt-2">
            <FareBreakdown
              dispatchDetail={dispatchDetail}
              totalFare={totalFare}
              showNetAdjustment
            />
          </div>
        </div>
        <div>
          <div className="grid grid-cols-1 border-gray-900! border-2 text-center">
            <div className="border-gray-900 border-b-2 text-center">Amount</div>
            <div className="grid grid-cols-[1fr_60px]">
              <div className="border-gray-900 border-r-2">Rs.</div>
              <div className="border-2 text-center">P.</div>
            </div>
            <div className="h-26 grid grid-cols-[1fr_60px]   border-gray-900 border-t-2   text-left">
              <div className="pl-2 border-gray-900  border-r-2">
                {' '}
                {printData?.amount?.toFixed(0)}
              </div>
              <div className="text-center">
                {((printData?.amount ?? 0) % 1).toFixed(2).split('.')[1]}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="x-footer h-12 mt-12 grid grid-cols-2">
        <div className="flex flex-row items-end gap-6">
          <div className="w-12 h-12 border-2 border-zinc-900"></div>
          <div className="h-full text-left flex flex-col justify-end">
            <div className="text-xl">Distributor Signature</div>
            <div className="h-full text-xs   font-bold">
              Signature of Drawer
            </div>
          </div>
        </div>
        <div className="h-full text-xs text-right font-bold flex justify-end items-end">
          For {printData?.company?.name}
        </div>
      </div>
    </>
  )
}

export const DeliveryNotePrintContent = (printData: PrintContentData) => {
  const dispatchDetail = printData.voucherDispatchDetail
  const totalFare = Number(dispatchDetail?.totalFare) || 0
  const weight = Number(dispatchDetail?.weight) || 0
  const weightUnitCode = dispatchDetail?.weightUnit?.code
  const weightDecimals = dispatchDetail?.weightUnit?.noOfDecimalPlaces ?? 2
  const rate = Number(dispatchDetail?.rate) || 0

  return (
    <>
      <div className="x-header">
        <div className="text-center font-semibold underline underline-offset-4 decoration-2 decoration-blue-700">
          Delivery Note
        </div>
        <div className="grid grid-cols-2">
          <div className="flex flex-col justify-start items-start">
            <div className="underline decoration-dotted underline-offset-4 ">
              Delivery From:
            </div>
            <div> {printData?.company?.name}</div>
            <div className="">
              <span>Dl. No:</span>{' '}
              <span className="underline decoration-dotted underline-offset-4 ">
                {' '}
                {printData?.voucherNo}
              </span>
            </div>
            <div className="">
              Date:{' '}
              <span className="underline decoration-dotted underline-offset-4 ">
                {' '}
                {date_format(printData?.voucherDate)}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end justify-end">
            <div className="underline decoration-dotted underline-offset-4 ">
              Delivery To
            </div>
            <div className="text-center">{printData?.party?.name}</div>
            <div className="text-sm">
              <div className="text-right">{printData?.party?.line1}</div>
              <div className="text-right">{printData?.party?.line2}</div>
              <div className="text-right">
                {printData?.party?.line3}{' '}
                {printData?.party?.state?.code ?? 'WB'},{' '}
                {printData?.party?.country?.name ?? 'India'}
              </div>
            </div>
            <div>
              <span>Transport Name:</span>{' '}
              <span className="underline decoration-dotted underline-offset-4 ">
                {' '}
                {printData?.voucherDispatchDetail?.carrierName}
              </span>
            </div>
            <div className="">
              Truck No:{' '}
              <span className="underline decoration-dotted underline-offset-4 ">
                {' '}
                {printData?.voucherDispatchDetail?.motorVehicleNo}
              </span>
            </div>
            {weight > 0 && (
              <div className="">
                Weight:{' '}
                <span className="underline decoration-dotted underline-offset-4 ">
                  {' '}
                  {weight.toFixed(weightDecimals)}
                  {weightUnitCode ? ` ${weightUnitCode}` : ''}
                </span>
              </div>
            )}
            {rate > 0 && (
              <div className="">
                Rate:{' '}
                <span className="underline decoration-dotted underline-offset-4 ">
                  {' '}
                  {rate.toFixed(2)}
                </span>
              </div>
            )}
            {printData?.voucherDispatchDetail?.billingPreference && (
              <div className="mt-1">
                <span>Billing Preference:</span>{' '}
                <span className="capitalize underline decoration-dotted underline-offset-4 font-semibold">
                  {printData.voucherDispatchDetail.billingPreference}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="x-body mt-2 ">
        <div className="grid grid-cols-[1fr_150px_150px_150px] gap-2 border-b-2 border-t-2 border-gray-900  text-center font-bold">
          <div className="text-left">Particulars</div>
          <div className="text-center">Qty</div>
          <div className="text-right">Rate</div>
          <div className="text-right">Amount</div>
        </div>
        {printData.stockJournal?.stockJournalEntries?.map((entry, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr_150px_150px_150px]   border-gray-900  text-center"
          >
            <div className="text-left">{entry?.stockItem?.name}</div>
            <div className="text-center">
              {entry?.actualQuantity} {entry?.stockItem?.stockUnit?.code}
            </div>
            <div className="text-right">
              {entry?.rate?.toFixed(2)}/ {entry?.stockItem?.stockUnit?.code}
            </div>
            <div className="text-right">{entry?.amount?.toFixed(2)}</div>
            <div className="col-span-4">
              {entry?.stockJournalGodownEntries?.map(
                (godownEntry, godownIndex) => (
                  <div
                    key={godownIndex}
                    className="grid grid-cols-[1fr_150px_150px_150px] gap-2 text-sm"
                  >
                    <div className="grid grid-cols-[100px_1fr] gap-2">
                      <div className="text-right">Batch: </div>
                      <div className="text-left uppercase">
                        {godownEntry?.batchNo}
                      </div>
                    </div>
                    <div className="text-center">
                      {godownEntry?.actualQuantity}{' '}
                      {entry?.stockItem?.stockUnit?.code}
                    </div>
                    <div></div>
                    <div></div>
                  </div>
                ),
              )}
            </div>
          </div>
        ))}
        <div>
          <div className="grid grid-cols-[1fr_150px_150px_150px] gap-2 border-t-2 border-gray-900  text-center font-bold">
            <div className="text-left"></div>
            <div></div>
            <div className="text-right pr-2">Total: </div>
            <div className="text-right">
              {printData.stockJournal?.stockJournalEntries
                ?.reduce((total, entry) => total + (entry?.amount || 0), 0)
                .toFixed(2)}
            </div>
          </div>
        </div>
        <div className="mt-2 border-t-2 border-gray-900 pt-2">
          <FareBreakdown
            dispatchDetail={dispatchDetail}
            totalFare={totalFare}
            variant="grid"
            showNetAdjustment
          />
        </div>
        {/* Delivery notes carry no financial entries, so the voucher amount is 0 —
            the words line must follow the freight-synced total fare instead. */}
        <div className="border-b-2 border-zinc-900 border-dotted italic">
          <span>Rupees </span> {numberToWords(totalFare)}
        </div>
      </div>
      <div className="x-footer h-12 mt-12 grid grid-cols-2">
        <div className="flex flex-row items-end gap-6">
          <div className="w-12 h-12 border-2 border-zinc-900"></div>
          <div className="h-full text-left flex flex-col justify-end">
            <div className=" text-sm   font-bold">Signature of Recipient</div>
          </div>
        </div>
        <div className="h-full text-xs text-right font-bold flex justify-end items-end">
          For {printData?.company?.name}
        </div>
      </div>
    </>
  )
}

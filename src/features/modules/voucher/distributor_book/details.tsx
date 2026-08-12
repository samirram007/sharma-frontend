import { useMemo } from 'react'
import type {
  DistributorBookDetailsList,
  DistributorBookDetailsSchema,
} from './data/schema'

import { date_format, toSentenceCase } from '@/utils/removeEmptyStrings'

type Props = {
  data?: DistributorBookDetailsList
}

const DistributorBookDetails = ({ data }: Props) => {
  const headerData = useMemo(
    () => data?.find((item) => item.voucherTypeId === 2001),
    [data],
  )
  return (
    <div>
      {headerData ? (
        <div className="mb-6 p-4 flex flex-col justify-center items-center gap-2 text-2xl  ">
          <p>
            <strong>A/c:</strong> {headerData.partyLedger?.name}
          </p>
          <p>
            <strong>Balance::</strong>{' '}
            {headerData.partyLedger?.currentBalance?.toFixed(2)}
          </p>
          {/* Add more fields as necessary */}
        </div>
      ) : (
        <p>No header data available.</p>
      )}
      <StockJournalPanel data={data} />
      {/* { <pre>{JSON.stringify(data, null, 2)}</pre>} */}
    </div>
  )
}

export default DistributorBookDetails

const StockJournalPanel = ({ data }: { data?: DistributorBookDetailsList }) => {
  return (
    <div>
      {data && data.length > 0 ? (
        data
          .filter((item) => item.voucherTypeId === 2001)
          .map((item: DistributorBookDetailsSchema, index) => (
            <div key={index} className="mb-4 p-4 border rounded">
              <div className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr_1fr] font-bold   p-2 border rounded  gap-1 bg-gray-50">
                <div>PARTICULARS</div>
                <div>Godown</div>
                <div>Batch</div>
                <div>Quantity</div>
                <div>Unit Price</div>
                <div className="text-right">Amount</div>
              </div>
              {item.stockJournal?.stockJournalEntries
                ?.filter((entry) => entry !== null && entry !== undefined)
                .map((entry, idx) => (
                  <div
                    key={idx}
                    className="  mb-2 p-2 border-b-2 rounded  gap-1"
                  >
                    <div className="">
                      {entry?.stockJournalGodownEntries
                        ?.filter(
                          (godownEntry) =>
                            godownEntry !== null && godownEntry !== undefined,
                        )
                        .map((godownEntry, gIdx) => (
                          <div
                            key={gIdx}
                            className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr_1fr] gap-2"
                          >
                            <p>{entry?.stockItem?.name}</p>
                            <p>{godownEntry?.godown?.name}</p>
                            <p>{godownEntry?.batchNo} </p>
                            <p>
                              {godownEntry?.billingQuantity}{' '}
                              {entry?.stockItem?.stockUnit?.code}{' '}
                            </p>
                            <p>
                              {entry?.rate} {entry?.stockItem?.stockUnit?.code}
                            </p>

                            <p className="text-right">
                              {(
                                (godownEntry?.billingQuantity ?? 0) *
                                (entry?.rate ?? 0)
                              ).toFixed(2)}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              <div className="grid grid-cols-[7fr_1fr] px-2 ">
                <div className="flex flex-row justify-end items-center gap-4 text-slate-600 dark:text-slate-300 text-sm">
                  {item?.voucherType?.name}:
                  <div>
                    {item?.voucherNo} [{date_format(item?.voucherDate)}]
                  </div>
                </div>
                <div className="text-right text-slate-600 dark:text-slate-300 text-sm">
                  {item?.amount?.toFixed(2)}
                </div>
              </div>
              <FreightPanel deliveryNote={item} data={data} />
            </div>
          ))
      ) : (
        <p>No data available.</p>
      )}
    </div>
  )
}

const FreightPanel = ({
  deliveryNote,
  data,
}: {
  deliveryNote: DistributorBookDetailsSchema
  data?: DistributorBookDetailsList
}) => {
  const deliveryNoteReferenceIds = deliveryNote.referencedBy
    ?.filter((ref) => ref?.type === 'freight')
    .map((ref) => ref?.voucherId)

  if (!deliveryNoteReferenceIds) return null

  const freightData = useMemo(() => {
    if (!data) return null
    const freightEntries = data.filter((item) =>
      deliveryNoteReferenceIds.includes(item.id ?? 0),
    )
    return freightEntries.length > 0 ? freightEntries : null
  }, [data, deliveryNote.id])

  if (!freightData) return null

  return (
    <>
      {freightData.map((freightItem, index) => (
        <div key={index} className="px-2">
          <div className=" grid grid-cols-[7fr_1fr]  ">
            <div className="flex flex-row justify-end items-center gap-4">
              <strong>
                {toSentenceCase(
                  freightItem?.module ?? freightItem?.voucherType?.name ?? '',
                )}
                :{' '}
              </strong>
              <div>
                {freightItem?.voucherNo} [
                {date_format(freightItem?.voucherDate)}]
              </div>
            </div>
            <div className="text-right">{freightItem.amount?.toFixed(2)}</div>
          </div>
          <FreightPaymentPanel freight={freightItem} data={data} />
        </div>
      ))}
    </>
  )
}

const FreightPaymentPanel = ({
  freight,
  data,
}: {
  freight: DistributorBookDetailsSchema
  data?: DistributorBookDetailsList
}) => {
  const freightReferenceIds = freight.referencedBy
    ?.filter((ref) => ref?.type === 'freight_payment')
    .map((ref) => ref?.voucherId)

  if (!freightReferenceIds) return null

  const freightPaymentData = useMemo(() => {
    if (!data) return null
    const paymentEntries = data.filter((item) =>
      freightReferenceIds.includes(item.id ?? 0),
    )
    return paymentEntries.length > 0 ? paymentEntries : null
  }, [data, freight.id])

  if (!freightPaymentData) return null

  return (
    <>
      {freightPaymentData.map((paymentItem, index) => (
        <div key={index} className="grid grid-cols-[7fr_1fr] ">
          <div className="flex flex-row justify-end items-center gap-4">
            <strong>
              {toSentenceCase(
                paymentItem?.module ?? paymentItem?.voucherType?.name ?? '',
              )}
              :{' '}
            </strong>
            <div>
              {paymentItem?.voucherNo} [{date_format(paymentItem?.voucherDate)}]
            </div>
          </div>
          <div className="text-right">{paymentItem.amount?.toFixed(2)}</div>
        </div>
      ))}
    </>
  )
}

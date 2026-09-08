import type { StockInHandVoucherWiseListSchema } from '../data/schema'
import { cn } from '@/lib/utils'
import { formatQty, formatQtyFixed } from '@/utils/format-num'
import { date_format } from '@/utils/removeEmptyStrings'
import { Link, useNavigate } from '@tanstack/react-router'
import FormulaBar from '../components/formula-bar'
import { useEffect, useState } from 'react'
import { VoucherTypeColorMapping } from '../../day_book/data/data'
import { lowerCase } from 'lodash'

const rowBgEven = 'bg-muted/30 dark:bg-secondary/20'
const rowBgOdd = 'bg-card dark:bg-secondary/10'
const headerFooterBg = 'bg-muted dark:bg-secondary/40'
const linkHover = 'hover:text-primary dark:hover:text-primary-foreground'
const noDataText = 'text-muted-foreground dark:text-slate-500'
const borderColor = 'border-border dark:border-border'

interface StockInHandVoucherWiseProps {
  data: StockInHandVoucherWiseListSchema
}

export default function StockInHandVoucherWise({
  data: StockInHandVoucherWiseListSchema,
}: StockInHandVoucherWiseProps) {
  return (
    <>
      {StockInHandVoucherWiseListSchema.length === 0 ? (
        <div className={cn('text-center py-12 text-sm', noDataText)}>
          No data available.
        </div>
      ) : (
        <ReportView data={StockInHandVoucherWiseListSchema} />
      )}
    </>
  )
}

const ReportView = ({ data }: { data: StockInHandVoucherWiseListSchema }) => {
  return (
    <div className="w-full h-[72vh] grid grid-rows-[auto_1fr]">
      <ReportHeader />
      <div className={cn('border-2 border-t-0 overflow-y-auto h-full', borderColor)}>
        {data.map((item, index) => (
          <div key={index} className="grid grid-rows-1 gap-0">
            {/* Item summary row */}
            <div
              className={cn(
                'grid grid-cols-[1fr_2fr] text-center font-semibold border-b border-border/50',
                index % 2 === 0 ? 'bg-muted/30 dark:bg-secondary/20' : 'bg-card dark:bg-secondary/10',
              )}
            >
              <div className="text-left pl-2 text-foreground">
                <Link
                  to={'/reports/stock_summary/stock-in-hand'}
                  className={cn('inline-block mr-2', linkHover)}
                >
                  {item.itemName}
                </Link>
              </div>
              <div className="grid grid-cols-4">
                <div className="grid grid-cols-2">
                  <div className="text-right pr-2 text-muted-foreground">
                    {item.openingQuantity === 0
                      ? '-'
                      : formatQty(
                          item.openingQuantity,
                          item.noOfDecimalPlaces,
                          item.unitCode,
                        )}
                  </div>
                  <div className="text-muted-foreground">
                    {item.openingAmount === 0
                      ? '-'
                      : item.openingAmount?.toFixed(2)}
                  </div>
                </div>

                <div className="grid grid-cols-2">
                  <div className="text-right pr-2 text-muted-foreground">
                    {item.inwardQuantity === 0
                      ? '-'
                      : formatQty(
                          item.inwardQuantity,
                          item.noOfDecimalPlaces,
                          item.unitCode,
                        )}
                  </div>
                  <div className="text-muted-foreground">
                    {item.inwardAmount === 0
                      ? '-'
                      : item.inwardAmount?.toFixed(2)}
                  </div>
                </div>

                <div className="grid grid-cols-2">
                  <div className="text-right pr-2 text-muted-foreground">
                    {item.outwardQuantity === 0
                      ? '-'
                      : formatQty(
                          item.outwardQuantity,
                          item.noOfDecimalPlaces,
                          item.unitCode,
                        )}
                  </div>
                  <div className="text-muted-foreground">
                    {item.outwardAmount === 0
                      ? '-'
                      : item.outwardAmount?.toFixed(2)}
                  </div>
                </div>

                <div className="grid grid-cols-2">
                  <div className="text-right pr-2">
                    <span className="font-semibold text-foreground">
                      {item.closingQuantity === 0
                        ? '-'
                        : formatQty(
                            item.closingQuantity,
                            item.noOfDecimalPlaces,
                            item.unitCode,
                          )}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">
                      {item.closingAmount === 0
                        ? '-'
                        : item.closingAmount?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Voucher detail rows */}
            <div>
              {item.voucherDetails.map((voucher, voucherIndex) => {
                return (
                  <div key={voucherIndex} className="text-sm">
                    <div
                      className={cn(
                        'grid grid-cols-[1fr_2fr] text-center hover:bg-accent/40 hover:text-accent-foreground font-semibold border-b border-border/30',
                        index % 2 === 0 ? rowBgEven : rowBgOdd,
                        !voucher.voucherId
                          ? 'font-semibold text-destructive'
                          : '',
                      )}
                    >
                      <div className="text-left pl-8 font-semibold">
                        <Link
                          to={
                            '/reports/stock_summary/stock-in-hand-godown-wise'
                          }
                          className={cn('inline-block mr-2', linkHover)}
                        >
                          {voucher.voucherId ? (
                            <>
                              <div className="grid grid-cols-[120px_120px_auto] mr-2">
                                <div
                                  className={cn(
                                    'font-mono px-2 h-4 shadow-md rounded-2xl text-xs text-center',
                                    VoucherTypeColorMapping.get(
                                      lowerCase(
                                        voucher.voucherType ?? '',
                                      ).replace(/\s+/g, '_'),
                                    ) ?? 'bg-muted text-muted-foreground',
                                  )}
                                >
                                  {voucher.voucherType} :
                                </div>
                                <div>
                                  <VoucherNavigationLink voucher={voucher} />
                                </div>
                                <div className="ml-2 text-xs text-muted-foreground">
                                  Dated: {date_format(voucher.voucherDate)}{' '}
                                </div>
                              </div>
                            </>
                          ) : (
                            <span className="text-muted-foreground">
                              {voucher.voucherNo}{' '}
                            </span>
                          )}
                        </Link>
                      </div>
                      <div className="grid grid-cols-4">
                        <div className="grid grid-cols-2">
                          <div className="text-right pr-2 text-muted-foreground">
                            {voucher.openingQuantity === 0
                              ? '-'
                              : formatQty(
                                  voucher.openingQuantity,
                                  item.noOfDecimalPlaces,
                                  item.unitCode,
                                )}
                          </div>
                          <div className="text-muted-foreground">
                            {voucher.openingAmount === 0
                              ? '-'
                              : voucher.openingAmount?.toFixed(2)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2">
                          <div className="text-right pr-2 text-muted-foreground">
                            {voucher.inwardQuantity === 0
                              ? '-'
                              : formatQty(
                                  voucher.inwardQuantity,
                                  item.noOfDecimalPlaces,
                                  item.unitCode,
                                )}
                          </div>
                          <div className="text-muted-foreground">
                            {voucher.inwardAmount === 0
                              ? '-'
                              : voucher.inwardAmount?.toFixed(2)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2">
                          <div className="text-right pr-2 text-muted-foreground">
                            {voucher.outwardQuantity === 0
                              ? '-'
                              : formatQty(
                                  voucher.outwardQuantity,
                                  item.noOfDecimalPlaces,
                                  item.unitCode,
                                )}
                          </div>
                          <div className="text-muted-foreground">
                            {voucher.outwardAmount === 0
                              ? '-'
                              : voucher.outwardAmount?.toFixed(2)}
                          </div>
                        </div>
                        <div className="grid grid-cols-2">
                          <div className="text-right pr-2">
                            <span className="font-semibold text-foreground">
                              {voucher.closingQuantity === 0
                                ? '-'
                                : formatQty(
                                    voucher.closingQuantity,
                                    item.noOfDecimalPlaces,
                                    item.unitCode,
                                  )}
                            </span>
                          </div>
                          <div>
                            <span className="font-semibold text-foreground">
                              {voucher.closingAmount === 0
                                ? '-'
                                : voucher.closingAmount?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <ReportFooter data={data} />
    </div>
  )
}

const VoucherNavigationLink = ({ voucher }: { voucher: any }) => {
  const navigate = useNavigate()

  const handleOnclick = () => {
    const voucherType = voucher?.voucherType?.name
      .toLowerCase()
      .replaceAll(' ', '_')
    navigate({
      to: `/transactions/vouchers/${voucherType}/${voucher.id}`,
    })
  }

  return (
    <div
      onClick={handleOnclick}
      className={cn(
        'cursor-pointer hover:underline',
        voucher.voucherId ? 'text-foreground' : 'text-muted-foreground',
      )}
    >
      {voucher.voucherNo}
    </div>
  )
}

const ReportHeader = () => {
  return (
    <div
      className={cn(
        'grid grid-cols-[1fr_2fr] border border-border text-center font-bold',
        headerFooterBg,
      )}
    >
      <div
        className={cn(
          'text-accent-foreground border-2 text-left pl-2 font-stretch-ultra-expanded h-full flex items-center',
        )}
      >
        PARTICULARS
      </div>
      <div className={cn('grid grid-cols-4 border-2 border-l-0', borderColor)}>
        <div>
          <div className="text-accent-foreground border-b-2 border-l-2">
            Opening
          </div>
          <div className="grid grid-cols-2">
            <div className="border-l-2">Qty</div>
            <div className="border-l-2">Val</div>
          </div>
        </div>
        <div>
          <div className="text-accent-foreground border-b-2 border-l-2">
            Inward
          </div>
          <div className="grid grid-cols-2">
            <div className="border-l-2">Qty</div>
            <div className="border-l-2">Val</div>
          </div>
        </div>

        <div>
          <div className="text-accent-foreground border-b-2 border-l-2">
            Outward
          </div>
          <div className="grid grid-cols-2">
            <div className="border-l-2">Qty</div>
            <div className="border-l-2">Val</div>
          </div>
        </div>
        <div>
          <div className="text-accent-foreground border-b-2 border-l-2">
            Closing
          </div>
          <div className="grid grid-cols-2">
            <div className="border-l-2">Qty</div>
            <div className="border-l-2">Val</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ReportFooter = ({ data }: { data: StockInHandVoucherWiseListSchema }) => {
  const [unitCode, setUnitCode] = useState<string>('')
  const [noOfDecimalPlaces, setNoOfDecimalPlaces] = useState<number>(0)

  const total = {
    openingQuantity: 0,
    openingAmount: 0,
    inwardQuantity: 0,
    inwardAmount: 0,
    outwardQuantity: 0,
    outwardAmount: 0,
    closingQuantity: 0,
    closingAmount: 0,
    itemCount: 0,
  }

  data.forEach((item) => {
    total.openingQuantity += item.openingQuantity ?? 0
    total.openingAmount += item.openingAmount ?? 0
    total.inwardQuantity += item.inwardQuantity ?? 0
    total.inwardAmount += item.inwardAmount ?? 0
    total.outwardQuantity += item.outwardQuantity ?? 0
    total.outwardAmount += item.outwardAmount ?? 0
    total.closingQuantity += item.closingQuantity ?? 0
    total.closingAmount += item.closingAmount ?? 0
    total.itemCount += 1
  })

  useEffect(() => {
    const uniqueUnitCode = new Set<string>()
    const noOfDecimalPlaces = new Set<number>()
    data.forEach((item) => {
      if (item.unitCode) {
        uniqueUnitCode.add(item.unitCode)
        noOfDecimalPlaces.add(item.noOfDecimalPlaces)
      }
    })
    const uniqueUnitCodeArray = Array.from(uniqueUnitCode)
    if (uniqueUnitCodeArray.length === 1) {
      setUnitCode('' + uniqueUnitCodeArray.join(', '))
      setNoOfDecimalPlaces(Array.from(noOfDecimalPlaces)[0])
    } else {
      setUnitCode('~')
      setNoOfDecimalPlaces(2)
    }
  }, [])

  return (
    <>
      <div
        className={cn(
          'grid grid-cols-[1fr_2fr] border border-border text-center font-bold',
          headerFooterBg,
        )}
      >
        <div
          className={cn(
            'text-accent-foreground border-2 text-right flex items-center pr-2 h-full justify-between',
          )}
        >
          <div className="pl-4 italic text-sm font-mono text-muted-foreground">
            count: {data.length}
          </div>
          <div className="font-semibold text-foreground">Total:</div>
        </div>
        <div className={cn('grid grid-cols-4 border-b-2 border-l-0', borderColor)}>
          <div>
            <div className="grid grid-cols-2">
              <div className="border-l-2 text-right pr-2 text-muted-foreground">
                {total.openingQuantity === 0
                  ? '-'
                  : formatQty(
                      total.openingQuantity,
                      noOfDecimalPlaces,
                      unitCode,
                    )}{' '}
              </div>
              <div className="border-l-2 text-muted-foreground">
                {total.openingAmount === 0
                  ? '-'
                  : formatQtyFixed(total.openingAmount)}
              </div>
            </div>
          </div>
          <div>
            <div className="grid grid-cols-2">
              <div className="border-l-2 text-right pr-2 text-muted-foreground">
                {total.inwardQuantity === 0
                  ? '-'
                  : formatQty(
                      total.inwardQuantity,
                      noOfDecimalPlaces,
                      unitCode,
                    )}
              </div>
              <div className="border-l-2 text-muted-foreground">
                {total.inwardAmount === 0
                  ? '-'
                  : formatQtyFixed(total.inwardAmount)}
              </div>
            </div>
          </div>

          <div>
            <div className="grid grid-cols-2">
              <div className="border-l-2 text-right pr-2 text-muted-foreground">
                {total.outwardQuantity === 0
                  ? '-'
                  : formatQty(
                      total.outwardQuantity,
                      noOfDecimalPlaces,
                      unitCode,
                    )}
              </div>
              <div className="border-l-2 text-muted-foreground">
                {total.outwardAmount === 0
                  ? '-'
                  : formatQtyFixed(total.outwardAmount)}
              </div>
            </div>
          </div>
          <div>
            <div className="grid grid-cols-2">
              <div className="border-l-2 text-right pr-2">
                <span className="font-semibold text-foreground">
                  {total.closingQuantity === 0
                    ? '-'
                    : formatQty(
                        total.closingQuantity,
                        noOfDecimalPlaces,
                        unitCode,
                      )}
                </span>
              </div>
              <div>
                <span className="font-semibold text-foreground">
                  {total.closingAmount === 0
                    ? '-'
                    : formatQtyFixed(total.closingAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <FormulaBar
        openingQuantity={total.openingQuantity}
        inwardQuantity={total.inwardQuantity}
        outwardQuantity={total.outwardQuantity}
        closingQuantity={total.closingQuantity}
        noOfDecimalPlaces={noOfDecimalPlaces}
        unitCode={unitCode}
      />
    </>
  )
}

import { useMemo } from 'react'
import { columns } from './columns'
import { GridTable } from './grid-table'
import type { FreightVoucherListSchema } from '../data/schema'

import { Main } from '@/layouts/components/main'

interface FreightTransporterWiseProps {
  data: FreightVoucherListSchema
}

export default function FreightTransporterWise({
  data: freightVoucherListSchema,
}: FreightTransporterWiseProps) {
  // add transporterwise filter in toolbar and also add transporter name in columns
  // voucherReferences[0].referenceVoucher?.voucherDispatchDetail?.carrierName
  const prepareData = useMemo(() => {
    return freightVoucherListSchema.map((item) => ({
      ...item,
      transporterName:
        item?.voucherReferences?.[0]?.referenceVoucher?.voucherDispatchDetail
          ?.carrierName || 'Unknown',
      vehicleNumber:
        item?.voucherReferences?.[0]?.referenceVoucher?.voucherDispatchDetail
          ?.motorVehicleNo || 'Unknown',
    }))
  }, [freightVoucherListSchema])
  return (
    <>
      <Main className="min-w-full">
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <GridTable data={prepareData} columns={columns} pagination={false} />
        </div>
      </Main>
    </>
  )
}

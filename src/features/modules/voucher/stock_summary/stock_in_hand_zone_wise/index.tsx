







import type { StockInHandZoneWiseListSchema, StockInHandZoneWiseSchema } from '../data/schema'


import { GridTable } from './grid-table'
import { columns } from './columns'

// Ensure columns are defined for StockInHandZoneWiseListSchema type
import type { ColumnDef } from '@tanstack/react-table'




interface StockInHandZoneWiseProps {
    data: StockInHandZoneWiseListSchema
}

export default function StockInHandZoneWiseComponent({ data: StockInHandZoneWiseListSchema }: StockInHandZoneWiseProps) {
    return (

        <>

            {StockInHandZoneWiseListSchema.length === 0 ? (
                <div className='text-center text-gray-500'>No data available.</div>
            ) : (
                <div className='w-full min-h-full  grid grid-rows-[auto_1fr]'>

                    <GridTable
                        columns={columns as ColumnDef<StockInHandZoneWiseSchema>[]}
                        data={StockInHandZoneWiseListSchema}
                        pagination={false} />

                </div>
            )}

        </>


    )
}







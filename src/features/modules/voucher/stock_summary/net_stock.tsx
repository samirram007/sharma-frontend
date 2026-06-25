
import { Main } from '@/layouts/components/main'





import { columns } from './stock_in_hand/columns'


import { GridTable } from './components/grid-table'
import { stockSummaryListSchema, type StockSummaryList } from './data/schema'



interface StockSummaryProps {
    data: StockSummaryList
}

export default function NetStock({ data }: StockSummaryProps) {


    return (


        <Main className='min-w-full'>
            <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
                <div>
                    <h2 className='text-2xl font-bold tracking-tight'>Stock in hand</h2>
                    <p className='text-muted-foreground'>
                        Check stock summary.
                    </p>
                </div>
                {/* <PrimaryButtons /> */}
            </div>
            <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
                <GridTable
                    data={stockSummaryListSchema.parse(data ?? [])}
                    columns={columns} />
            </div>
        </Main>

    )
}

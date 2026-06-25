
import { Main } from '@/layouts/components/main'





import { columns } from './components/stock_category-columns'

import { StockCategoryDialogs } from './components/stock_category-dialogs'
import { StockCategoryPrimaryButtons } from './components/stock_category-primary-buttons'
import { StockCategoryTable } from './components/stock_category-table'
import StockCategoryProvider from './contexts/stock_category-context'
import { stockCategoryListSchema, type StockCategoryList } from './data/schema'



interface StockCategoryProps {
    data: StockCategoryList
}

export default function StockCategory({ data }: StockCategoryProps) {


    return (
        <StockCategoryProvider>

            <Main className='min-w-full'>
                <div className='mb-4 flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm dark:border-white/[0.07] dark:bg-white/5'>
                    <div className='space-y-1'>
<h2 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100'>Stock Category List</h2>
                        <p className='text-slate-600 dark:text-slate-400'>
                            Manage your stock categories here.
                        </p>
                    </div>
                    <StockCategoryPrimaryButtons />
                </div>
                <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
                    <StockCategoryTable
                        data={stockCategoryListSchema.parse(data ?? [])}
                        columns={columns} />
                </div>
            </Main>

            <StockCategoryDialogs />
        </StockCategoryProvider>
    )
}

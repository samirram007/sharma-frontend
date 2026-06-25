
import { Main } from '@/layouts/components/main'





import { columns } from './components/unique_quantity_code-columns'

import { UniqueQuantityCodePrimaryButtons } from './components/unique_quantity_code-buttons'
import { UniqueQuantityCodeDialogs } from './components/unique_quantity_code-dialogs'
import { UniqueQuantityCodeTable } from './components/unique_quantity_code-table'
import UniqueQuantityCodeProvider from './contexts/unique_quantity_code-context'
import { uniqueQuantityCodeListSchema, type UniqueQuantityCodeList } from './data/schema'



interface UniqueQuantityCodeProps {
    data: UniqueQuantityCodeList
}

export default function UniqueQuantityCode({ data }: UniqueQuantityCodeProps) {
    console.log(data, 'Unique Quantity Code props data');

    return (
        <UniqueQuantityCodeProvider>

            <Main>
                <div className='mb-4 flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm dark:border-white/[0.07] dark:bg-white/5'>
                    <div className='space-y-1'>
<h2 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100'>Unique Quantity Code List</h2>
                        <p className='text-slate-600 dark:text-slate-400'>
                            Manage your stock categories here.
                        </p>
                    </div>
                    <UniqueQuantityCodePrimaryButtons />
                </div>
                <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
                    <UniqueQuantityCodeTable
                        data={uniqueQuantityCodeListSchema.parse(data ?? [])}
                        columns={columns} />
                </div>
            </Main>

            <UniqueQuantityCodeDialogs />
        </UniqueQuantityCodeProvider>
    )
}

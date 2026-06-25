
import { Main } from '@/layouts/components/main'




import { VoucherTypesPrimaryButtons } from './components/voucher_types-primary-buttons'

import { columns } from './components/voucher_types-columns'
import { VoucherTypesDialogs } from './components/voucher_types-dialogs'
import { VoucherTypesTable } from './components/voucher_types-table'
import { voucherTypeListSchema, type VoucherTypeList } from './data/schema'



interface VoucherTypeProps {
    data: VoucherTypeList
}

export default function VoucherType({ data }: VoucherTypeProps) {


    return (
        <>
            <Main className='min-w-full'>

                <div className='mb-4 flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm dark:border-white/[0.07] dark:bg-white/5'>
                    <div className='space-y-1'>
<h2 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100'>Voucher Type List</h2>
                        <p className='text-slate-600 dark:text-slate-400'>
                            Manage your voucher types here.
                        </p>
                    </div>
                    <VoucherTypesPrimaryButtons />
                </div>
                <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
                    <VoucherTypesTable
                        data={voucherTypeListSchema.parse(data ?? [])}
                        columns={columns} />
                </div>
            </Main>

            <VoucherTypesDialogs />
        </>
    )
}

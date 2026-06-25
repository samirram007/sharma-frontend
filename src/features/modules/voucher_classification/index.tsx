
import { Main } from '@/layouts/components/main'





import { columns } from './components/voucher_classifications-columns'
import { VoucherClassificationsDialogs } from './components/voucher_classifications-dialogs'
import { VoucherClassificationsPrimaryButtons } from './components/voucher_classifications-primary-buttons'
import { VoucherClassificationsTable } from './components/voucher_classifications-table'
import VoucherClassificationProvider from './contexts/voucher-classification-context'
import { voucherClassificationListSchema, type VoucherClassificationList } from './data/schema'



interface VoucherClassificationProps {
    data: VoucherClassificationList
}

export default function VoucherClassification({ data }: VoucherClassificationProps) {


    return (
        <VoucherClassificationProvider>

            <Main>
                <div className='mb-4 flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm dark:border-white/[0.07] dark:bg-white/5'>
                    <div className='space-y-1'>
<h2 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100'>Voucher Classification List</h2>
                        <p className='text-slate-600 dark:text-slate-400'>
                            Manage your voucher classifications here.
                        </p>
                    </div>
                    <VoucherClassificationsPrimaryButtons />
                </div>
                <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
                    <VoucherClassificationsTable
                        data={voucherClassificationListSchema.parse(data ?? [])}
                        columns={columns} />
                </div>
            </Main>

            <VoucherClassificationsDialogs />
        </VoucherClassificationProvider>
    )
}

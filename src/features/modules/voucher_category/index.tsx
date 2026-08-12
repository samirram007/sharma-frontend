import { Main } from '@/layouts/components/main'
import { columns } from './components/voucher_categories-columns'

import { VoucherCategorysDialogs } from './components/voucher_categories-dialogs'
import { VoucherCategorysPrimaryButtons } from './components/voucher_categories-primary-buttons'
import { VoucherCategorysTable } from './components/voucher_categories-table'
import VoucherCategoryProvider from './contexts/voucher-categories-context'
import {
  voucherCategoryListSchema,
  type VoucherCategoryList,
} from './data/schema'

// Import the correct type for voucherCategoryListSchema

interface VoucherCategoryProps {
  data: VoucherCategoryList
}

export default function VoucherCategory({ data }: VoucherCategoryProps) {
  return (
    <VoucherCategoryProvider>
      <Main className="min-w-full">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm dark:border-white/[0.07] dark:bg-white/5">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Voucher Category List
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your voucher category here.
            </p>
          </div>
          <VoucherCategorysPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <VoucherCategorysTable
            data={voucherCategoryListSchema.parse(data ?? [])}
            columns={columns}
          />
        </div>
      </Main>

      <VoucherCategorysDialogs />
    </VoucherCategoryProvider>
  )
}

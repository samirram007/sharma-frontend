import { Main } from '@/layouts/components/main'
import { columns } from './components/columns'

import { Dialogs } from './components/dialogs'
import { GridTable } from './components/grid-table'
import { PrimaryButtons } from './components/primary-buttons'
import { companyListSchema, type CompanyList } from './data/schema'

// Import the correct type for companyListSchema

interface CompanyProps {
  data: CompanyList
}

export default function Company({ data }: CompanyProps) {
  console.log(data)

  return (
    <>
      <Main className="min-w-full">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm dark:border-white/[0.07] dark:bg-white/5">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Company List
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Manage your Company here.
            </p>
          </div>
          <PrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
          <GridTable
            data={companyListSchema.parse(data ?? [])}
            columns={columns}
          />
        </div>
      </Main>

      <Dialogs />
    </>
  )
}

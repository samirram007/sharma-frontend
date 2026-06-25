
import { Main } from '@/layouts/components/main'
import { columns } from './components/columns'





import { lowerCase } from '../../../utils/removeEmptyStrings'
import { Dialogs } from './components/dialogs'
import { GridTable } from './components/grid-table'
import { PrimaryButtons } from './components/primary-buttons'
import DesignationProvider from './contexts/designation-context'
import { designationListSchema, type DesignationList } from './data/schema'


// Import the correct type for designationListSchema



interface DesignationProps {
  data: DesignationList
}

export default function Designation({ data }: DesignationProps) {
  const moduleName = "Designation"

  return (
    <DesignationProvider>

      <Main className='min-w-full'>

        <div className='mb-4 flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm dark:border-white/[0.07] dark:bg-white/5'>
          <div className='space-y-1'>
<h2 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100'>{moduleName} List</h2>
            <p className='text-slate-600 dark:text-slate-400'>
              Manage your {lowerCase(moduleName)}  here.
            </p>
          </div>
          <PrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <GridTable
            data={designationListSchema.parse(data ?? [])}
            columns={columns} />
        </div>
      </Main>

      <Dialogs />
    </DesignationProvider>
  )
}

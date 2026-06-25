
import { Main } from '@/layouts/components/main'
import { columns } from './components/columns'





import { Dialogs } from './components/dialogs'
import { GridTable } from './components/grid-table'
import { PrimaryButtons } from './components/primary-buttons'
import { userListSchema, type UserList } from './data/schema'
import type { RoleList } from '../role/data/schema'


// Import the correct type for userListSchema



interface UserProps {
  data: UserList
  roles: RoleList
}

export default function User({ data, roles }: UserProps) {

  return (
    <>

      <Main className='min-w-full'>
        <div className='mb-4 flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm dark:border-white/[0.07] dark:bg-white/5'>
          <div className='space-y-1'>
<h2 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100'>User List</h2>
            <p className='text-slate-600 dark:text-slate-400'>
              Manage your User  here.
            </p>
          </div>
          <PrimaryButtons />
        </div>
        <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <GridTable
            data={userListSchema.parse(data ?? [])}
            columns={columns(roles)} />
        </div>
      </Main>

      <Dialogs />
    </>
  )
}

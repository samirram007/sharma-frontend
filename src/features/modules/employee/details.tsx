import { EntryPageHeader } from '@/components/entry-page-header'
import { Main } from '@/layouts/components/main'

import { usePayroll } from '@/features/masters/payroll/context/payroll-context'
import { UserRound } from 'lucide-react'
import { useEffect } from 'react'
import { ActionPages } from './components/action-page'
import { type Employee } from './data/schema'

interface EmployeeProps {
  data?: Employee
}

export default function EmployeeDetails(props: EmployeeProps) {
  const keyName = 'employee'
  const { setSideBarOpen } = usePayroll()
  const { data } = props
  const isEdit = !!data

  useEffect(() => {
    setSideBarOpen && setSideBarOpen(true)
  }, [])

  return (
    <Main className="min-w-full">
      <div className="flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
        <EntryPageHeader
          backTo="/masters/payroll/employee"
          backLabel="Back to employee list"
          isEdit={isEdit}
          name={data?.name}
          createTitle="Add New Employee"
          subtitle={
            isEdit
              ? `Manage profile, payroll and account details for ${data.name}.`
              : 'Fill in the details below to add an employee to the payroll.'
          }
          avatar={<UserRound className="h-5 w-5 text-muted-foreground" />}
          status={isEdit ? data.status : undefined}
        />

        {/* Form */}
        <div className="mx-auto w-full max-w-5xl pb-8">
          <ActionPages
            currentRow={data}
            key={`${keyName}-${data?.id ?? 'add'}`}
          />
        </div>
      </div>
    </Main>
  )
}

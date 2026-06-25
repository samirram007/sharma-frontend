
import { Button } from '@/components/ui/button'
import { Route as EmployeeDetailRoute } from '@/routes/_protected/masters/payroll/_layout/employee/_layout/$id'

import { IconUserPlus } from '@tabler/icons-react'
import { Link } from '@tanstack/react-router'

export function PrimaryButtons() {
  // const { setOpen } = useEmployee()
  return (
    <div className='flex gap-2'>
      <Button asChild className="space-x-1">
        <Link to={EmployeeDetailRoute.to} params={{ id: 'new' }}>
          <span>Add Employee</span>
          <IconUserPlus size={18} />
        </Link>
      </Button>
      {/* <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add Employee</span> <IconUserPlus size={18} />
      </Button> */}
    </div >
  )
}

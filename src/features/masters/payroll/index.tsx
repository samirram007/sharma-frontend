import {
  IconBriefcase,
  IconBuilding,
  IconClock,
  IconMedal,
  IconUser,
  IconUsers,
} from '@tabler/icons-react'
import { Outlet } from '@tanstack/react-router'

import SidebarInner from '@/features/global/components/sidebar-inner'
import { Main } from '@/layouts/components/main'
import { usePayroll } from './context/payroll-context'

export default function Payroll() {
  const { sideBarOpen } = usePayroll()
  return (
    <>
      <Main fixed>
        <div className="flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12">
          {sideBarOpen && (
            <SidebarInner
              title="Payroll"
              description="Manage employees, departments, designations, grades and shifts."
              items={sidebarNavItems}
            />
          )}
          <div className="flex min-w-0 w-full overflow-y-auto p-1">
            <Outlet />
          </div>
        </div>
      </Main>
    </>
  )
}
// Employee Master

// Department
// Designation
// Grade

// Bank_Master

// Salary

// Leave Types
//  Holiday List
//  Shifts
const sidebarNavItems = [
  {
    title: 'Employee',
    description:
      'Manage employee profiles, joining details, and assigned designations.',
    visible: true,
    icon: <IconUser size={22} stroke={1.9} />,
    href: '/masters/payroll/employee',
  },
  {
    title: 'Employee Group',
    description:
      'Cluster employees by shared policies, pay structure, or employment type.',
    visible: true,
    icon: <IconUsers size={22} stroke={1.9} />,
    href: '/masters/payroll/employee_group',
  },
  {
    title: 'Department',
    description:
      'Define organisational departments and their reporting structure.',
    visible: true,
    icon: <IconBuilding size={22} stroke={1.9} />,
    href: '/masters/payroll/department',
  },
  {
    title: 'Designation',
    description: 'Set up job titles and roles that are assigned to employees.',
    visible: true,
    icon: <IconBriefcase size={22} stroke={1.9} />,
    href: '/masters/payroll/designation',
  },
  {
    title: 'Grade',
    description:
      'Configure pay grades and seniority levels used in payroll calculation.',
    visible: true,
    icon: <IconMedal size={22} stroke={1.9} />,
    href: '/masters/payroll/grade',
  },
  {
    title: 'Shift',
    description: 'Set work shift timings and attendance rotation patterns.',
    visible: true,
    icon: <IconClock size={22} stroke={1.9} />,
    href: '/masters/payroll/shift',
  },
  {
    title: 'Bank Master',
    visible: false,
    icon: <IconUser size={22} stroke={1.9} />,
    href: '/masters/payroll/bank_master',
  },
  {
    title: 'Salary',
    visible: false,
    icon: <IconUser size={22} stroke={1.9} />,
    href: '/masters/payroll/salary',
  },
  {
    title: 'Leave Types',
    visible: false,
    icon: <IconUser size={22} stroke={1.9} />,
    href: '/masters/payroll/leave_type',
  },
  {
    title: 'Holiday List',
    visible: false,
    icon: <IconUser size={22} stroke={1.9} />,
    href: '/masters/payroll/holiday_list',
  },
]

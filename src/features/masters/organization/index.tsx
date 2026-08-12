import {
  IconBuilding,
  IconBuildingCommunity,
  IconCalendarStats,
  IconCurrencyRupee,
  IconMap,
  IconMapPin,
} from '@tabler/icons-react'
import { Outlet } from '@tanstack/react-router'

import SidebarInner from '@/features/global/components/sidebar-inner'
import { Main } from '@/layouts/components/main'
import { useOrganization } from './context/organization-context'

export default function Organization() {
  const { sideBarOpen } = useOrganization()
  return (
    <>
      <Main fixed>
        <div className="flex flex-1 flex-col space-y-3 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12">
          {sideBarOpen && (
            <SidebarInner
              title="Organization"
              description="Manage company profile, branches, fiscal years, currencies, countries and states."
              items={sidebarNavItems}
            />
          )}
          <div className="flex min-w-0 w-full overflow-y-hidden overflow-x-hidden p-0 sm:p-1">
            <Outlet />
          </div>
        </div>
      </Main>
    </>
  )
}

const sidebarNavItems = [
  {
    title: 'Company',
    visible: true,
    description: 'Core company profile and registration details.',
    icon: <IconBuilding size={22} stroke={1.9} />,
    href: '/masters/organization/company',
  },
  {
    title: 'Branch',
    visible: true,
    description: 'Manage branch offices and operating locations.',
    icon: <IconBuildingCommunity size={22} stroke={1.9} />,
    href: '/masters/organization/branch',
  },
  {
    title: 'Fiscal Year',
    visible: true,
    description: 'Define accounting periods and reporting cycles.',
    icon: <IconCalendarStats size={22} stroke={1.9} />,
    href: '/masters/organization/fiscal_year',
  },

  {
    title: 'Currency',
    visible: true,
    description: 'Set supported currencies and default monetary rules.',
    href: '/masters/organization/currency',
    icon: <IconCurrencyRupee size={22} stroke={1.9} />,
  },
  {
    title: 'Country',
    visible: true,
    description: 'Maintain country records for geographic setup.',
    href: '/masters/organization/country',
    icon: <IconMap size={22} stroke={1.9} />,
  },
  {
    title: 'State',
    visible: true,
    description: 'Configure states and regional jurisdiction data.',
    href: '/masters/organization/state',
    icon: <IconMapPin size={22} stroke={1.9} />,
  },
]

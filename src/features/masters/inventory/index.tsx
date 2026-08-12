import {
  IconBarcode,
  IconBox,
  IconBuildingWarehouse,
  IconPackage,
  IconRuler2,
  IconStack2,
  IconTag,
} from '@tabler/icons-react'
import { Outlet } from '@tanstack/react-router'

import SidebarInner from '@/features/global/components/sidebar-inner'
import { Main } from '@/layouts/components/main'
import { useInventory } from './context/inventory-context'

export default function Inventory() {
  const { sideBarOpen } = useInventory()
  return (
    <>
      <Main fixed>
        <div className="flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12">
          {sideBarOpen && (
            <SidebarInner
              title="Inventory"
              description="Manage stock items, groups, units, godowns, and storage configuration."
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

const sidebarNavItems = [
  {
    title: 'Stock Item',
    description:
      'Register individual goods, materials, and finished products for tracking.',
    visible: true,
    icon: <IconPackage size={22} stroke={1.9} />,
    href: '/masters/inventory/stock_item',
  },
  {
    title: 'Stock Group',
    description:
      'Organise stock items into manageable product families and groups.',
    visible: true,
    icon: <IconStack2 size={22} stroke={1.9} />,
    href: '/masters/inventory/stock_group',
  },
  {
    title: 'Stock Category',
    description:
      'Apply category labels to classify inventory for reporting and filtering.',
    visible: true,
    icon: <IconTag size={22} stroke={1.9} />,
    href: '/masters/inventory/stock_category',
  },
  {
    title: 'Stock Unit',
    description:
      'Define units of measurement applied across stock items and transactions.',
    visible: true,
    icon: <IconRuler2 size={22} stroke={1.9} />,
    href: '/masters/inventory/stock_unit',
  },
  {
    title: 'Unique Quantity Code',
    description:
      'Map standard UQC codes to units for statutory compliance reporting.',
    visible: true,
    icon: <IconBarcode size={22} stroke={1.9} />,
    href: '/masters/inventory/unique_quantity_code',
  },
  {
    title: 'Godown',
    description: 'Manage physical warehouse and godown location records.',
    visible: true,
    icon: <IconBuildingWarehouse size={22} stroke={1.9} />,
    href: '/masters/inventory/godown',
  },
  {
    title: 'Storage Unit',
    description: 'Define bins, racks, and sub-locations within a godown.',
    visible: true,
    icon: <IconBox size={22} stroke={1.9} />,
    href: '/masters/inventory/storage_unit',
  },
]

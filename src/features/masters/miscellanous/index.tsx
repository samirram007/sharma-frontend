import {

    IconBox,
    IconBuildingWarehouse,
    IconRuler2,
} from '@tabler/icons-react'
import { Outlet } from '@tanstack/react-router'

import SidebarInner from '@/features/global/components/sidebar-inner'
import { Main } from '@/layouts/components/main'
import { useMiscellanous } from './context/miscellanous-context'


export default function Miscellaneous() {
    const { sideBarOpen } = useMiscellanous()
    return (
        <>
            <Main fixed>
                <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
                    {sideBarOpen && (
                        <SidebarInner
                            title='Miscellaneous'
                            description='Manage miscellaneous settings and configurations.'
                            items={sidebarNavItems}
                        />
                    )}
                    <div className='flex min-w-0 w-full overflow-y-auto p-1'>
                        <Outlet />
                    </div>
                </div>
            </Main>
        </>
    )
}

const sidebarNavItems = [
    {
        title: 'Delivery Places',
        description: 'Define and manage delivery places for efficient logistics and transportation.',
        visible: true,
        icon: <IconBuildingWarehouse size={22} stroke={1.9} />,
        href: '/masters/miscellaneous/delivery_places',
    },
    {
        title: 'Delivery Routes',
        description: 'Plan and manage delivery routes for efficient logistics and transportation.',
        visible: true,
        icon: <IconRuler2 size={22} stroke={1.9} />,
        href: '/masters/miscellaneous/delivery_routes',
    },
    {
        title: 'Delivery Vehicles',
        description: 'Define and manage the fleet of vehicles used for deliveries, including their specifications and maintenance schedules.',
        visible: true,
        icon: <IconBox size={22} stroke={1.9} />,
        href: '/masters/miscellaneous/delivery_vehicles',
    },
]

import {
    IconUser
} from '@tabler/icons-react'
import { Outlet } from '@tanstack/react-router'

import SidebarInner from '@/features/global/components/sidebar-inner'
import { Main } from '@/layouts/components/main'
import { useParty } from './context/party-context'

export default function Party() {
    const { sideBarOpen } = useParty()
    return (
        <>
            <Main fixed>
                <div className='flex flex-1 flex-col space-y-3 overflow-hidden md:space-y-2 xl:flex-row lg:space-y-0'>
                    {sideBarOpen && (
                        <SidebarInner
                            title='Party'
                            description='Manage distributors, suppliers, and transporters with contacts and ledger links.'
                            items={sidebarNavItems}
                        />
                    )}
                    <div className='flex min-w-0 w-full h-full p-0 sm:p-1 xl:px-6'>
                        <Outlet />
                    </div>
                </div>
            </Main>
        </>
    )
}

const sidebarNavItems = [
    {
        title: 'Distributor',
        visible: true,
        description: 'Maintain distributor records, contacts, and linked ledger setup.',
        icon: <IconUser size={18} />,
        href: '/masters/party/distributor',
    },
    {
        title: 'Supplier',
        visible: true,
        description: 'Manage supplier profiles, tax details, and address information.',
        icon: <IconUser size={18} />,
        href: '/masters/party/supplier',
    },
    {
        title: 'Transporter',
        visible: true,
        description: 'Configure transporter contacts, licensing, and movement details.',
        icon: <IconUser size={18} />,
        href: '/masters/party/transporter',
    },

]

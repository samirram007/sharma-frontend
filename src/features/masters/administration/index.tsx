import { Outlet } from '@tanstack/react-router'

import {
    IconApps,
    IconMenu2,
    IconPuzzle,
    IconShield,
    IconShieldCheck,
    IconUserCog,
} from '@tabler/icons-react'
import SidebarInner from '@/features/global/components/sidebar-inner'
import { Main } from '@/layouts/components/main'
import { useAdministration } from './context/administration-context'

const sidebarNavItems = [
    {
        title: 'User',
        description: 'Create and manage system user accounts and login credentials.',
        href: '/administration/user',
        visible: true,
        icon: <IconUserCog size={22} stroke={1.9} />,
    },
    {
        title: 'Roles',
        description: 'Define role profiles that bundle permissions for user assignment.',
        href: '/administration/role',
        visible: true,
        icon: <IconShield size={22} stroke={1.9} />,
    },
    {
        title: 'Roles & Permissions',
        description: 'Assign granular access permissions to roles across all modules.',
        href: '/administration/permission',
        visible: true,
        icon: <IconShieldCheck size={22} stroke={1.9} />,
    },
    {
        title: 'App Module',
        description: 'Register and configure application modules available in the system.',
        href: '/administration/app_module',
        visible: true,
        icon: <IconApps size={22} stroke={1.9} />,
    },
    {
        title: 'App Features',
        description: 'Define feature flags and sub-capabilities available per module.',
        href: '/administration/app_module_feature',
        visible: true,
        icon: <IconPuzzle size={22} stroke={1.9} />,
    },
    {
        title: 'Menu Manager',
        description: 'Control which menu items each role can see in the sidebar.',
        href: '/administration/menu_manager',
        visible: true,
        icon: <IconMenu2 size={22} stroke={1.9} />,
    },
]
export default function Administration() {

    const { sideBarOpen } = useAdministration()
    return (
        <>
            <Main fixed>
                <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
                    {sideBarOpen && (
                        <SidebarInner
                            title='Administration'
                            description='Manage users, roles, permissions and application configuration.'
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



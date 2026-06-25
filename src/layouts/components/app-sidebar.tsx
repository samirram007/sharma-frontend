import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';

import { Separator } from '@radix-ui/react-separator';
import { Link } from '@tanstack/react-router';
import { capitalizeAllWords, upperCase } from '../../utils/removeEmptyStrings';
import { sidebarData } from './data/sidebar-data';
import { NavGroup } from './nav-group';
import { NavUser } from './nav-user';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const sidebar = useSidebar()
  return (
    <Sidebar collapsible='icon' variant='floating' {...props}>
      <SidebarHeader className='pb-0'>
        <Link
          to='/'
          className={`flex items-center py-2 no-underline transition-all ${sidebar.open ? 'gap-3 px-1' : 'justify-center px-0'}`}
        >
          {/* Logo chip */}
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-violet-600 shadow-md'>
            <sidebarData.header.logo className='h-5 w-5 text-white' />
          </div>
          {/* Title + subtitle — hidden when collapsed */}
          {sidebar.open && (
            <div className='flex min-w-0 flex-col leading-none'>
              <span className='truncate text-base font-bold tracking-tight text-sidebar-foreground'>
                {upperCase(sidebarData.header.title)}
              </span>
              <span className='truncate text-[11px] font-medium text-pink-500 dark:text-pink-400'>
                {capitalizeAllWords(sidebarData.header.subtitle)}
              </span>
            </div>
          )}
        </Link>
        <Separator className='mb-1 h-px bg-sidebar-border' />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          props.visible && <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar >
  )
}

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'

import { Separator } from '@radix-ui/react-separator'
import { Link } from '@tanstack/react-router'
import { GalleryVerticalEnd } from 'lucide-react'
import { capitalizeAllWords, upperCase } from '../../utils/removeEmptyStrings'
import { sidebarData } from './data/sidebar-data'
import { DynamicNavGroup } from './dynamic-nav-group'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import { useAuth } from '@/features/auth/contexts/AuthContext'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const sidebar = useSidebar()
  const { menuTree } = useAuth()

  const hasDynamicMenus = menuTree.length > 0

  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader className="pb-0">
        <Link
          to="/"
          className={`flex items-center py-2 no-underline transition-all ${sidebar.open ? 'gap-3 px-1' : 'justify-center px-0'}`}
        >
          {/* Logo chip */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-violet-600 shadow-md">
            <GalleryVerticalEnd className="h-5 w-5 text-white" />
          </div>
          {/* Title + subtitle — hidden when collapsed */}
          {sidebar.open && (
            <div className="flex min-w-0 flex-col leading-none">
              <span className="truncate text-base font-bold tracking-tight text-sidebar-foreground">
                {upperCase(sidebarData.header.title)}
              </span>
              <span className="truncate text-[11px] font-medium text-pink-500 dark:text-pink-400">
                {capitalizeAllWords(sidebarData.header.subtitle)}
              </span>
            </div>
          )}
        </Link>
        <Separator className="mb-1 h-px bg-sidebar-border" />
      </SidebarHeader>
      <SidebarContent>
        {hasDynamicMenus
          ? /* ── Dynamic menus from backend API (already permission-filtered) ─ */
            menuTree.map((group) => (
              <DynamicNavGroup
                key={group.id}
                title={group.menuName}
                items={group.children}
              />
            ))
          : /* ── Fallback: hardcoded sidebar data (permission-filtered) ─ */
            sidebarData.navGroups
              .filter((g) => g.visible)
              .map((group) => (
                <NavGroup
                  key={group.title}
                  title={group.title}
                  items={group.items}
                  requiredFeature={group.requiredFeature}
                  visible={group.visible}
                />
              ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

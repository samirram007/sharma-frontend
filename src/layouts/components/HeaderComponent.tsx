import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { NotificationBell } from '@/features/modules/app-notification/components/notification-bell'
import React from 'react'
import { Header } from './header'
import { TopNav } from './top-nav'
import { resolveTopNavLinks } from '../links/top-nav-links'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { topMenuTreeQueryOptions } from '@/features/modules/menu/data/services'
import { useMemo } from 'react'
import { collectMenuRoutes } from '@/features/modules/menu/data/menu-route-guard'
import { RecentTabs } from './recent-tabs'
import RouteBreadcrumbs from './route-breadcrumbs'
import DocumentsButton from './documents-button'
import ReportingPeriodShort from './reporting-period-short'
// import { GodownItemSearch } from './godown-item-search';

const HeaderComponent: React.FC<{}> = () => {
  const { menuTree, user } = useAuth()

  // Top navigation is DB-driven: menus flagged "Top Menu" (is_top_menu) in
  // the admin UI. The backend returns only entries the user has permission
  // for, so no additional route gating is needed here.
  const { data: topMenuData, isPending } = useQuery({
    ...topMenuTreeQueryOptions(),
    enabled: !!user,
  })

  // Routes the current user is allowed to see (permission-filtered menu
  // tree) — used to hide stale tabs/recents the user may no longer access.
  // Visiting is recorded inside RecentTabs (its own effect pushes the page
  // before refreshing, so the new tab shows up immediately).
  const allowedRoutes = useMemo(() => {
    const routes = collectMenuRoutes(menuTree ?? [])
    // The Dashboard home tab is pinned as '/dashboard' (where '/' redirects),
    // but the menu tree stores it as '/' — allow it when the node exists.
    if (routes.includes('/')) routes.push('/dashboard')
    return routes
  }, [menuTree])

  const links = useMemo(
    () =>
      resolveTopNavLinks({
        dbTopMenus: topMenuData?.data ?? [],
        isPending,
        menuTree,
      }),
    [topMenuData, menuTree, isPending],
  )

  return (
    <div className="sticky top-0 z-10 ">
      <div className="    max-w-full rounded-xl border border-white/60 bg-white/70 shadow-sm backdrop-blur-md dark:border-white/8 dark:bg-card dark:shadow-black/40 dark:backdrop-blur-md">
        <Header className="rounded-t-xl bg-transparent  border-b-2 border-white/60 dark:border-white/8">
          <TopNav links={links} allowedRoutes={allowedRoutes} />
          <div className="ml-auto flex min-w-0 items-center gap-2 lg:gap-4">
            {/* <GodownItemSearch className='hidden lg:flex' placeholder='Search items...' /> */}
            <Search className="hidden sm:flex" />
            {/* Single instance for all breakpoints — the date text hides below
                `sm` (icon-only button), so phones don't overflow and tablets
                in the 640–768px range don't get a duplicate. */}
            <ReportingPeriodShort />
            <NotificationBell />
            <DocumentsButton />
            <div className="hidden md:block h-6 w-px bg-slate-300/50 dark:bg-slate-700/50" />
            <ThemeSwitch />
            <div className="flex">
              <ProfileDropdown />
            </div>
          </div>
        </Header>
        <RecentTabs />
        <div className="px-2 pb-2 pt-2">
          <div className="rounded-md border border-slate-200/70 bg-white/70 px-3 py-1.5 text-xs shadow-sm backdrop-blur-sm dark:border-white/[0.07] dark:bg-card">
            <RouteBreadcrumbs />
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeaderComponent

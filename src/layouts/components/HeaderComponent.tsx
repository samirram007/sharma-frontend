import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { NotificationBell } from '@/features/modules/app-notification/components/notification-bell'
import React from 'react'
import FiscalYearSelector from './fiscal-year-selector'
import { Header } from './header'
import { TopNav } from './top-nav'
import { resolveTopNavLinks } from '../links/top-nav-links'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { topMenuTreeQueryOptions } from '@/features/modules/menu/data/services'
import { useMemo } from 'react'
import { collectMenuRoutes } from '@/features/modules/menu/data/menu-route-guard'
import { RecentTabs } from './recent-tabs'
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
    <div className="mx-2 mt-2 max-w-full rounded-xl border border-white/60 bg-white/70 shadow-sm backdrop-blur-md dark:border-white/8 dark:bg-card dark:shadow-black/40 dark:backdrop-blur-md">
      <Header className="rounded-t-xl bg-transparent">
        <TopNav links={links} allowedRoutes={allowedRoutes} />
        <div className="ml-auto flex min-w-0 items-center gap-2 lg:gap-4">
          {/* <GodownItemSearch className='hidden lg:flex' placeholder='Search items...' /> */}
          <Search className="hidden sm:flex" />
          <NotificationBell />
          <div className="hidden sm:block h-6 w-px bg-slate-300/50 dark:bg-slate-700/50" />
          <ThemeSwitch />
          <FiscalYearSelector visible={true} />
          <ProfileDropdown />
        </div>
      </Header>
      <RecentTabs />
    </div>
  )
}

export default HeaderComponent

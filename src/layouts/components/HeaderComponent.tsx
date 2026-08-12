import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { NotificationBell } from '@/features/modules/app-notification/components/notification-bell'
import React from 'react'
import FiscalYearSelector from './fiscal-year-selector'
import { Header } from './header'
import { TopNav } from './top-nav'
import {
  buildTopNavLinksFromTree,
  collectAllowedRoutes,
  filterTopNavLinks,
  topNavLinks,
} from '../links/top-nav-links'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { topMenuTreeQueryOptions } from '@/features/modules/menu/data/services'
import { useMemo } from 'react'
// import { GodownItemSearch } from './godown-item-search';

const HeaderComponent: React.FC<{}> = () => {
  const { menuTree, user } = useAuth()

  // Top navigation is DB-driven: menus flagged "Top Menu" (is_top_menu) in
  // the admin UI. The backend returns only entries the user has permission
  // for, so no additional route gating is needed here.
  const { data: topMenuData } = useQuery({
    ...topMenuTreeQueryOptions(),
    enabled: !!user,
  })

  const links = useMemo(() => {
    const dbLinks = buildTopNavLinksFromTree(topMenuData?.data ?? [])

    // Fallback: when no DB top menus are configured (or the user has
    // access to none of them), use the hardcoded links, gated against the
    // (permission-filtered) sidebar menu tree so users only see links they
    // actually have access to.
    if (dbLinks.length > 0) return dbLinks

    return filterTopNavLinks(topNavLinks, collectAllowedRoutes(menuTree))
  }, [topMenuData, menuTree])

  return (
    <Header className="mx-2 mt-2 max-w-full rounded-xl border border-white/60 bg-white/70 shadow-sm backdrop-blur-md dark:border-white/8 dark:bg-card dark:shadow-black/40 dark:backdrop-blur-md">
      <TopNav links={links} />
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
  )
}

export default HeaderComponent

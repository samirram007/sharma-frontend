import type { LinkProps } from '@tanstack/react-router'

interface User {
  name: string
  email: string
  avatar: string
  visible: boolean
}

interface Team {
  name: string
  visible: boolean
  logo: React.ElementType
  plan: string
}

interface BaseNavItem {
  title: string
  badge?: string
  icon?: React.ElementType
  color?: string
  visible?: boolean
  requiredFeature?: string
}

type NavLink = BaseNavItem & {
  // Route paths may reference dynamic segments (e.g. '/masters/organization/fiscal_year/new/open'),
  // so keep the typed union for autocomplete but allow arbitrary route strings.
  url: LinkProps['to'] | (string & {})
  items?: never
}

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: LinkProps['to'] | (string & {}) })[]
  url?: never
}

type NavItem = NavCollapsible | NavLink

interface NavGroup {
  title: string
  visible: boolean
  items: NavItem[]
  requiredFeature?: string
}
interface Header {
  logo: React.ElementType
  title: string
  visible: boolean
  subtitle: string
}

interface SidebarData {
  user: User
  header: Header
  teams: Team[]
  navGroups: NavGroup[]
}

export type { NavCollapsible, NavGroup, NavItem, NavLink, SidebarData }

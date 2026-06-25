import type { LinkProps } from "@tanstack/react-router"



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
}

type NavLink = BaseNavItem & {
  url: LinkProps['to']
  items?: never
}

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: LinkProps['to'] })[]
  url?: never
}

type NavItem = NavCollapsible | NavLink

interface NavGroup {
  title: string
  visible: boolean
  items: NavItem[]
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


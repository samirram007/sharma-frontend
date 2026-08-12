import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { ChevronRight } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Link, useLocation } from '@tanstack/react-router'
import type { ElementType } from 'react'
import type { MenuTreeItem } from '@/features/modules/menu/data/menu-tree-types'
import { resolveIcon } from '@/features/modules/menu/data/menu-icon-map'

// ── Icon color map ───────────────────────────────────────────────────────────
const iconColorMap: Record<string, { idle: string; active: string }> = {
  blue: {
    idle: '!text-blue-500 dark:!text-blue-400',
    active: '!text-blue-600 dark:!text-blue-300',
  },
  indigo: {
    idle: '!text-indigo-500 dark:!text-indigo-400',
    active: '!text-indigo-600 dark:!text-indigo-300',
  },
  violet: {
    idle: '!text-violet-500 dark:!text-violet-400',
    active: '!text-violet-600 dark:!text-violet-300',
  },
  emerald: {
    idle: '!text-emerald-500 dark:!text-emerald-400',
    active: '!text-emerald-600 dark:!text-emerald-300',
  },
  teal: {
    idle: '!text-teal-500 dark:!text-teal-400',
    active: '!text-teal-600 dark:!text-teal-300',
  },
  cyan: {
    idle: '!text-cyan-500 dark:!text-cyan-400',
    active: '!text-cyan-600 dark:!text-cyan-300',
  },
  orange: {
    idle: '!text-orange-500 dark:!text-orange-400',
    active: '!text-orange-600 dark:!text-orange-300',
  },
  amber: {
    idle: '!text-amber-500 dark:!text-amber-400',
    active: '!text-amber-600 dark:!text-amber-300',
  },
  rose: {
    idle: '!text-rose-500 dark:!text-rose-400',
    active: '!text-rose-600 dark:!text-rose-300',
  },
  pink: {
    idle: '!text-pink-500 dark:!text-pink-400',
    active: '!text-pink-600 dark:!text-pink-300',
  },
  slate: {
    idle: '!text-slate-500 dark:!text-slate-400',
    active: '!text-slate-700 dark:!text-slate-300',
  },
}

const NavIcon = ({
  icon: Icon,
  color,
  isActive,
}: {
  icon: ElementType
  color?: string
  isActive?: boolean
}) => {
  const map = iconColorMap[color ?? 'slate']
  const cls = isActive ? map.active : map.idle
  return <Icon className={`shrink-0 transition-colors duration-200 ${cls}`} />
}

// ── Props ────────────────────────────────────────────────────────────────────

interface DynamicNavGroupProps {
  title: string
  icon?: ElementType
  items: MenuTreeItem[]
}

// ── Component ────────────────────────────────────────────────────────────────

export function DynamicNavGroup({ title, items }: DynamicNavGroupProps) {
  const { state } = useSidebar()
  const location = useLocation()
  const href = location.pathname

  if (items.length === 0) return null

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          if (item.children.length > 0) {
            if (state === 'collapsed') {
              return (
                <DynamicCollapsedDropdown
                  key={item.id}
                  item={item}
                  href={href}
                />
              )
            }
            return <DynamicCollapsible key={item.id} item={item} href={href} />
          }
          return <DynamicMenuLink key={item.id} item={item} href={href} />
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

// ── Sub-components ───────────────────────────────────────────────────────────

/** A leaf menu item with a route link. */
const DynamicMenuLink = ({
  item,
  href,
}: {
  item: MenuTreeItem
  href: string
}) => {
  const { setOpenMobile } = useSidebar()
  const Icon = resolveIcon(item.icon)
  const isActive = checkIsActive(href, item.route)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.menuName}>
        <Link to={item.route ?? '/'} onClick={() => setOpenMobile(false)}>
          <NavIcon icon={Icon} isActive={isActive} />
          <span>{item.menuName}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

/** Collapsible item with children (expanded sidebar state). */
const DynamicCollapsible = ({
  item,
  href,
}: {
  item: MenuTreeItem
  href: string
}) => {
  const { setOpenMobile } = useSidebar()
  const Icon = resolveIcon(item.icon)
  const isParentActive = checkIsActive(href, item.route, true)

  if (item.children.length === 0) return null

  return (
    <Collapsible
      asChild
      defaultOpen={isParentActive}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.menuName} isActive={isParentActive}>
            <NavIcon icon={Icon} isActive={isParentActive} />
            <span>{item.menuName}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="CollapsibleContent">
          <SidebarMenuSub>
            {item.children.map((child) => {
              const childIcon = resolveIcon(child.icon)
              const isSubActive = checkIsActive(href, child.route)
              return (
                <SidebarMenuSubItem key={child.id}>
                  <SidebarMenuSubButton asChild isActive={isSubActive}>
                    <Link
                      to={child.route ?? '/'}
                      onClick={() => setOpenMobile(false)}
                    >
                      <NavIcon icon={childIcon} isActive={isSubActive} />
                      <span>{child.menuName}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

/** Collapsible item rendered as a dropdown menu (collapsed sidebar state). */
const DynamicCollapsedDropdown = ({
  item,
  href,
}: {
  item: MenuTreeItem
  href: string
}) => {
  const Icon = resolveIcon(item.icon)
  const isParentActive = checkIsActive(href, item.route)

  if (item.children.length === 0) return null

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton tooltip={item.menuName} isActive={isParentActive}>
            <NavIcon icon={Icon} isActive={isParentActive} />
            <span>{item.menuName}</span>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" sideOffset={4}>
          <DropdownMenuLabel>{item.menuName}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.children.map((child) => {
            const childIcon = resolveIcon(child.icon)
            const isSubActive = checkIsActive(href, child.route)
            return (
              <DropdownMenuItem key={`${child.id}`} asChild>
                <Link
                  to={child.route ?? '/'}
                  className={`${isSubActive ? 'bg-secondary' : ''}`}
                >
                  <NavIcon icon={childIcon} isActive={isSubActive} />
                  <span className="max-w-52 text-wrap">{child.menuName}</span>
                </Link>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function checkIsActive(
  href: string,
  route: string | null | undefined,
  mainNav = false,
) {
  if (!route) return false
  return (
    href === route ||
    href.split('?')[0] === route ||
    (mainNav &&
      href.split('/')[1] !== '' &&
      href.split('/')[1] === route.split('/')[1])
  )
}

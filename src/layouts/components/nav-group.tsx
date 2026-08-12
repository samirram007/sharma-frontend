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

import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Link, useLocation } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import {
  type NavCollapsible,
  type NavGroup,
  type NavItem,
  type NavLink,
} from './types'
import { useAuth } from '@/features/auth/contexts/AuthContext'

// ── Icon color map ───────────────────────────────────────────────────────────
// ── Helpers ───────────────────────────────────────────────────────────────────
/** Check if the user has the required feature permission */
function hasPermission(
  permissions: string[],
  requiredFeature?: string,
): boolean {
  if (!requiredFeature) return true
  return permissions.includes(requiredFeature)
}

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
  icon: React.ElementType
  color?: string
  isActive?: boolean
}) => {
  const map = iconColorMap[color ?? 'slate']
  const cls = isActive ? map.active : map.idle
  return <Icon className={`shrink-0 transition-colors duration-200 ${cls}`} />
}
// ────────────────────────────────────────────────────────────────────────────

export function NavGroup({ title, items, requiredFeature }: NavGroup) {
  const { state } = useSidebar()
  const location = useLocation()
  const { permissions } = useAuth()

  const href = location.pathname

  // Role-based access: hide entire group if user lacks required feature
  if (!hasPermission(permissions, requiredFeature)) {
    return null
  }

  // Filter items based on user's permissions
  const filteredItems = items.filter((item) => {
    // For collapsible items, check if at least one child is accessible
    if (item.items) {
      const hasAccessibleChildren = item.items.some((child) =>
        hasPermission(permissions, child.requiredFeature),
      )
      return (
        hasAccessibleChildren ||
        hasPermission(permissions, item.requiredFeature)
      )
    }
    // For direct link items
    return hasPermission(permissions, item.requiredFeature)
  })

  if (filteredItems.length === 0) {
    return null
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {filteredItems.map((item) => {
          const key = `${item.title}-${item.url}`

          if (!item.items)
            return <SidebarMenuLink key={key} item={item} href={href} />

          if (state === 'collapsed')
            return (
              <SidebarMenuCollapsedDropdown
                key={key}
                item={item}
                href={href}
                permissions={permissions}
              />
            )

          return (
            <SidebarMenuCollapsible
              key={key}
              item={item}
              href={href}
              permissions={permissions}
            />
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

const NavBadge = ({ children }: { children: ReactNode }) => (
  <Badge className="rounded-full px-1 py-0 text-xs">{children}</Badge>
)

const SidebarMenuLink = ({ item, href }: { item: NavLink; href: string }) => {
  const { setOpenMobile } = useSidebar()
  if (!item.visible) return null
  const isActive = checkIsActive(href, item)
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
        <Link to={item.url} onClick={() => setOpenMobile(false)}>
          {item.icon && (
            <NavIcon icon={item.icon} color={item.color} isActive={isActive} />
          )}
          <span>{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

const SidebarMenuCollapsible = ({
  item,
  href,
  permissions = [],
}: {
  item: NavCollapsible
  href: string
  permissions?: string[]
}) => {
  const { setOpenMobile } = useSidebar()
  const isParentActive = checkIsActive(href, item, true)

  // Filter child items by permissions
  const visibleChildren = item.items.filter((subItem) =>
    hasPermission(permissions, subItem.requiredFeature),
  )

  if (visibleChildren.length === 0) {
    return null
  }

  return (
    <Collapsible
      asChild
      defaultOpen={isParentActive}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title} isActive={isParentActive}>
            {item.icon && (
              <NavIcon
                icon={item.icon}
                color={item.color}
                isActive={isParentActive}
              />
            )}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="CollapsibleContent">
          <SidebarMenuSub>
            {visibleChildren.map((subItem) => {
              const isSubActive = checkIsActive(href, subItem)
              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton asChild isActive={isSubActive}>
                    <Link to={subItem.url} onClick={() => setOpenMobile(false)}>
                      {subItem.icon && (
                        <NavIcon
                          icon={subItem.icon}
                          color={subItem.color}
                          isActive={isSubActive}
                        />
                      )}
                      <span>{subItem.title}</span>
                      {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
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

const SidebarMenuCollapsedDropdown = ({
  item,
  href,
  permissions = [],
}: {
  item: NavCollapsible
  href: string
  permissions?: string[]
}) => {
  const isParentActive = checkIsActive(href, item)

  // Filter children by permissions
  const visibleChildren = item.items.filter((sub) =>
    hasPermission(permissions, sub.requiredFeature),
  )

  if (visibleChildren.length === 0) {
    return null
  }

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton tooltip={item.title} isActive={isParentActive}>
            {item.icon && (
              <NavIcon
                icon={item.icon}
                color={item.color}
                isActive={isParentActive}
              />
            )}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" sideOffset={4}>
          <DropdownMenuLabel>
            {item.title} {item.badge ? `(${item.badge})` : ''}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {visibleChildren.map((sub) => {
            const isSubActive = checkIsActive(href, sub)
            return (
              <DropdownMenuItem key={`${sub.title}-${sub.url}`} asChild>
                <Link
                  to={sub.url}
                  className={`${isSubActive ? 'bg-secondary' : ''}`}
                >
                  {sub.icon && (
                    <NavIcon
                      icon={sub.icon}
                      color={sub.color}
                      isActive={isSubActive}
                    />
                  )}
                  <span className="max-w-52 text-wrap">{sub.title}</span>
                  {sub.badge && (
                    <span className="ml-auto text-xs">{sub.badge}</span>
                  )}
                </Link>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

function checkIsActive(href: string, item: NavItem, mainNav = false) {
  return (
    href === item.url ||
    href.split('?')[0] === item.url ||
    !!item?.items?.filter((i) => i.url === href).length ||
    (mainNav &&
      href.split('/')[1] !== '' &&
      href.split('/')[1] === item?.url?.split('/')[1])
  )
}

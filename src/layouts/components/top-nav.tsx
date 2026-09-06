// import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { IconChevronDown, IconClock, IconMenu } from '@tabler/icons-react'
import { Link, useLocation } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { readTabs, type RecentPage } from '../lib/recent-pages'

interface TopNavProps extends React.HTMLAttributes<HTMLElement> {
  links: {
    title: string
    href: string
    hasSubmenu?: boolean
    submenuItems?: any[]
    icon?: React.ElementType
    visible: boolean
    isActive: boolean
    disabled?: boolean
  }[]
  /** Routes the current user may see — stale recents outside this set are hidden. */
  allowedRoutes?: string[]
}

export function TopNav({
  className,
  links: arrayLinks,
  allowedRoutes,
  ...props
}: TopNavProps) {
  const location = useLocation()
  const [links, setLinks] = useState([...arrayLinks])
  const [recents, setRecents] = useState<RecentPage[]>(() => readTabs())
  const allowed = useMemo(() => new Set(allowedRoutes ?? []), [allowedRoutes])
  useEffect(() => {
    setLinks(
      arrayLinks.map((link) => ({
        ...link,
        // Root link ('/') matches every path with includes(), so use an exact
        // match there; everything else keeps prefix matching for nested routes.
        isActive:
          link.href === '/'
            ? location.pathname === '/'
            : location.pathname.includes(link.href),
      })),
    )
  }, [arrayLinks, location.pathname])
  return (
    <>
      <div className="lg:hidden">
        <DropdownMenu
          modal={false}
          onOpenChange={(open) => {
            if (open) setRecents(readTabs())
          }}
        >
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="outline">
              <IconMenu />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="start">
            {links
              .filter((link) => link.visible)
              .map(({ title, href, isActive, icon: Icon }) => (
                <DropdownMenuItem key={`${title}-${href}`} asChild>
                  <Link
                    to={href}
                    className={!isActive ? 'text-muted-foreground' : ''}
                  >
                    {Icon && <Icon size={16} className="shrink-0" />}
                    {title}
                  </Link>
                </DropdownMenuItem>
              ))}
            {recents.filter((p) => allowed.has(p.href)).length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="flex items-center gap-1.5 px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  <IconClock size={13} className="shrink-0" />
                  Recent
                </DropdownMenuLabel>
                {recents
                  .filter((p) => allowed.has(p.href))
                  .slice(0, 6)
                  .map((page) => (
                    <DropdownMenuItem key={`recent-${page.href}`} asChild>
                      <Link
                        to={page.href}
                        className={
                          location.pathname === page.href
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-muted-foreground'
                        }
                      >
                        {page.title}
                      </Link>
                    </DropdownMenuItem>
                  ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav
        className={cn('hidden items-center gap-1 lg:flex lg:gap-2', className)}
        {...props}
      >
        {links
          .filter((link) => link.visible)
          .map(
            ({
              hasSubmenu,
              submenuItems,
              title,
              href,
              isActive,
              icon: Icon,
            }) =>
              hasSubmenu ? (
                <DropdownMenu key={`${title}-${href}`} modal={false}>
                  <DropdownMenuTrigger asChild>
                    <span
                      className={cn(
                        'flex cursor-pointer items-center gap-1.5 px-3 py-2 text-sm font-semibold transition-all duration-200 rounded-md',
                        isActive
                          ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100',
                      )}
                    >
                      {Icon && <Icon size={18} className="shrink-0" />}
                      {title}
                      <IconChevronDown
                        size={16}
                        className={
                          'transition-transform ' + (isActive ? '' : '')
                        }
                      />
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="bottom"
                    align="center"
                    className="min-w-max border border-slate-200/80 dark:border-white/[0.07] shadow-lg rounded-lg"
                  >
                    <TopNavDropdownBody
                      groups={(submenuItems ?? []).filter(
                        (submenu) => submenu.visible,
                      )}
                      currentPath={location.pathname}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={`${title}-${href}`}
                  to={href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-md transition-all duration-200',
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100',
                  )}
                >
                  {Icon && <Icon size={18} className="shrink-0" />}
                  {title}
                </Link>
              ),
          )}
      </nav>
    </>
  )
}

function TopNavDropdownBody({
  groups,
  currentPath,
}: {
  groups: {
    title: string
    description?: string
    visible: boolean
    icon?: React.ElementType
    menus: {
      title: string
      href: string
      visible: boolean
      icon?: React.ElementType
    }[]
  }[]
  currentPath: string
}) {
  return (
    <div className="rounded-lg">
      {/* Menu sections */}
      <div className="flex max-h-[70vh] flex-row flex-wrap overflow-y-auto bg-slate-50/80 px-4 py-2 dark:bg-white/5">
        {groups.map((submenu, index) => (
          <DropdownMenuItem key={`${submenu.title}-${index}`} asChild>
            <div className="flex flex-col items-start justify-start">
              <div className="min-w-[200px] border-b border-slate-200/70 py-2 dark:border-white/[0.08]">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 transition-colors hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400">
                  {submenu.icon && (
                    <submenu.icon
                      size={18}
                      className="shrink-0 text-slate-500 dark:text-slate-400"
                    />
                  )}
                  {submenu.title}
                </div>
                {submenu.description && (
                  <div className="mt-0.5 text-[10px] font-normal leading-tight text-slate-500 dark:text-slate-400">
                    {submenu.description}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                {submenu.menus
                  ?.filter((item) => item.visible)
                  .map((item) => (
                    <Link
                      key={`${submenu.title}-${item.title}-${index}`}
                      to={item.href}
                      className={cn(
                        'flex w-full items-center gap-2 rounded px-3 py-1.5 text-sm transition-all duration-150',
                        currentPath === item.href
                          ? 'bg-blue-50 font-semibold text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                          : 'font-normal text-slate-700 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-blue-300',
                      )}
                    >
                      {item.icon && (
                        <item.icon
                          size={16}
                          className="shrink-0 text-slate-400 dark:text-slate-500"
                        />
                      )}
                      {item.title}
                    </Link>
                  ))}
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </div>
    </div>
  )
}

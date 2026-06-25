import { buttonVariants } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { IconCirclePlus, IconListDetails, IconPencil } from '@tabler/icons-react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, type JSX } from 'react'

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    visible: boolean
    title: string
    description?: string
    icon: JSX.Element
  }[]
}

export default function SidebarNav({
  className,
  items,
  ...props
}: SidebarNavProps) {
  const isItemActive = (itemHref: string, currentPath: string) =>
    currentPath === itemHref || currentPath.startsWith(`${itemHref}/`)

  const getRouteState = (itemHref: string, currentPath: string) => {
    if (!isItemActive(itemHref, currentPath)) return 'list' as const
    if (currentPath === itemHref || currentPath === `${itemHref}/`) return 'list' as const

    const routeTail = currentPath
      .slice(itemHref.length)
      .replace(/^\/+/, '')
      .split('/')[0]
      ?.toLowerCase()

    if (routeTail === 'new' || routeTail === 'add' || routeTail === 'create') return 'add' as const
    if (routeTail === 'edit' || routeTail === 'update') return 'edit' as const

    // Any other nested segment is treated as details/edit context (e.g., /:id)
    return 'edit' as const
  }

  const RouteStateIcon = ({ state }: { state: 'list' | 'add' | 'edit' }) => {
    if (state === 'add') {
      return <IconCirclePlus className='h-3.5 w-3.5' stroke={2} />
    }
    if (state === 'edit') {
      return <IconPencil className='h-3.5 w-3.5' stroke={2} />
    }
    return <IconListDetails className='h-3.5 w-3.5' stroke={2} />
  }

  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [val, setVal] = useState(pathname ?? '/masters/organization/company')
  const visibleItems = items.filter((item) => item.visible)
  const activeItem =
    visibleItems.find((item) => isItemActive(item.href, pathname)) ??
    visibleItems.find((item) => item.href === val) ??
    visibleItems[0]
  const iconTones = [
    {
      text: 'text-amber-700 dark:text-amber-200',
      chip: 'bg-linear-to-br from-amber-100 via-orange-50 to-yellow-100 shadow-[0_10px_22px_-16px_rgba(217,119,6,0.8)] dark:from-amber-950/90 dark:via-orange-950/70 dark:to-yellow-950/80',
      surface: 'border-amber-200/80 bg-linear-to-r from-amber-50 via-white to-yellow-50/90 dark:border-amber-900/70 dark:from-slate-900 dark:via-amber-950/25 dark:to-slate-900',
    },
    {
      text: 'text-rose-700 dark:text-rose-200',
      chip: 'bg-linear-to-br from-rose-100 via-pink-50 to-fuchsia-100 shadow-[0_10px_22px_-16px_rgba(225,29,72,0.8)] dark:from-rose-950/90 dark:via-pink-950/70 dark:to-fuchsia-950/80',
      surface: 'border-rose-200/80 bg-linear-to-r from-rose-50 via-white to-pink-50/90 dark:border-rose-900/70 dark:from-slate-900 dark:via-rose-950/25 dark:to-slate-900',
    },
    {
      text: 'text-emerald-700 dark:text-emerald-200',
      chip: 'bg-linear-to-br from-emerald-100 via-lime-50 to-teal-100 shadow-[0_10px_22px_-16px_rgba(5,150,105,0.8)] dark:from-emerald-950/90 dark:via-green-950/70 dark:to-teal-950/80',
      surface: 'border-emerald-200/80 bg-linear-to-r from-emerald-50 via-white to-teal-50/90 dark:border-emerald-900/70 dark:from-slate-900 dark:via-emerald-950/25 dark:to-slate-900',
    },
    {
      text: 'text-sky-700 dark:text-sky-200',
      chip: 'bg-linear-to-br from-sky-100 via-cyan-50 to-blue-100 shadow-[0_10px_22px_-16px_rgba(2,132,199,0.8)] dark:from-sky-950/90 dark:via-cyan-950/70 dark:to-blue-950/80',
      surface: 'border-sky-200/80 bg-linear-to-r from-sky-50 via-white to-cyan-50/90 dark:border-sky-900/70 dark:from-slate-900 dark:via-sky-950/25 dark:to-slate-900',
    },
    {
      text: 'text-indigo-700 dark:text-indigo-200',
      chip: 'bg-linear-to-br from-indigo-100 via-violet-50 to-purple-100 shadow-[0_10px_22px_-16px_rgba(67,56,202,0.8)] dark:from-indigo-950/90 dark:via-violet-950/70 dark:to-purple-950/80',
      surface: 'border-indigo-200/80 bg-linear-to-r from-indigo-50 via-white to-violet-50/90 dark:border-indigo-900/70 dark:from-slate-900 dark:via-indigo-950/25 dark:to-slate-900',
    },
    {
      text: 'text-fuchsia-700 dark:text-fuchsia-200',
      chip: 'bg-linear-to-br from-fuchsia-100 via-pink-50 to-purple-100 shadow-[0_10px_22px_-16px_rgba(192,38,211,0.8)] dark:from-fuchsia-950/90 dark:via-pink-950/70 dark:to-purple-950/80',
      surface: 'border-fuchsia-200/80 bg-linear-to-r from-fuchsia-50 via-white to-pink-50/90 dark:border-fuchsia-900/70 dark:from-slate-900 dark:via-fuchsia-950/25 dark:to-slate-900',
    },
  ]
  const activeToneIndex = Math.max(visibleItems.findIndex((item) => item.href === (activeItem?.href ?? '')), 0)
  const activeTone = iconTones[activeToneIndex % iconTones.length]
  const activeRouteState = getRouteState(activeItem?.href ?? '', pathname)

  useEffect(() => {
    if (activeItem?.href && activeItem.href !== val) {
      setVal(activeItem.href)
    }
  }, [activeItem?.href, val])

  const handleSelect = (e: string) => {
    setVal(e)
    navigate({ to: e })
  }

  return (
    <>
      <div className='p-1 xl:hidden'>
        <Select value={val} onValueChange={handleSelect}>
          <SelectTrigger
            className={cn(
              'min-h-16 w-full min-w-0 rounded-xl px-3 py-3 shadow-sm',
              activeTone.surface
            )}
          >
            <div className='grid min-w-0 flex-1 grid-cols-[auto_1fr] items-center gap-3 pr-2 text-left'>
              <span
                className={cn(
                  'shrink-0 rounded-xl p-2 [&_svg]:h-5.5 [&_svg]:w-5.5',
                  activeTone.text,
                  activeTone.chip
                )}
              >
                {activeItem?.icon}
              </span>
              <div className='min-w-0 text-left'>
                <div className='flex items-center gap-2'>
                  <div className='truncate text-sm font-semibold text-slate-900 dark:text-slate-100'>
                    {activeItem?.title ?? 'Select section'}
                  </div>
                  <span className='inline-flex shrink-0 items-center justify-center rounded-md border border-slate-300/70 bg-white/70 p-1 text-slate-600 dark:border-white/[0.08] dark:bg-slate-900/60 dark:text-slate-300'>
                    <RouteStateIcon state={activeRouteState} />
                  </span>
                </div>
                {activeItem?.description ? (
                  <div className='line-clamp-2 pr-1 text-xs leading-4 text-slate-500 dark:text-slate-400'>
                    {activeItem.description}
                  </div>
                ) : null}
              </div>
            </div>
          </SelectTrigger>
          <SelectContent>
            {visibleItems.map((item, index) => (
              <SelectItem key={item.href} value={item.href}>
                <div className='flex items-start gap-3 px-2 py-2'>
                  <span
                    className={cn(
                      'mt-0.5 rounded-xl p-2 [&_svg]:h-6 [&_svg]:w-6',
                      iconTones[index % iconTones.length].text,
                      iconTones[index % iconTones.length].chip
                    )}
                  >
                    {item.icon}
                  </span>
                  <div className='space-y-0.5'>
                    <div className='text-sm font-medium text-slate-900 dark:text-slate-100'>{item.title}</div>
                    {item.description ? (
                      <div className='text-xs text-slate-500 dark:text-slate-400'>{item.description}</div>
                    ) : null}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea
        orientation='vertical'
        className='hidden max-h-[calc(100vh-8rem)] w-full min-w-72 overflow-hidden px-1 py-0 pr-4 xl:block'
      >
        <nav
          className={cn(
            'flex space-x-3 py-1 lg:flex-col lg:space-y-0 lg:space-x-0 lg:pr-1',
            className
          )}
          {...props}
        >
          {visibleItems.map((item, index) => (
            <div key={item.href} className='w-full lg:py-1'>
              {(() => {
                const itemIsActive = isItemActive(item.href, pathname)
                const itemRouteState = getRouteState(item.href, pathname)
                return (
                  <Link
                    to={item.href}
                    className={cn(
                      buttonVariants({ variant: 'ghost' }),
                      itemIsActive
                        ? 'bg-linear-to-r from-white via-violet-50 to-sky-50 text-slate-950 shadow-[0_14px_30px_-18px_rgba(76,29,149,0.45)] ring-1 ring-violet-200/80 dark:from-slate-900 dark:via-violet-950/40 dark:to-slate-900 dark:text-slate-100 dark:ring-violet-900/70'
                        : 'text-slate-700 hover:bg-linear-to-r hover:from-white hover:via-violet-50/70 hover:to-sky-50/80 hover:text-slate-950 hover:shadow-[0_12px_28px_-20px_rgba(59,130,246,0.45)] hover:ring-1 hover:ring-violet-100/80 dark:text-slate-300 dark:hover:via-violet-950/25 dark:hover:to-slate-900 dark:hover:text-slate-100 dark:hover:ring-violet-900/60',
                      'group h-auto w-full justify-start rounded-xl px-3.5 py-4 text-left text-[15px] font-medium transition-all duration-300 ease-out active:scale-[0.985] active:shadow-[0_10px_24px_-18px_rgba(76,29,149,0.6)]'
                    )}
                  >
                    <span
                      className={cn(
                        'mr-3 mt-0.5 rounded-xl p-2 transition-all duration-300 [&_svg]:h-6.5 [&_svg]:w-6.5 group-hover:scale-105',
                        itemIsActive
                          ? 'ring-1 ring-white/70 dark:ring-white/10'
                          : 'group-hover:-translate-y-0.5',
                        iconTones[index % iconTones.length].text,
                        iconTones[index % iconTones.length].chip
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className='flex min-w-0 flex-1 flex-col gap-1'>
                      <span className='flex items-center gap-2'>
                        <span className='truncate font-semibold'>{item.title}</span>
                        {itemIsActive ? (
                          <span className='inline-flex shrink-0 items-center justify-center rounded-md border border-slate-300/70 bg-white/70 p-1 text-slate-600 dark:border-white/[0.08] dark:bg-slate-900/60 dark:text-slate-300'>
                            <RouteStateIcon state={itemRouteState} />
                          </span>
                        ) : null}
                      </span>
                      {item.description ? (
                        <span
                          className={cn(
                            'whitespace-normal text-xs leading-5 text-slate-500 transition-colors duration-300 dark:text-slate-400',
                            itemIsActive
                              ? 'text-slate-700 dark:text-slate-300'
                              : 'group-hover:text-slate-700 dark:group-hover:text-slate-300'
                          )}
                        >
                          {item.description}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                )
              })()}
              {index < visibleItems.length - 1 ? (
                <div className='mx-3 h-px bg-slate-200/80 dark:bg-secondary/80' />
              ) : null}
            </div>
          ))}
        </nav>
      </ScrollArea>
    </>
  )
}

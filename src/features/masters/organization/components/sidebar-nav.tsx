import { buttonVariants } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { useState, type JSX } from 'react'

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string
    title: string
    icon: JSX.Element
  }[]
}

export default function SidebarNav({
  className,
  items,
  ...props
}: SidebarNavProps) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [val, setVal] = useState(pathname ?? '/masters/organization/company')

  const handleSelect = (e: string) => {
    setVal(e)
    navigate({ to: e })
  }

  return (
    <>
      <div className='p-1 md:hidden'>
        <Select value={val} onValueChange={handleSelect}>
          <SelectTrigger className='h-11 rounded-lg border-slate-300/70 bg-linear-to-r from-white to-slate-100/80 shadow-sm sm:w-56 dark:border-white/[0.08] dark:from-slate-900 dark:to-slate-800/80'>
            <SelectValue placeholder='Select section' />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.href} value={item.href}>
                <div className='flex gap-x-4 px-2 py-1'>
                  <span className='scale-125'>{item.icon}</span>
                  <span className='text-md'>{item.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea
        className='hidden w-full min-w-56 rounded-xl border border-slate-200/80 bg-linear-to-b from-white via-slate-50 to-slate-100/80 px-2 py-2 shadow-sm dark:border-white/[0.08] dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 md:block'
      >
        <nav
          className={cn(
            'flex space-x-2 py-1 lg:flex-col lg:space-y-1.5 lg:space-x-0',
            className
          )}
          {...props}
        >
          {items.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                pathname === item.href
                  ? 'bg-slate-200/90 text-slate-900 shadow-sm ring-1 ring-slate-300/90 dark:bg-secondary/80 dark:text-slate-100 dark:ring-slate-700/80'
                  : 'text-slate-700 hover:bg-white/90 hover:text-slate-900 hover:ring-1 hover:ring-slate-200/80 dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-slate-100 dark:hover:ring-slate-700/70',
                'group justify-start rounded-lg px-3 py-2.5 text-[15px] font-medium transition-all duration-200 active:scale-[0.98]'
              )}
            >
              <span
                className={cn(
                  'mr-2.5 rounded-md p-1 transition-colors duration-200',
                  pathname === item.href
                    ? 'bg-slate-300/80 text-slate-900 dark:bg-slate-700/80 dark:text-slate-100'
                    : 'text-slate-500 group-hover:bg-slate-100 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:bg-slate-700/60 dark:group-hover:text-slate-200'
                )}
              >
                {item.icon}
              </span>
              {item.title}
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </>
  )
}

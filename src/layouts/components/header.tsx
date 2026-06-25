import React from 'react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export const Header = ({
  className,
  fixed,
  children,
  ...props
}: HeaderProps) => {
  const [offset, setOffset] = React.useState(0)

  React.useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true })

    // Clean up the event listener on unmount
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'flex h-16 items-center gap-2 sm:gap-4 bg-background p-3 sm:p-4 transition-all duration-300',
        fixed && 'header-fixed peer/header fixed z-50 w-[inherit] rounded-lg',
        offset > 10 && fixed ? 'shadow-lg' : 'shadow-none',
        className
      )}
      {...props}
    >
      <SidebarTrigger variant='ghost' className='scale-125 sm:scale-100 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200' />
      <Separator orientation='vertical' className='h-6 bg-slate-300/40 dark:bg-slate-700/40' />
      {children}
    </header>
  )
}

Header.displayName = 'Header'

// import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { IconChevronDown, IconMenu } from '@tabler/icons-react'
import { Link, useLocation } from '@tanstack/react-router'
import { useEffect, useState } from 'react'


interface TopNavProps extends React.HTMLAttributes<HTMLElement> {
  links: {
    title: string
    href: string
    hasSubmenu?: boolean,
    submenuItems?: any[],
    visible: boolean
    isActive: boolean
    disabled?: boolean
  }[]
}

export function TopNav({ className, links: arrayLinks, ...props }: TopNavProps) {
  const location = useLocation();
  const [links, setLinks] = useState([...arrayLinks]);
  useEffect(() => {

    setLinks((prev) =>
      prev.map((link) => ({
        ...link,
        isActive: location.pathname.includes(link.href),
      }))
    );
  }, [location.pathname]);
  return (
    <>
      <div className='lg:hidden'>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button size='icon' variant='outline'>
              <IconMenu />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side='bottom' align='start'>
            {links.filter(link => link.visible).map(({ title, href, isActive }) => (
              <DropdownMenuItem key={`${title}-${href}`} asChild>
                <Link
                  to={href}
                  className={!isActive ? 'text-muted-foreground' : ''}

                >
                  {title}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav
        className={cn(
          'hidden items-center gap-1 lg:flex lg:gap-2',
          className
        )}
        {...props}
      >
        {links.filter(link => link.visible).map(({ hasSubmenu, submenuItems, title, href, isActive }) => (
          hasSubmenu ?
            (<DropdownMenu key={`${title}-${href}`} modal={false} >
              <DropdownMenuTrigger asChild>
                <span className={cn(
                  'flex cursor-pointer items-center gap-1.5 px-3 py-2 text-sm font-semibold transition-all duration-200 rounded-md',
                  isActive ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
                )}>
                  {title}
                  <IconChevronDown size={16} className={'transition-transform ' + (isActive ? '' : '')} />
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent side='bottom' align='center' className='min-w-max border border-slate-200/80 dark:border-white/[0.07] shadow-lg rounded-lg'>

                <div className='flex flex-row bg-slate-50/80 dark:bg-white/5 border-t border-slate-200/50 dark:border-white/[0.07] px-4 gap-8 py-2'>
                  {
                    submenuItems?.filter(submenu => submenu.visible).map((submenu, index) =>

                      <DropdownMenuItem key={`${title}-${submenu.title}`} asChild>

                        <div className='flex flex-col justify-start items-start'>
                              <div className='min-w-[200px] border-b border-slate-200/70 dark:border-white/[0.08] py-2' >
                                <div className='flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'>
                                  {submenu.icon && (
                                    <submenu.icon size={18} className='text-slate-500 dark:text-slate-400 shrink-0' />
                                  )}
                                  {submenu.title}
                                </div>
                                {submenu.description && (
                                  <div className='text-[10px] font-normal text-slate-500 dark:text-slate-400 mt-0.5 leading-tight'>
                                    {submenu.description}
                                  </div>
                                )}
                              </div>
                              <div className='flex flex-col gap-1'>
                            {
                              submenu.menus?.filter((item: any) => item.visible).map((item: any) =>
                                (
                                <Link
                                  key={`${submenu.title}-${item.title}-${index}`}
                                  to={item.href}
                                  className={cn(
                                    'flex items-center gap-2 w-full px-3 py-1.5 text-sm rounded transition-all duration-150',
                                    location.pathname === (item.href) ? 'font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30' : 'font-normal text-slate-700 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                                  )}
                                >
                                  {item.icon && (
                                    <item.icon size={16} className='text-slate-400 dark:text-slate-500 shrink-0' />
                                  )}
                                  {item.title}
                                </Link>
                                ))
                            }
                          </div>
                        </div>

                      </DropdownMenuItem>
                    )
                  }
                </div>
              </DropdownMenuContent>
            </DropdownMenu>)
            : (

          <Link
            key={`${title}-${href}`}
            to={href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-md transition-all duration-200',
                    isActive ? 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
                  )}
                >
                  {title}
          </Link>
            )))}
      </nav>
    </>
  )
}

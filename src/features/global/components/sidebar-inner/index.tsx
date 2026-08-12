import type { JSX } from 'react'
import SidebarNav from './sidebar-nav'

interface SidebarNavProps {
  title?: string
  description?: string
  items: {
    href: string
    visible: boolean
    title: string
    description?: string
    icon: JSX.Element
  }[]
}
const SidebarInner = ({ items, title, description }: SidebarNavProps) => {
  return (
    <aside className="top-0 h-full w-full rounded-xl border border-slate-200/80 bg-linear-to-b from-white via-slate-50 to-slate-100/80 p-2 shadow-sm dark:border-white/[0.08] dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 xl:sticky xl:w-[22rem] xl:shrink-0">
      {(title || description) && (
        <div className="space-y-0.5 border-b border-slate-200/70 px-2 pb-2 pt-2 dark:border-white/[0.07]">
          {title && (
            <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
      )}
      <SidebarNav items={items} />
    </aside>
  )
}
export default SidebarInner

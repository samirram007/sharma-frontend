import { Link } from '@tanstack/react-router'
import { IconArrowUpRight, IconInfoCircle } from '@tabler/icons-react'
import {
  moduleAreas,
  type ModuleArea,
  type ModuleEntry,
} from '../data/guide-content'

function ModuleTile({ module: entry }: { module: ModuleEntry }) {
  return (
    <Link
      to={entry.path}
      className="group flex flex-col rounded-md border border-slate-200/70 bg-white p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/40 dark:border-white/[0.07] dark:bg-white/5 dark:hover:border-sky-500/30 dark:hover:bg-white/8"
    >
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {entry.name}
        </h4>
        <IconArrowUpRight
          size={15}
          className="mt-0.5 shrink-0 text-slate-300 transition-colors group-hover:text-blue-600 dark:text-slate-600 dark:group-hover:text-sky-400"
        />
      </div>
      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
        {entry.summary}
      </p>
    </Link>
  )
}

function ModuleAreaSection({ area }: { area: ModuleArea }) {
  const Icon = area.icon
  return (
    <section className="space-y-3">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200/70 bg-white text-slate-600 dark:border-white/[0.07] dark:bg-white/5 dark:text-slate-300">
          <Icon size={18} />
        </span>
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {area.title}
          </h3>
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {area.description}
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {area.modules.map((entry) => (
          <ModuleTile key={entry.path} module={entry} />
        ))}
      </div>
    </section>
  )
}

export default function ModulesTab() {
  return (
    <div className="space-y-8">
      <div className="flex items-start gap-2 rounded-md border border-blue-200/60 bg-blue-50/50 px-4 py-3 text-sm text-blue-800 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-200">
        <IconInfoCircle size={18} className="mt-0.5 shrink-0" />
        <p>
          These are the modules available in the application. What you actually
          see in the sidebar depends on the permissions granted to your role
          under Administration &gt; Roles &amp; Permissions.
        </p>
      </div>

      {moduleAreas.map((area) => (
        <ModuleAreaSection key={area.id} area={area} />
      ))}
    </div>
  )
}

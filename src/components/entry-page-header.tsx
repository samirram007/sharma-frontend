import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ActiveInactiveStatusTypes } from '@/types/active-inactive-status'
import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'

type EntryPageHeaderProps = {
  /** TanStack Router path of the list page the back button navigates to. */
  backTo: string
  backLabel: string
  /** Route id param when editing; omit (or 'new') for a create page. */
  isEdit: boolean
  /** Row name shown as the page title in edit mode. */
  name?: string
  /** Page title in create mode, e.g. "Add New Currency". */
  createTitle: string
  /** Sentence shown under the title. */
  subtitle: string
  /** Icon (or initials) rendered in the header avatar. */
  avatar: ReactNode
  /** Optional row status — renders a colored badge next to the title. */
  status?: 'active' | 'inactive'
  /** Extra buttons rendered on the right (e.g. fiscal-year close/open). */
  actions?: ReactNode
}

/**
 * Shared page header for master-record entry pages ("/xxx/new" and detail
 * pages): back navigation, an icon avatar, the record title with a status
 * badge, and a contextual subtitle.
 */
export function EntryPageHeader({
  backTo,
  backLabel,
  isEdit,
  name,
  createTitle,
  subtitle,
  avatar,
  status,
  actions,
}: EntryPageHeaderProps) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm dark:border-white/[0.07] dark:bg-white/5">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="size-8">
          <Link to={backTo} aria-label={backLabel}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <Avatar className="size-10 rounded-lg border border-slate-200/70 dark:border-white/10">
          <AvatarFallback className="rounded-lg font-medium">
            {avatar}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {isEdit && name ? name : createTitle}
            </h2>
            {isEdit && status && (
              <Badge
                variant="outline"
                className={cn(
                  'capitalize',
                  ActiveInactiveStatusTypes.get(status),
                )}
              >
                {status}
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {subtitle}
          </p>
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  )
}

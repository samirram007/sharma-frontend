import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Main } from '@/layouts/components/main'
import { cn } from '@/lib/utils'

import { ActiveInactiveStatusTypes } from '@/types/active-inactive-status'
import { Route as CompanyListRoute } from '@/routes/_protected/masters/organization/_layout/company/_layout'
import { ArrowLeft, Building2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { ActionPages } from './components/action-page'
import { type Company } from './data/schema'

interface CompanyProps {
  data?: Company
}

export default function CompanyDetails(props: CompanyProps) {
  const { data } = props
  const isEdit = !!data

  return (
    <Main className="w-full">
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
        {/* Page header */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm dark:border-white/[0.07] dark:bg-white/5">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="size-8">
              <Link to={CompanyListRoute.to} aria-label="Back to company list">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Avatar className="size-10 rounded-lg border border-slate-200/70 dark:border-white/10">
              <AvatarFallback className="rounded-lg font-medium">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {isEdit ? data.name : 'Add New Company'}
                </h2>
                {isEdit && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'capitalize',
                      ActiveInactiveStatusTypes.get(data.status),
                    )}
                  >
                    {data.status}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {isEdit
                  ? `Manage organization details for ${data.name}.`
                  : 'Fill in the details below to create a new company.'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="mx-auto w-full max-w-3xl pb-8">
          <ActionPages
            currentRow={data}
            key={`companies-${data?.id ?? 'add'}`}
          />
        </div>
      </div>
    </Main>
  )
}

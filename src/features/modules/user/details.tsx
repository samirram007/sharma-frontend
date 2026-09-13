import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Main } from '@/layouts/components/main'
import { cn } from '@/lib/utils'

import { ActiveInactiveStatusTypes } from '@/types/active-inactive-status'
import { Route as UserListRoute } from '@/routes/_protected/administration/_layout/user/_layout'
import { ArrowLeft } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { ActionPages } from './components/action-page'
import { type User } from './data/schema'

interface UserProps {
  data?: User
}

export default function UserDetails(props: UserProps) {
  const { data } = props
  const isEdit = !!data
  const initials = data?.name
    ? data.name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : ''

  return (
    <Main className="min-w-full">
      <div className="flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
        {/* Page header */}
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm dark:border-white/[0.07] dark:bg-white/5">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="size-8">
              <Link to={UserListRoute.to} aria-label="Back to user list">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Avatar className="size-10 border border-slate-200/70 dark:border-white/10">
              {data?.avatar && <AvatarImage src={data.avatar} alt={data.name} />}
              <AvatarFallback className="font-medium">
                {initials || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {isEdit ? data.name : 'Add New User'}
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
                  ? `Manage account details for ${data.name}.`
                  : 'Fill in the details below to create a new user.'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="mx-auto w-full max-w-3xl pb-8">
          <ActionPages currentRow={data} key={isEdit ? `user-edit-${data.id}` : 'user-add'} />
        </div>
      </div>
    </Main>
  )
}

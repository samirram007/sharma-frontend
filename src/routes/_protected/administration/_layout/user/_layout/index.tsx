
import { roleQueryOptions } from '@/features/modules/role/data/queryOptions'
import { userQueryOptions } from '@/features/modules/user/data/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import React, { Suspense } from 'react'
const User = React.lazy(() =>
  import('@/features/modules/user')
)

export const Route = createFileRoute('/_protected/administration/_layout/user/_layout/',)({
  loader: async ({ context }) => {
    const { queryClient } = context

    const [users, roles] = await Promise.all([
      queryClient.ensureQueryData(userQueryOptions()),
      queryClient.ensureQueryData(roleQueryOptions()),
    ])

    // console.log(roles)

    return { users, roles }
  },
  component: () => {
    const { data: user } = useSuspenseQuery(userQueryOptions())
    const { data: roles } = useSuspenseQuery(roleQueryOptions())
    // const { roles } = React.useLoaderData()
    console.log(user)

    return (
      <Suspense fallback={<Loader className="animate-spin" />}>
        <User data={user?.data} roles={roles?.data} />
      </Suspense>
    )
  },
  errorComponent: () => <div>Error loading user data...</div>,
  pendingComponent: () => <Loader className="animate-spin" />,
})
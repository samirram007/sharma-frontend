import GeneralError from '@/features/errors/general-error'
import StateProvider from '@/features/modules/state/contexts/state-context'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Loader } from 'lucide-react'

export const Route = createFileRoute(
  '/_protected/masters/organization/_layout/state/_layout',
)({

  component: () => {
    //const { data: state } = useSuspenseQuery(stateQueryOptions())
    return (
      <StateProvider>
        <Outlet />
      </StateProvider >
    )
  },
  errorComponent: () => <GeneralError minimal />,
  pendingComponent: () => <Loader className="animate-spin" />,
})



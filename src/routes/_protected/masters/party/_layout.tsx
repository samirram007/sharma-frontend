
import ForbiddenError from '@/features/errors/403'
import GeneralError from '@/features/errors/general-error'
import Party from '@/features/masters/party'
import PartyProvider from '@/features/masters/party/context/party-context'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/masters/party/_layout')({
  component: () => {
    return (
      <PartyProvider>

        <Party />
      </PartyProvider>
    )
  },
  notFoundComponent: () => <ForbiddenError minimal />,
  errorComponent: () => <GeneralError minimal />,
})


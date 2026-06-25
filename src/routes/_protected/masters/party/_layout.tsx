
import GeneralError from '@/features/errors/general-error'
import NotFoundError from '@/features/errors/not-found-error'
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
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})


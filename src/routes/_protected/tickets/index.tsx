import { ticketQueryOptions } from '@/features/modules/ticket/data/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import Ticket from '@/features/modules/ticket'
import TicketProvider from '@/features/modules/ticket/contexts/ticket-context'

export const Route = createFileRoute('/_protected/tickets/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(ticketQueryOptions()),
  component: TicketsPage,
  errorComponent: () => (
    <div className="flex h-64 items-center justify-center">
      <p className="text-sm text-slate-500">
        Error loading tickets. Please try again.
      </p>
    </div>
  ),
  pendingComponent: () => (
    <div className="flex h-64 items-center justify-center">
      <Loader className="h-6 w-6 animate-spin text-slate-400" />
    </div>
  ),
})

function TicketsPage() {
  const { data: ticket } = useSuspenseQuery(ticketQueryOptions())
  return (
    <TicketProvider>
      <Ticket data={ticket?.data} />
    </TicketProvider>
  )
}

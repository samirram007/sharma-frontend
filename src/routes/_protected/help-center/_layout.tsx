import FaqProvider from '@/features/modules/faq/contexts/faq-context'
import TicketProvider from '@/features/modules/ticket/contexts/ticket-context'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Loader } from 'lucide-react'

export const Route = createFileRoute('/_protected/help-center/_layout')({
  component: () => {
    return (
      <FaqProvider>
        <TicketProvider>
          <Outlet />
        </TicketProvider>
      </FaqProvider>
    )
  },
  pendingComponent: () => <Loader className="animate-spin" />,
})

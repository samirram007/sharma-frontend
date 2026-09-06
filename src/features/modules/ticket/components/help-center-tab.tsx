import { ticketQueryOptions } from '../data/queryOptions'
import { useQuery } from '@tanstack/react-query'
import { ticketListSchema } from '../data/schema'
import { ticketStatusTypes, ticketPriorityTypes } from '../data/data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { IconPlus, IconSearch, IconLoader2 } from '@tabler/icons-react'
import { useState } from 'react'
import { useTicket } from '../contexts/ticket-context'

export default function TicketHelpCenterTab() {
  const { data, isLoading, isError } = useQuery(ticketQueryOptions())
  const tickets = ticketListSchema.safeParse(data?.data ?? []).success
    ? ticketListSchema.parse(data?.data ?? [])
    : []
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const { setOpen } = useTicket()

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      !searchQuery ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || ticket.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <IconLoader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md border border-dashed border-slate-200 p-8 text-center dark:border-white/[0.07]">
        <p className="text-sm text-slate-500">
          Unable to load tickets. Please try again later.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            className="w-full rounded-md border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm dark:border-white/[0.07] dark:bg-white/5"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button className="gap-1.5" onClick={() => setOpen('add')}>
          <IconPlus size={16} />
          New Ticket
        </Button>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter(null)}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-colors',
            !statusFilter
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300',
          )}
        >
          All
        </button>
        {['open', 'in_progress', 'resolved', 'closed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors capitalize',
              statusFilter === status
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300',
            )}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-200 p-8 text-center dark:border-white/[0.07]">
            <p className="text-sm text-slate-500">No tickets found.</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => {
            const statusColor = ticketStatusTypes.get(ticket.status) ?? ''
            const priorityColor = ticketPriorityTypes.get(ticket.priority) ?? ''
            return (
              <div
                key={ticket.id}
                className="rounded-md border border-slate-200/70 bg-white p-4 dark:border-white/[0.07] dark:bg-white/5"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    #{ticket.id} - {ticket.subject}
                  </h3>
                  <div className="flex shrink-0 gap-1.5">
                    <Badge
                      variant="outline"
                      className={cn('capitalize text-xs', statusColor)}
                    >
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={cn('capitalize text-xs', priorityColor)}
                    >
                      {ticket.priority}
                    </Badge>
                  </div>
                </div>
                <p className="mb-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                  {ticket.description}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  {ticket.category && (
                    <span className="capitalize">
                      {ticket.category.replace('_', ' ')}
                    </span>
                  )}
                  {ticket.createdAt && (
                    <span>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Ticket } from '../data/schema'
import {
  ticketStatusTypes,
  ticketPriorityTypes,
  ticketStatuses,
} from '../data/data'
import {
  useTicketResponseMutation,
  useTicketStatusMutation,
} from '../data/queryOptions'

interface Props {
  currentRow: Ticket
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewDialog({ currentRow, open, onOpenChange }: Props) {
  const [newMessage, setNewMessage] = useState('')
  const { mutate: addResponse, isPending: isAddingResponse } =
    useTicketResponseMutation(currentRow.id)
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useTicketStatusMutation(currentRow.id)

  const handleAddResponse = () => {
    if (!newMessage.trim()) return
    addResponse(
      { message: newMessage },
      {
        onSuccess: () => {
          setNewMessage('')
          toast.success('Response added successfully')
        },
      },
    )
  }

  const handleStatusChange = (status: string) => {
    updateStatus(status, {
      onSuccess: () => {
        toast.success(`Ticket status updated to ${status.replace('_', ' ')}`)
      },
    })
  }

  const statusBadgeColor = ticketStatusTypes.get(currentRow.status) ?? ''
  const priorityBadgeColor = ticketPriorityTypes.get(currentRow.priority) ?? ''

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle className="pr-8">{currentRow.subject}</DialogTitle>
          <DialogDescription>
            Ticket #{currentRow.id} &middot; Created{' '}
            {currentRow.createdAt
              ? new Date(currentRow.createdAt).toLocaleDateString()
              : '-'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Ticket Info */}
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className={cn('capitalize', statusBadgeColor)}
            >
              {currentRow.status.replace('_', ' ')}
            </Badge>
            <Badge
              variant="outline"
              className={cn('capitalize', priorityBadgeColor)}
            >
              {currentRow.priority}
            </Badge>
            {currentRow.category && (
              <Badge variant="outline" className="capitalize">
                {currentRow.category.replace('_', ' ')}
              </Badge>
            )}
          </div>

          {/* Description */}
          <div className="rounded-md border border-slate-200/70 bg-white p-3 dark:border-white/[0.07] dark:bg-white/5">
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {currentRow.description}
            </p>
          </div>

          {/* Status Actions */}
          <div className="flex flex-wrap gap-2">
            {ticketStatuses
              .filter((s) => s !== currentRow.status)
              .map((status) => (
                <Button
                  key={status}
                  variant="outline"
                  size="sm"
                  disabled={isUpdatingStatus}
                  onClick={() => handleStatusChange(status)}
                >
                  {isUpdatingStatus && (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  )}
                  Mark as {status.replace('_', ' ')}
                </Button>
              ))}
          </div>

          {/* Responses */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Responses ({currentRow.responses?.length ?? 0})
            </h3>
            {currentRow.responses && currentRow.responses.length > 0 ? (
              <div className="space-y-2">
                {currentRow.responses.map((response) => (
                  <div
                    key={response.id}
                    className="rounded-md border border-slate-200/70 bg-slate-50 p-3 dark:border-white/[0.07] dark:bg-white/3"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        {response.userName ?? 'User'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {response.createdAt
                          ? new Date(response.createdAt).toLocaleString()
                          : ''}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {response.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No responses yet.</p>
            )}
          </div>

          {/* Add Response */}
          <div className="space-y-2">
            <textarea
              className="w-full rounded-md border border-slate-200 bg-white p-3 text-sm dark:border-white/[0.07] dark:bg-white/5"
              placeholder="Type your response..."
              rows={3}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <Button
              size="sm"
              disabled={isAddingResponse || !newMessage.trim()}
              onClick={handleAddResponse}
            >
              {isAddingResponse && (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              )}
              Add Response
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Form } from '@/components/ui/form'

import { zodResolver } from '@hookform/resolvers/zod'

import FormInputField from '@/components/form-input-field'
import { useForm, type Resolver } from 'react-hook-form'
import { lowerCase } from '@/utils/removeEmptyStrings'

import { Loader2 } from 'lucide-react'
import { useTicketMutation } from '../data/queryOptions'
import { formSchema, type Ticket, type TicketForm } from '../data/schema'
import {
  ticketStatuses,
  ticketPriorities,
  ticketCategories,
} from '../data/data'

interface Props {
  currentRow?: Ticket
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActionDialog({ currentRow, open, onOpenChange }: Props) {
  const { mutate: saveTicket, isPending } = useTicketMutation()
  const isEdit = !!currentRow

  const form = useForm<TicketForm>({
    resolver: zodResolver(formSchema) as Resolver<TicketForm>,
    defaultValues: isEdit
      ? {
          ...currentRow,
          isEdit,
        }
      : {
          subject: '',
          description: '',
          status: 'open',
          priority: 'medium',
          category: 'general',
          isEdit,
        },
  })

  const moduleName = 'Ticket'
  const onSubmit = (values: TicketForm) => {
    form.reset()
    saveTicket(currentRow ? { ...values, id: currentRow.id } : values)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-left">
          <DialogTitle>
            {isEdit ? 'Edit ' : 'Create New '} {moduleName}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Update the ${lowerCase(moduleName)} here. `
              : `Create a new ${lowerCase(moduleName)} here. `}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="-mr-4 h-[26.25rem] w-full overflow-y-auto py-1 pr-4">
          <Form {...form}>
            <form
              id="ticket-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-0.5"
            >
              <FormInputField
                type="text"
                form={form}
                name="subject"
                label="Subject"
              />
              <FormInputField
                type="textarea"
                form={form}
                name="description"
                label="Description"
              />
              <FormInputField
                type="select"
                form={form}
                name="status"
                label="Status"
                items={ticketStatuses.map((s) => ({
                  label: s
                    .replace('_', ' ')
                    .replace(/\b\w/g, (c) => c.toUpperCase()),
                  value: s,
                }))}
              />
              <FormInputField
                type="select"
                form={form}
                name="priority"
                label="Priority"
                items={ticketPriorities.map((p) => ({
                  label: p.charAt(0).toUpperCase() + p.slice(1),
                  value: p,
                }))}
              />
              <FormInputField
                type="select"
                form={form}
                name="category"
                label="Category"
                items={ticketCategories.map((c) => ({
                  label: c
                    .replace('_', ' ')
                    .replace(/\b\w/g, (ch) => ch.toUpperCase()),
                  value: c,
                }))}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type="submit" form="ticket-form" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

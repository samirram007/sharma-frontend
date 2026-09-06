import { z } from 'zod'

export const ticketSchema = z.object({
  id: z.number().int().positive(),
  subject: z.string().min(1),
  description: z.string(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  category: z.string().nullish(),
  createdBy: z.number().nullish(),
  assignedTo: z.number().nullish(),
  companyId: z.number().nullish(),
  branchId: z.number().nullish(),
  resolvedAt: z.string().nullish(),
  createdAt: z.string().nullish(),
  updatedAt: z.string().nullish(),
  creator: z.object({ id: z.number(), name: z.string() }).nullish(),
  assignee: z.object({ id: z.number(), name: z.string() }).nullish(),
  responses: z
    .array(
      z.object({
        id: z.number(),
        ticketId: z.number(),
        userId: z.number(),
        userName: z.string().nullish(),
        message: z.string(),
        createdAt: z.string().nullish(),
        updatedAt: z.string().nullish(),
      }),
    )
    .nullish(),
})

export type Ticket = z.infer<typeof ticketSchema>
export const ticketListSchema = z.array(ticketSchema)
export type TicketList = z.infer<typeof ticketListSchema>

export const formSchema = z.object({
  subject: z.string().min(1, { message: 'Subject is required.' }),
  description: z.string().min(1, { message: 'Description is required.' }),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).default('open'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  category: z.string().nullish(),
  assignedTo: z.coerce.number().nullish(),
  isEdit: z.boolean(),
})

export type TicketForm = z.infer<typeof formSchema>

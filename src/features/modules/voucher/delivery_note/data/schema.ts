
import { z } from 'zod';
import { voucherSchema } from '../../data-schema/voucher-schema';


export const deliveryNoteSchema = voucherSchema.extend({
})
export type DeliveryNoteSchema = z.infer<typeof deliveryNoteSchema>
export const deliveryNoteListSchema = z.array(deliveryNoteSchema)
export type DeliveryNoteList = z.infer<typeof deliveryNoteListSchema>



export const formSchema = deliveryNoteSchema.extend({ 
    isEdit: z.boolean(),
}).omit({
  id: true,
  })

export type DeliveryNoteForm = z.infer<typeof formSchema>
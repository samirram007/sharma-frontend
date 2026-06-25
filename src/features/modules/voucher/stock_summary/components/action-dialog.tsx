'use client'


import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form
} from '@/components/ui/form'



import { zodResolver } from '@hookform/resolvers/zod'

import { useForm } from 'react-hook-form'

import FormInputField from '@/components/form-input-field'

import { formSchema, type StockSummarySchema } from '../data/schema'
import type { StockSummaryForm } from '../types/types'






interface Props {
  currentRow?: StockSummarySchema
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActionDialog({ currentRow, open, onOpenChange }: Props) {


  const isEdit = !!currentRow

  const form = useForm<StockSummaryForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
        ...currentRow, isEdit,
      }
      : {
        name: '',
        code: '',
        description: '',
        status: 'active',
        isEdit,
      },
  })



  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-left border-b-2 pb-2'>
          <DialogTitle>{isEdit ? 'Edit Day Book' : 'Add New Day Book'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the Day Book here. ' : 'Create new Day Book here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='-mr-4 h-auto w-full overflow-y-auto py-1 pr-4'>
          <Form {...form}>

            <FormInputField type='text' form={form} name='name' label='Name' />
            <FormInputField type='text' form={form} name='code' label='Code' />

            <FormInputField type='textarea' form={form} name='description' label='Description (optional)' />

            <FormInputField type='checkbox' form={form} name='status' label='Status' options={[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]} />




          </Form>
        </div>
        <DialogFooter>

        </DialogFooter>
      </DialogContent>
    </Dialog >
  )
}

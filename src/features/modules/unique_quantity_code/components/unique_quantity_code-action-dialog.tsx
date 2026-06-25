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
import {
  Form
} from '@/components/ui/form'


import { showSubmittedData } from '@/utils/show-submitted-data'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useForm } from 'react-hook-form'

import FormInputField from '@/components/form-input-field'

import { storeUniqueQuantityCodeService, updateUniqueQuantityCodeService } from '../data/api'
import { formSchema, type UniqueQuantityCode } from '../data/schema'
import type { UniqueQuantityCodeForm } from '../types/types'
import QuantityTypeSelect from './quantity_type-select'





interface Props {
  currentRow?: UniqueQuantityCode
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UniqueQuantityCodeActionDialog({ currentRow, open, onOpenChange }: Props) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const mutateUniqueQuantityCode = useMutation({
    mutationFn: async (data: UniqueQuantityCodeForm) => {
      // Here you would typically make an API call to save the account group
      // For example:
      console.log('Saving account group:', data);
      if (isEdit && currentRow) {
        return await updateUniqueQuantityCodeService({ ...data, id: currentRow.id })
      }
      else if (!isEdit) {
        return await storeUniqueQuantityCodeService(data);
      }
    },
    onSuccess: (data) => {
      console.log(data, 'Unique Quantity Code saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['UniqueQuantityCodes'] })
    },
  })

  const form = useForm<UniqueQuantityCodeForm>({
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

  const onSubmit = (values: UniqueQuantityCodeForm) => {

    form.reset()
    showSubmittedData(values)
    mutateUniqueQuantityCode.mutate(values)
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
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-left border-b-2 pb-2'>
          <DialogTitle>{isEdit ? 'Edit Unique Quantity Code' : 'Add New Unique Quantity Code'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the Unique Quantity Code here. ' : 'Create new Unique Quantity Code here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='-mr-4 h-[26.25rem] w-full overflow-y-auto py-1 pr-4'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 p-0.5'
            >
              <FormInputField type='text' form={form} name='name' label='Name' />
              <FormInputField type='text' form={form} name='code' label='Code' />

              <FormInputField type='textarea' form={form} name='description' label='Description (optional)' />
              <QuantityTypeSelect form={form} />




            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='user-form'>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  )
}

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

import { storeStockCategoryService, updateStockCategoryService } from '../data/api'
import { formSchema, type StockCategory } from '../data/schema'
import type { StockCategoryForm } from '../types/types'
import VoucherCategoryDropdown from './stock_category-dropdown'





interface Props {
  currentRow?: StockCategory
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StockCategoryActionDialog({ currentRow, open, onOpenChange }: Props) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const mutateStockCategory = useMutation({
    mutationFn: async (data: StockCategoryForm) => {
      // Here you would typically make an API call to save the account group
      // For example:
      console.log('Saving account group:', data);
      if (isEdit && currentRow) {
        return await updateStockCategoryService({ ...data, id: currentRow.id })
      }
      else if (!isEdit) {
        return await storeStockCategoryService(data);
      }
    },
    onSuccess: (data) => {
      console.log(data, 'Account Group saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['StockCategory'] })
    },
  })

  const form = useForm<StockCategoryForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
        ...currentRow, isEdit,
      }
      : {
        name: '',
        code: '',
        description: '',
        parentId: 1,
        status: 'active',
        isEdit,
      },
  })

  const onSubmit = (values: StockCategoryForm) => {
    values.parentId = Number(values.parentId) || undefined
    form.reset()
    showSubmittedData(values)
    mutateStockCategory.mutate(values)
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
          <DialogTitle>{isEdit ? 'Edit Stock Category' : 'Add New Stock Category'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the stock category here. ' : 'Create new stock category here. '}
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
              <VoucherCategoryDropdown form={form} />
              <FormInputField type='textarea' form={form} name='description' label='Description (optional)' />
              <FormInputField type='checkbox' form={form} name='status' label='Status' options={[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
              ]} />



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

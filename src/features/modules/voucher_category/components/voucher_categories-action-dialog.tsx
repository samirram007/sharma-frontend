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

import type { VoucherCategory } from '@/features/modules/voucher_category/data/schema'
import { showSubmittedData } from '@/utils/show-submitted-data'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import FormInputField from '@/components/form-input-field'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { storeVoucherCategoryService, updateVoucherCategoryService } from '../data/api'

const formSchema = z
  .object({
    name: z
      .string()
      .min(1, { message: 'Name is required.' }),
    code: z
      .string()
      .min(1, { message: 'Role is required.' }),
    status: z
      .string()
      .min(1, { message: 'Status is required.' }),
    description: z.string().min(1, { message: 'Description is required.' }),
    accountingEffect: z
      .string()
      .min(1, { message: 'Accounting effect is required.' })
      .optional(),
    isEdit: z.boolean(),
  })

type VoucherCategoryForm = z.infer<typeof formSchema>

interface Props {
  currentRow?: VoucherCategory
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VoucherCategorysActionDialog({ currentRow, open, onOpenChange }: Props) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const mutateVoucherCategory = useMutation({
    mutationFn: async (data: VoucherCategoryForm) => {
      // Here you would typically make an API call to save the voucher category
      // For example:
      console.log('Saving voucher category:', data);
      if (isEdit && currentRow) {
        return await updateVoucherCategoryService({ ...data, id: currentRow.id })

        // await queryClient.invalidateQueries({
        //   queryKey: ['voucherCategorys', { id: currentRow.id }],
        // })
        // return { ...currentRow, ...data }
      }
      else if (!isEdit) {
        return await storeVoucherCategoryService(data);
      }
    },
    onSuccess: (data) => {
      console.log(data, 'Voucher Category saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['voucherCategorys'] })
      // queryClient.setQueryData(['voucherCategorys', { id: currentRow.id }], data)
      // showSubmittedData(data, 'Voucher Category saved successfully!')
    },
  })

  const form = useForm<VoucherCategoryForm>({
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
        accountingEffect: 'debit',
        isEdit,
      },
  })

  const onSubmit = (values: VoucherCategoryForm) => {
    form.reset()
    showSubmittedData(values)
    mutateVoucherCategory.mutate(values)
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
        <DialogHeader className='text-left'>
          <DialogTitle>{isEdit ? 'Edit Voucher Category' : 'Add New Voucher Category'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the voucher category here. ' : 'Create new voucher category here. '}
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
              <FormInputField type='checkbox' form={form} name='status' label='Status'
                options={[{ label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' }
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

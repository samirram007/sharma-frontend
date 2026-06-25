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

import { formSchema, type VoucherClassification } from '@/features/modules/voucher_classification/data/schema'
import { showSubmittedData } from '@/utils/show-submitted-data'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useForm } from 'react-hook-form'

import FormInputField from '@/components/form-input-field'
import { storeVoucherClassificationService, updateVoucherClassificationService } from '../data/api'
import type { VoucherClassificationForm } from '../types/types'
import VoucherTypeDropdown from './voucher_type-dropdown'





interface Props {
  currentRow?: VoucherClassification
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VoucherClassificationsActionDialog({ currentRow, open, onOpenChange }: Props) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const mutateVoucherClassification = useMutation({
    mutationFn: async (data: VoucherClassificationForm) => {
      if (isEdit && currentRow) {
        return await updateVoucherClassificationService({ ...data, id: currentRow.id })
      }
      else if (!isEdit) {
        return await storeVoucherClassificationService(data);
      }
    },
    onSuccess: (data) => {
      console.log(data, 'Voucher Classification saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['voucherClassifications'] })
    },
  })

  const form = useForm<VoucherClassificationForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
        ...currentRow,
        isEdit,
        name: currentRow.name ?? '',
        code: currentRow.code ?? '',
        status: currentRow.status,
        voucherTypeId: currentRow.voucherTypeId ?? 1,
        description: currentRow.description ?? '',
        defaultValue: currentRow.defaultValue ?? 0,
        percentage: currentRow.percentage ?? 0,
        inclusionRules: currentRow.inclusionRules ?? [],
        exclusionRules: currentRow.exclusionRules ?? [],
      }
      : {
        name: '',
        code: '',
        description: '',
        voucherTypeId: 1,
        status: 'active',
        defaultValue: 0,
        percentage: 0,
        inclusionRules: [],
        exclusionRules: [],
        isEdit,
      },
  })

  const onSubmit = (values: VoucherClassificationForm) => {
    values.voucherTypeId = Number(values.voucherTypeId)
    values.defaultValue = Number(values.defaultValue)
    values.percentage = Number(values.percentage)
    form.reset()
    showSubmittedData(values)
    mutateVoucherClassification.mutate(values)
    onOpenChange(false)
  }

  console.log(form.getValues(), 'Form Values')
  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader className='text-left border-b pb-2'>
          <DialogTitle>{isEdit ? 'Edit Voucher Classification' : 'Add New Voucher Classification'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the voucher classification here. ' : 'Create new voucher classification here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='-mr-4 h-[32rem] w-full overflow-y-auto py-1 pr-4'>
          <Form {...form}>
            <form
            id='user-form'
            onSubmit={form.handleSubmit(onSubmit as any)}
            className='space-y-4 p-0.5'
            >              <div className="grid grid-cols-2 gap-4">
                <FormInputField type='text' form={form} name='name' label='Name' />
                <FormInputField type='text' form={form} name='code' label='Code' />
              </div>
              <VoucherTypeDropdown form={form} />
              <div className="grid grid-cols-2 gap-4">
                <FormInputField type='number' form={form} name='defaultValue' label='Default Value' />
                <FormInputField type='number' form={form} name='percentage' label='Percentage (%)' />
              </div>
              <FormInputField type='textarea' form={form} name='description' label='Description (optional)' />
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Inclusion Rules (JSON)</label>
                <FormInputField type='textarea' form={form} name='inclusionRules' label='' placeholder='e.g. {"groups": [1, 2], "ledgers": [5]}' />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Exclusion Rules (JSON)</label>
                <FormInputField type='textarea' form={form} name='exclusionRules' label='' placeholder='e.g. {"ledgers": [10, 11]}' />
              </div>

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

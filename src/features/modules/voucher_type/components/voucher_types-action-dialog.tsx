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

import {
  formSchema,
  type VoucherType,
} from '@/features/modules/voucher_type/data/schema'
import { showSubmittedData } from '@/utils/show-submitted-data'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useForm } from 'react-hook-form'

import FormInputField from '@/components/form-input-field'
import { storeVoucherTypeService, updateVoucherTypeService } from '../data/api'
import type { VoucherTypeForm } from '../types/types'
import VoucherCategoryDropdown from './voucher_category-dropdown'
import VoucherClassificationDropdown from './voucher_classification-dropdown'

interface Props {
  currentRow?: VoucherType
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VoucherTypesActionDialog({
  currentRow,
  open,
  onOpenChange,
}: Props) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const mutateVoucherType = useMutation({
    mutationFn: async (data: VoucherTypeForm) => {
      // Here you would typically make an API call to save the account group
      // For example:
      console.log('Saving account group:', data)
      if (isEdit && currentRow) {
        return await updateVoucherTypeService({ ...data, id: currentRow.id })
      } else if (!isEdit) {
        return await storeVoucherTypeService(data)
      }
    },
    onSuccess: (data) => {
      console.log(data, 'Account Group saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['voucherTypes'] })
    },
  })

  const form = useForm<VoucherTypeForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          ...currentRow,
          isEdit,
          name: currentRow.name ?? '',
          code: currentRow.code ?? '',
          description: currentRow.description ?? '',
          voucherCategoryId: currentRow.voucherCategoryId ?? 1,
          status: currentRow.status,
          voucherClassificationId:
            currentRow.voucherClassificationId ?? undefined,
          icon: currentRow.icon ?? undefined,
        }
      : {
          name: '',
          code: '',
          description: '',
          voucherCategoryId: 1,
          status: 'active',
          isEdit,
        },
  })

  const onSubmit = (values: VoucherTypeForm) => {
    const formattedValues = {
      ...values,
      voucherCategoryId: Number(values.voucherCategoryId),
      voucherClassificationId: values.voucherClassificationId
        ? Number(values.voucherClassificationId)
        : undefined,
    }
    form.reset()
    showSubmittedData(formattedValues)
    mutateVoucherType.mutate(formattedValues)
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
        <DialogHeader className="text-left border-b-2 pb-2">
          <DialogTitle>
            {isEdit ? 'Edit Voucher Type' : 'Add New Voucher Type'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the voucher type here. '
              : 'Create new voucher type here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="-mr-4 h-[26.25rem] w-full overflow-y-auto py-1 pr-4">
          <Form {...form}>
            <form
              id="user-form"
              onSubmit={form.handleSubmit(onSubmit as any)}
              className="space-y-4 p-0.5"
            >
              {' '}
              <FormInputField
                type="text"
                form={form}
                name="name"
                label="Name"
              />
              <FormInputField
                type="text"
                form={form}
                name="code"
                label="Code"
              />
              <VoucherCategoryDropdown form={form} />
              <VoucherClassificationDropdown form={form} />
              <FormInputField
                type="textarea"
                form={form}
                name="description"
                label="Description (optional)"
              />
              <FormInputField
                type="checkbox"
                form={form}
                name="status"
                label="Status"
                options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
                ]}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type="submit" form="user-form">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

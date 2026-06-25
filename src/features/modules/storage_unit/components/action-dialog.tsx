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

import type { StorageUnit, StorageUnitForm } from '@/features/modules/storage_unit/data/schema'
import { showSubmittedData } from '@/utils/show-submitted-data'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import FormInputField from '@/components/form-input-field'
import { useForm } from 'react-hook-form'
import { lowerCase } from '../../../../utils/removeEmptyStrings'
import { storeStorageUnitService, updateStorageUnitService } from '../data/api'
import { formSchema } from '../data/schema'



interface Props {
  currentRow?: StorageUnit
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActionDialog({ currentRow, open, onOpenChange }: Props) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const mutateStorageUnit = useMutation({
    mutationFn: async (data: StorageUnitForm) => {
      // Here you would typically make an API call to save the StorageUnit
      // For example:
      console.log('Saving StorageUnit:', data);
      if (isEdit && currentRow) {
        return await updateStorageUnitService({ ...data, id: currentRow.id })
      }
      else if (!isEdit) {
        return await storeStorageUnitService(data);
      }
    },
    onSuccess: (data) => {
      console.log(data, 'StorageUnit saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['storageunits'] })
    },
  })

  const form = useForm<StorageUnitForm>({
    resolver: zodResolver(formSchema) as never,
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
  //  const storageunitStatusOptions: ActiveInactiveStatus[] = ['active', 'inactive'];

  const moduleName = "StorageUnit"
  const onSubmit = (values: StorageUnitForm) => {
    form.reset()
    showSubmittedData(values)
    mutateStorageUnit.mutate(values)
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
          <DialogTitle>{isEdit ? 'Edit ' : 'Add New '} {moduleName}</DialogTitle>
          <DialogDescription>
            {isEdit ? `Update the ${lowerCase(moduleName)} here. `
              : `Create new ${lowerCase(moduleName)} here. `}
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

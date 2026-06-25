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

import type { DeliveryPlace, DeliveryPlaceForm } from '@/features/modules/delivery_place/data/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import FormInputField from '@/components/form-input-field'
import { useForm, useWatch } from 'react-hook-form'
import { lowerCase } from '../../../../utils/removeEmptyStrings'
import { storeDeliveryPlaceService, updateDeliveryPlaceService } from '../data/api'
import { formSchema } from '../data/schema'

import { useEffect } from 'react'


interface Props {
  currentRow?: DeliveryPlace
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActionDialog({ currentRow, open, onOpenChange }: Props) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const mutateDeliveryPlace = useMutation({
    mutationFn: async (data: DeliveryPlaceForm) => {
      if (isEdit && currentRow) {
        return await updateDeliveryPlaceService({ ...data, id: currentRow.id })
      }
      else if (!isEdit) {
        return await storeDeliveryPlaceService(data);
      }
    },
    onSuccess: () => {
    //console.log('Delivery Place saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['deliveryPlaces'] })
      form.reset()
      onOpenChange(false)
    },
    onError: () => {
    // console.log('Error saving Delivery Place:', error)
    },
  })

  const form = useForm<DeliveryPlaceForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
        ...currentRow, isEdit,
      }
      : {
        name: '',
        code: '',
        placeType: 'destination',
        status: 'active',

        isEdit,
      },
  })
  //const deliveryPlaceStatusOptions: ActiveInactiveStatus[] = ['active', 'inactive'];
  const name = useWatch({
    control: form.control,
    name: 'name',
  })

  const code = name?.toUpperCase().replace(/\s+/g, '_') || ''

  const moduleName = "Delivery Place"
  const onSubmit = (values: DeliveryPlaceForm) => {

    mutateDeliveryPlace.mutate(values)

  }



  useEffect(() => {
    form.setValue('code', code)
  }, [code])
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
        <div className='-mr-4 h-full w-full overflow-y-auto py-1 pr-4'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 p-0.5'
            >
              <FormInputField type='text' form={form} name='name' label='Name' />
              <FormInputField type='text' form={form} name='code' label='Code' />
              {/* <PlaceTypeDropdown form={form} gapClass='grid grid-cols-[110px_1fr]' /> */}
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

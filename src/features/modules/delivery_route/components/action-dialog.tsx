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

import type { DeliveryRoute, DeliveryRouteForm } from '@/features/modules/delivery_route/data/schema'
import { zodResolver } from '@hookform/resolvers/zod'

import FormInputField from '@/components/form-input-field'
import { useForm, type Resolver } from 'react-hook-form'
import { lowerCase } from '../../../../utils/removeEmptyStrings'
import { formSchema } from '../data/schema'

import { useDeliveryRouteMutation } from '../data/queryOptions'
import SourcePlaceDropdown from './source-dropdown'
import DestinationPlaceDropdown from './destination-dropdown'
import TransporterDropdown from './transporter-dropdown'


interface Props {
  currentRow?: DeliveryRoute
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActionDialog({ currentRow, open, onOpenChange }: Props) {
  const isEdit = !!currentRow
  const { mutate: mutateDeliveryRoute, isPending } = useDeliveryRouteMutation()

  const form = useForm<DeliveryRouteForm>({
    resolver: zodResolver(formSchema) as Resolver<DeliveryRouteForm>,
    defaultValues: isEdit
      ? {
        ...currentRow, isEdit,
      }
      : {

        transporterId: undefined,
        sourcePlaceId: 1,
        destinationPlaceId: undefined,
        vehicleNo: '',
        distanceKm: undefined,
        estimatedTimeInMinutes: undefined,
        rate: undefined,
        rateUnitId: 16,
        isEdit,
      },
  })
  //const deliveryRouteStatusOptions: ActiveInactiveStatus[] = ['active', 'inactive'];

  const moduleName = "Transporter Route"
  const onSubmit = (values: DeliveryRouteForm) => {
    if (isPending) return; 

    mutateDeliveryRoute(currentRow ? { ...values, id: currentRow.id } : values)
    form.reset()
    //showSubmittedData(values)
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
        <div className='-mr-4 h-105 w-full overflow-y-auto py-1 pr-4'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 p-0.5'
            >
              <TransporterDropdown form={form} gapClass='grid grid-cols-[150px_1fr] gap-2' name="transporterId" label="Transporter" />
              <SourcePlaceDropdown form={form} gapClass='grid grid-cols-[150px_1fr] gap-2' name="sourcePlaceId" />
              <DestinationPlaceDropdown form={form} gapClass='grid grid-cols-[150px_1fr] gap-2' name="destinationPlaceId" />
              <FormInputField type='text' gapClass='grid grid-cols-[150px_1fr] gap-2' form={form} name='vehicleNo' label='Vehicle No' />
              {/* <FormInputField type='number' gapClass='grid grid-cols-[150px_1fr] gap-2' form={form} name='distanceKm' label='Distance (Km)' />
              <FormInputField type='number' gapClass='grid grid-cols-[150px_1fr] gap-2' form={form} name='estimatedTimeInMinutes' label='Estimated Time (Minutes)' /> */}
              <FormInputField type='number' gapClass='grid grid-cols-[150px_1fr] gap-2' form={form} name='rate' label='Rate/MT' /> 
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

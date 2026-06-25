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

import type { Country, CountryForm } from '@/features/modules/country/data/schema'
import { showSubmittedData } from '@/utils/show-submitted-data'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import FormInputField from '@/components/form-input-field'
import { useForm } from 'react-hook-form'
import { lowerCase } from '../../../../utils/removeEmptyStrings'
import { storeCountryService, updateCountryService } from '../data/api'
import { formSchema } from '../data/schema'



interface Props {
  currentRow?: Country
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActionDialog({ currentRow, open, onOpenChange }: Props) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const mutateCountry = useMutation({
    mutationFn: async (data: CountryForm) => {
      // Here you would typically make an API call to save the Country
      // For example:
      console.log('Saving Country:', data);
      if (isEdit && currentRow) {
        return await updateCountryService({ ...data, id: currentRow.id })
      }
      else if (!isEdit) {
        return await storeCountryService(data);
      }
    },
    onSuccess: (data) => {
      console.log(data, 'Country saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['countrys'] })
    },
  })

  const form = useForm<CountryForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
        ...currentRow, isEdit,
      }
      : {
        name: '',
        isoCode: '',
        phoneCode: '',
        isEdit,
      },
  })
  //  const countryStatusOptions: ActiveInactiveStatus[] = ['active', 'inactive'];

  const moduleName = "Country"
  const onSubmit = (values: CountryForm) => {
    form.reset()
    showSubmittedData(values)
    mutateCountry.mutate(values)
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

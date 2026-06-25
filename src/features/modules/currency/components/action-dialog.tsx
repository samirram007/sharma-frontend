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

import type { Currency, CurrencyForm } from '@/features/modules/currency/data/schema'
import { showSubmittedData } from '@/utils/show-submitted-data'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import FormInputField from '@/components/form-input-field'
import { useForm } from 'react-hook-form'
import { lowerCase } from '../../../../utils/removeEmptyStrings'
import { storeCurrencyService, updateCurrencyService } from '../data/api'
import { formSchema } from '../data/schema'
import AccountEffectDropdown from './country-dropdown'


interface Props {
  currentRow?: Currency
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActionDialog({ currentRow, open, onOpenChange }: Props) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const mutateCurrency = useMutation({
    mutationFn: async (data: CurrencyForm) => {
      // Here you would typically make an API call to save the Currency
      // For example:
      console.log('Saving Currency:', data);
      if (isEdit && currentRow) {
        return await updateCurrencyService({ ...data, id: currentRow.id })
      }
      else if (!isEdit) {
        return await storeCurrencyService(data);
      }
    },
    onSuccess: (data) => {
      console.log(data, 'Currency saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['currencys'] })
    },
  })

  const form = useForm<CurrencyForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
        ...currentRow, isEdit,
      }
      : {
        name: '',
        code: '',
        status: 'active',
        isEdit,
      },
  })
  //  const currencyStatusOptions: ActiveInactiveStatus[] = ['active', 'inactive'];

  const moduleName = "Currency"
  const onSubmit = (values: CurrencyForm) => {
    form.reset()
    showSubmittedData(values)
    mutateCurrency.mutate(values)
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
        <div className='-mr-4 h-full w-full overflow-y-auto py-1 pr-4'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 p-0.5'
            >
              <FormInputField type='text' form={form} name='name' label='Name' />
              <FormInputField type='text' form={form} name='code' label='Code' />
              <AccountEffectDropdown form={form} />
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

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

import type { FiscalYear, FiscalYearForm } from '@/features/modules/fiscal_year/data/schema'
import { showSubmittedData } from '@/utils/show-submitted-data'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import FormInputField from '@/components/form-input-field'
import { useForm } from 'react-hook-form'
import { lowerCase } from '../../../../utils/removeEmptyStrings'
import { storeFiscalYearService, updateFiscalYearService } from '../data/api'
import { defaultValues } from '../data/data'
import { formSchema } from '../data/schema'



interface Props {
  currentRow?: FiscalYear
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActionDialog({ currentRow, open, onOpenChange }: Props) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const mutateFiscalYear = useMutation({
    mutationFn: async (data: FiscalYearForm) => {
      // Here you would typically make an API call to save the FiscalYear
      // For example:
      console.log('Saving FiscalYear:', data);
      if (isEdit && currentRow) {
        return await updateFiscalYearService({ ...data, id: currentRow.id })
      }
      else if (!isEdit) {
        return await storeFiscalYearService(data);
      }
    },
    onSuccess: (data) => {
      console.log(data, 'FiscalYear saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['fiscalyears'] })
    },
  })

  const form = useForm<any>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit && currentRow
      ? {
        ...currentRow,
        isEdit,
      }
      : defaultValues,
  })
  //  const fiscalyearStatusOptions: ActiveInactiveStatus[] = ['active', 'inactive'];

  const moduleName = "FiscalYear"
  const onSubmit = (values: FiscalYearForm) => {
    form.reset()
    showSubmittedData(values)
    mutateFiscalYear.mutate(values)
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

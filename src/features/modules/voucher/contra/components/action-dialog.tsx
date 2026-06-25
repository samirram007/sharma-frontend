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

import FormInputField from '@/components/form-input-field'
import { useForm } from 'react-hook-form'

import { lowerCase } from '@/utils/removeEmptyStrings'
import { storeContraService, updateContraService } from '../data/api'
import { formSchema, type Contra, type ContraForm } from '../data/schema'



interface Props {
  currentRow?: Contra
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActionDialog({ currentRow, open, onOpenChange }: Props) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const mutateContra = useMutation({
    mutationFn: async (data: ContraForm) => {
  // Here you would typically make an API call to save the Contra
      // For example:
      console.log('Saving Contra:', data);
      if (isEdit && currentRow) {
        return await updateContraService({ ...data, id: currentRow.id })
      }
      else if (!isEdit) {
        return await storeContraService(data);
      }
    },
    onSuccess: (data) => {
      console.log(data, 'Contra saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['contras'] })
    },
  })

  const form = useForm<ContraForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
        ...currentRow, isEdit,
      }
      : {
        name: '',
        code: '',  
        isEdit,
      },
  })
  //  const contraStatusOptions: ActiveInactiveStatus[] = ['active', 'inactive'];

  const moduleName = "Contra"
  const onSubmit = (values: ContraForm) => {
    form.reset()
    showSubmittedData(values)
    mutateContra.mutate(values)
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

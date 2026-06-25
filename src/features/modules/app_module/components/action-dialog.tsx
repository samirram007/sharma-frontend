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

import { useForm } from 'react-hook-form'

import FormInputField from '@/components/form-input-field'

import { Loader2 } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useAppModuleMutation } from '../data/queryOptions'
import { formSchema, type AppModule } from '../data/schema'
import type { AppModuleForm } from '../types/types'






interface Props {
  currentRow?: AppModule
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActionDialog({ currentRow, open, onOpenChange }: Props) {

  const { mutate: saveAppModule, isPending } = useAppModuleMutation()
  const isEdit = !!currentRow

  const form = useForm<AppModuleForm>({
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
        isEdit,
      },
  })

  const onSubmit = (values: AppModuleForm) => {
    const formattedName = values.name
      .replace(/_/g, ' ')                 // Replace underscores with spaces
      .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize each word

    // Update the form values
    const formattedValues = {
      ...values,
      name: formattedName.trim(),
    }
    form.reset()
    showSubmittedData(formattedValues)
    saveAppModule(
      currentRow ? { ...values, id: currentRow.id } : values
    )
    onOpenChange(false)
  }
  const name = form.watch("name")

  const code = useMemo(() => {
    return name
      ? name.toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "")
      : ""
  }, [name])

  // reflect it in the input
  useEffect(() => {
    form.setValue("code", code)
    form.setValue("description", code)
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
        <DialogHeader className='text-left border-b-2 pb-2'>
          <DialogTitle>{isEdit ? 'Edit App Module' : 'Add New App Module'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the App Module here. ' : 'Create new App Module here. '}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='-mr-4 h-auto w-full overflow-y-auto py-1 pr-4'>
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
          <Button type='submit' form='user-form' disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  )
}

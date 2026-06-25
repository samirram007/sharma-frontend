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

import { useForm, type Resolver } from 'react-hook-form'

import FormInputField from '@/components/form-input-field'

import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useAppModuleFeatureMutation } from '../data/queryOptions'
import { formSchema, type AppModuleFeature } from '../data/schema'
import type { AppModuleFeatureForm } from '../types/types'
import AppModuleForm from './dropdown/app_module-form'






interface Props {
  currentRow?: AppModuleFeature
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActionDialog({ currentRow, open, onOpenChange }: Props) {

  const { mutate: saveAppModuleFeature, isPending } = useAppModuleFeatureMutation()
  const isEdit = !!currentRow

  const form = useForm<AppModuleFeatureForm>({
    resolver: zodResolver(formSchema) as Resolver<AppModuleFeatureForm>,
    defaultValues: isEdit
      ? {
        ...currentRow, isEdit,
      }
      : {
        name: '',
        code: '',
        description: '',
        status: 'active',
        appModuleId: undefined,
        isEdit,
      },
    mode: 'onChange',
  })

  const onSubmit = (values: AppModuleFeatureForm) => {
    values.appModuleId = Number(values.appModuleId)
    form.reset({
      ...form.getValues(),
      name: "",
      code: "",
      description: "",
    })
    showSubmittedData(values)
    saveAppModuleFeature(
      currentRow ? { ...values, id: currentRow.id } : values
    )
    // onOpenChange(false)
  }
  const name = form.watch("name")
  const appModule = form.watch("appModule")
  const code = useMemo(() => {
    return name
      ? appModule?.code + "_" + name.toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_]/g, "")
      : ""
  }, [name, appModule])

  // reflect it in the input
  useEffect(() => {
    if (form.formState.isDirty) {
      form.setValue("code", code, { shouldDirty: true })
      form.setValue("description", code, { shouldDirty: true })
    }
  }, [code, form])
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
          <DialogTitle>{isEdit ? 'Edit Module Feature' : 'Add New Module Feature'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the  Module Feature here. ' : 'Create new  Module Feature here. '}
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
              <AppModuleForm form={form} />
              <FormInputField type='text' form={form} name='name' label='Name' />
              <div className='grid grid-cols-[120px_1fr] gap-2 -mt-3 items-start text-sm text-muted-foreground'>
                <div>sample:</div>
                <div className='flex flex-row gap-4'>

                  <Badge className='cursor-pointer' onClick={() => { form.setValue('name', 'View') }}>View</Badge>
                  <Badge className='cursor-pointer' onClick={() => { form.setValue('name', 'Create') }}>Create</Badge>
                  <Badge className='cursor-pointer' onClick={() => { form.setValue('name', 'Edit') }}>Edit</Badge>
                  <Badge className='cursor-pointer' onClick={() => { form.setValue('name', 'Delete') }}>Delete</Badge>
                </div>
              </div>
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

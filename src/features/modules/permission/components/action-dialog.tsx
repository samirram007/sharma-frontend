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


import { zodResolver } from '@hookform/resolvers/zod'

import { useForm, type Resolver } from 'react-hook-form'
import { lowerCase } from '../../../../utils/removeEmptyStrings'

import FormInputField from '@/components/form-input-field'
import { showSubmittedData } from '@/utils/show-submitted-data'
import { Loader2 } from 'lucide-react'
import { usePermissionMutation } from '../data/queryOptions'
import { formSchema, type Permission, type PermissionForm } from '../data/schema'
import AppModuleFetureDropdown from './app_module_feature-dropdown'
import RoleDropdown from './role-dropdown'


interface Props {
  currentRow?: Permission
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActionDialog({ currentRow, open, onOpenChange }: Props) {
  const { mutate: savePermission, isPending } = usePermissionMutation()
  const isEdit = !!currentRow

  const form = useForm<PermissionForm>({
    resolver: zodResolver(formSchema) as Resolver<PermissionForm>,
    defaultValues: isEdit
      ? {
        ...currentRow, isEdit,
      }
      : {
        roleId: undefined,
        appModuleFeatureId: undefined,
        isAllowed: true,
        isEdit,
      },
  })


  const moduleName = "Permission"
  const onSubmit = (values: PermissionForm) => {
    form.reset()
    showSubmittedData(values)
    savePermission(
      currentRow ? { ...values, id: currentRow.id } : values
    )
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
              <RoleDropdown form={form} />
              <AppModuleFetureDropdown form={form} />
              <FormInputField type='checkbox' form={form} name='isAllowed' label='Is Allowed' options={[
                { label: 'Yes', value: true },
                { label: 'No', value: false },
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

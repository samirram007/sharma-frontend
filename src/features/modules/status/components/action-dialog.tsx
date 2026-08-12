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
import { Form } from '@/components/ui/form'

import { zodResolver } from '@hookform/resolvers/zod'

import FormInputField from '@/components/form-input-field'
import { useForm } from 'react-hook-form'
import { lowerCase } from '../../../../utils/removeEmptyStrings'

import { Loader2 } from 'lucide-react'
import { useStatusMutation } from '../data/queryOptions'
import { formSchema, type Status, type StatusForm } from '../data/schema'

interface Props {
  currentRow?: Status
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActionDialog({ currentRow, open, onOpenChange }: Props) {
  const { mutate: saveStatus, isPending } = useStatusMutation()
  const isEdit = !!currentRow

  const form = useForm<StatusForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          ...currentRow,
          isEdit,
        }
      : {
          name: '',
          code: '',
          description: '',
          color: '',
          status: 'active',
          isEdit,
        },
  })

  const moduleName = 'Status'
  const onSubmit = (values: StatusForm) => {
    form.reset()
    saveStatus(currentRow ? { ...values, id: currentRow.id } : values)
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-left">
          <DialogTitle>
            {isEdit ? 'Edit ' : 'Add New '} {moduleName}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Update the ${lowerCase(moduleName)} here. `
              : `Create new ${lowerCase(moduleName)} here. `}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="-mr-4 h-[26.25rem] w-full overflow-y-auto py-1 pr-4">
          <Form {...form}>
            <form
              id="user-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-0.5"
            >
              <FormInputField
                type="text"
                form={form}
                name="name"
                label="Name"
              />
              <FormInputField
                type="text"
                form={form}
                name="code"
                label="Code"
              />
              <FormInputField
                type="text"
                form={form}
                name="description"
                label="Description"
              />
              <FormInputField
                type="text"
                form={form}
                name="color"
                label="Color (hex)"
              />

              <FormInputField
                type="checkbox"
                form={form}
                name="status"
                label="Status"
                options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
                ]}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type="submit" form="user-form" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

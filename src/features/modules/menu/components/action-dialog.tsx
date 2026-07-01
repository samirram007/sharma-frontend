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
import { useForm, type Resolver } from 'react-hook-form'

import FormInputField from '@/components/form-input-field'

import { Loader2 } from 'lucide-react'
import { useMenu } from '../contexts/menu-context'
import { useMenuMutation } from '../data/queryOptions'
import { formSchema, type Menu } from '../data/schema'
import type { MenuForm } from '../types/types'
import FeatureDropdown from './dropdown/feature-dropdown'
import ParentMenuDropdown from './dropdown/parent-menu-dropdown'

interface Props {
  currentRow?: Menu
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ActionDialog({ currentRow, open, onOpenChange }: Props) {
  const { mutate: saveMenuEntry, isPending } = useMenuMutation()
  const { currentRow: contextRow } = useMenu()
  const isEdit = !!currentRow
  // For add mode, read parent info from context (set by tree view "Add child")
  const parentRow = !isEdit ? contextRow : null
  const parentMenuName = parentRow?.menuName
  const parentId = parentRow?.id

  const form = useForm<MenuForm>({
    resolver: zodResolver(formSchema) as Resolver<MenuForm>,
    defaultValues: isEdit
      ? {
          ...currentRow,
          appModuleFeatureId: currentRow.appModuleFeatureId,
          parentId: currentRow.parentId ?? undefined,
          isEdit,
        }
      : {
          appModuleFeatureId: undefined as any,
          menuName: parentMenuName ? `New item under ${parentMenuName}` : '',
          route: '',
          icon: '',
          parentId: parentId ?? undefined,
          sortOrder: 0,
          status: 'active',
          isVisible: true,
          isGroup: false,
          description: '',
          isEdit,
        },
    mode: 'onChange',
  })

  const onSubmit = (values: MenuForm) => {
    saveMenuEntry(
      currentRow ? { ...values, id: currentRow.id } : values,
      {
        onSuccess: () => {
          form.reset()
          onOpenChange(false)
        },
      }
    )
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
        <DialogHeader className='text-left border-b-2 pb-2'>
          <DialogTitle>{isEdit ? 'Edit Menu Entry' : 'Add New Menu Entry'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the menu entry here.' : 'Create a new menu entry here.'}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='-mr-4 h-auto w-full overflow-y-auto py-1 pr-4'>
          <Form {...form}>
            <form
              id='menu-entry-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 p-0.5'
            >
              <FeatureDropdown form={form} />
              <FormInputField type='text' form={form} name='menuName' label='Menu Name' />
              <ParentMenuDropdown form={form} />
              <FormInputField type='text' form={form} name='route' label='Route (path)' />
              <FormInputField type='text' form={form} name='icon' label='Icon Name' />
              <div className='grid grid-cols-2 gap-4'>
                <FormInputField type='number' form={form} name='sortOrder' label='Sort Order' />
                <FormInputField
                  type='select'
                  form={form}
                  name='status'
                  label='Status'
                  options={[
                    { label: 'Active', value: 'active' },
                    { label: 'Inactive', value: 'inactive' },
                  ]}
                />
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <FormInputField type='checkbox' form={form} name='isVisible' label='Visible' />
                <FormInputField type='checkbox' form={form} name='isGroup' label='Is Group' />
              </div>
              <FormInputField type='textarea' form={form} name='description' label='Description (optional)' />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='menu-entry-form' disabled={isPending}>
            {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

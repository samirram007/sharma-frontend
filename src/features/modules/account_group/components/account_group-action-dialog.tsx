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
import { storeAccountGroupService, updateAccountGroupService } from '@/features/masters/accounts/services/apis'
import { formSchema, type AccountGroup } from '@/features/modules/account_group/data/schema'
import { showSubmittedData } from '@/utils/show-submitted-data'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useForm } from 'react-hook-form'

import FormInputField from '@/components/form-input-field'
import type { AccountGroupForm } from '../types/types'
import AccountNatureDropdown from './account_nature-dropdown'
import AccountGroupDropdown from './dropdown/account_group-dropdown'





interface Props {
  currentRow?: AccountGroup
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AccountGroupActionDialog({ currentRow, open, onOpenChange }: Props) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const mutateAccountGroup = useMutation({
    mutationFn: async (data: AccountGroupForm) => {
      // Here you would typically make an API call to save the account group
      // For example:
      console.log('Saving account group:', data);
      if (isEdit && currentRow) {
        return await updateAccountGroupService({ ...data, id: currentRow.id })
      }
      else if (!isEdit) {
        return await storeAccountGroupService(data);
      }
    },
    onSuccess: (data) => {
      console.log(data, 'Account Group saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['accountGroups'] })
    },
  })

  const form = useForm<AccountGroupForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
        ...currentRow, isEdit,
      }
      : {
        name: '',
        code: '',
        description: '',
        accountNatureId: 1,
        parentId: null,
        status: 'active',
        isEdit,
      },
  })
  // const accountNatureId = form.watch('accountNatureId') as string | number | undefined;
  const onSubmit = (values: AccountGroupForm) => {
    values.accountNatureId = Number(values.accountNatureId)
    form.reset()
    showSubmittedData(values)
    mutateAccountGroup.mutate(values)
    onOpenChange(false)
  }

  console.log(form.getValues(), 'Form Values')
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
          <DialogTitle>{isEdit ? 'Edit Account Group' : 'Add New Account Group'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the account group here. ' : 'Create new account group here. '}
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
              <AccountGroupDropdown form={form} />

              <AccountNatureDropdown form={form} />

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

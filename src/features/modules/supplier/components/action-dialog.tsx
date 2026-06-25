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

import FormInputField from '@/components/form-input-field'
import { useForm, type Resolver } from 'react-hook-form'
import { lowerCase } from '../../../../utils/removeEmptyStrings'

import { Loader2 } from 'lucide-react'
import { accountLedgerSchema } from '../../account_ledger/data/schema'
import { addressSchema } from '../../address/data/schema'
import { useSupplierMutation } from '../data/queryOptions'
import { formSchema, type Supplier, type SupplierForm } from '../data/schema'
import AccountGroupDropdown from './dropdown/account_group-dropdown'
import AddressForm from './sub-component/address-form'


interface Props {
  currentRow?: Supplier
  open: boolean
  onOpenChange: (open: boolean) => void
}


export function ActionDialog({ currentRow, open, onOpenChange }: Props) {
  const { mutate: saveSupplier, isPending } = useSupplierMutation()
  const isEdit = !!currentRow

  const form = useForm<SupplierForm>({
    resolver: zodResolver(formSchema) as Resolver<SupplierForm>,
    defaultValues: isEdit
      ? {
        ...currentRow, isEdit,
      }
      : {
        name: '',
        code: '',
        gstin: '',
        pan: '',
        contactPerson: '',
        contactNo: '',
        phone: '',
        email: '',
        accountGroupId: 1,
        accountLedger: accountLedgerSchema,
        address: addressSchema,
        status: 'active',
        isEdit,
      },
  })


  const moduleName = "Supplier"
  const onSubmit = (values: SupplierForm) => {
    form.reset()
    //showSubmittedData(values)
    saveSupplier(
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
        <div className='-mr-4 h-[26.25rem] w-full overflow-y-auto py-1 pr-4'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 p-0.5'
            >
              <FormInputField type='text' form={form} name='name' label='Name' />
              <FormInputField type='text' form={form} name='code' label='Code' />
              <FormInputField type='text' form={form} name='gstin' label='Gst Number' />
              <FormInputField type='text' form={form} name='pan' label='Pan Number' />
              <FormInputField type='text' form={form} name='contactPerson' label='Contact Person' />
              <FormInputField type='text' form={form} name='contactNumber' label='Contact Number' />
              <FormInputField type='text' form={form} name='phone' label='Phone Number' />
              <FormInputField type='text' form={form} name='email' label='Email' />
              <AddressForm form={form} />
              <FormInputField type='checkbox' form={form} name='status' label='Status' options={[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
              ]} />

              <AccountGroupDropdown form={form} />
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

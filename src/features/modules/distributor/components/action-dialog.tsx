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
import { useDistributorMutation } from '../data/queryOptions'
import { formSchema, type Distributor, type DistributorForm } from '../data/schema'
import AccountGroupDropdown from './dropdown/account_group-dropdown'
import AddressForm from './sub-component/address-form'
import { cn } from '@/lib/utils'



interface Props {
  currentRow?: Distributor
  open: boolean
  onOpenChange: (open: boolean) => void
}


export function ActionDialog({ currentRow, open, onOpenChange }: Props) {
  const { mutate: saveDistributor, isPending } = useDistributorMutation()
  // const [name, setName] = React.useState(localStorage.getItem("distributorName") || "")
  const isEdit = !!currentRow

  const form = useForm<DistributorForm>({
    resolver: zodResolver(formSchema) as Resolver<DistributorForm>,
    defaultValues: isEdit
      ? { ...currentRow, isEdit }
      : {
        name: '',
        code: '',
        address: {
          line1: '',
          line2: '',
          landmark: '',
          countryId: 76,
          stateId: 36,
          city: 'Malda',
          zipCode: '',
          isPrimary: true,
          addressable: {
            addressableId: null,
            addressableType: '',
          }
        },
        email: '',
        website: '',
        gstin: '',
        pan: '',
        status: 'active',
        accountGroupId: 10008,
        contactPerson: '',
        contactNo: '',
        phone: '',

        isEdit,
      },
  })
  // const nameWatch = form.watch("name")
  // React.useEffect(() => {
  //   setName(nameWatch || "")
  //   localStorage.setItem("distributorName", nameWatch || "")
  // }, [nameWatch])
  const gapClass = 'grid grid-cols-[120px_1fr] gap-4'
  const moduleName = "Distributor"

  const onSubmit = (values: DistributorForm) => {
    // form.reset()
    //showSubmittedData(values)

    saveDistributor(
      currentRow ? { ...values, id: currentRow.id } : values,
      {
        onSuccess: () => {
          form.reset()
          onOpenChange(false)

        }
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
      <DialogContent className='sm:max-w-full md:max-w-3xl lg:max-w-5xl'>
        <DialogHeader className='text-left'>
          <DialogTitle>{isEdit ? 'Edit ' : 'Add New '} {moduleName}</DialogTitle>
          <DialogDescription>
            {isEdit ? `Update the ${lowerCase(moduleName)} here. `
              : `Create new ${lowerCase(moduleName)} here. `}
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className='  h-full max-w-full  overflow-y-auto py-1  '>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 p-0.5'
            >
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-4'>
                  <FormInputField type='text' gapClass={gapClass} form={form} name='name' label='Name' />
                  <FormInputField type='text' gapClass={gapClass} form={form} name='code' label='Code' />
                  <FormInputField type='text' gapClass={gapClass} form={form} name='gstin' label='Gst Number' />
                  <FormInputField type='text' gapClass={gapClass} form={form} name='pan' label='Pan Number' />
                  <FormInputField type='text' gapClass={gapClass} form={form} name='contactPerson' label='Contact Person' />
                  <FormInputField type='text' gapClass={gapClass} form={form} name='contactNo' label='Contact Number' />
                  <FormInputField type='text' gapClass={gapClass} form={form} name='phone' label='Phone Number' />
                  <FormInputField type='text' gapClass={gapClass} form={form} name='email' label='Email' />
                </div>
                <div className='space-y-4'>
                  <AddressForm form={form} />
                  {isEdit && form.getValues('accountLedger') ?
                    <div className={cn(gapClass, 'items-center')}>
                      <div>Ledger A/c: </div>
                      <div className={cn(gapClass, 'font-bold border-2 px-2 py-1 rounded-sm')} >
                        {form.getValues('accountLedger')?.name}
                      </div>
                    </div>
                    :

                    <AccountGroupDropdown form={form} gapClass={gapClass} />
                  }
                  <FormInputField type='checkbox' form={form} name='status' label='Status' options={[
                    { label: 'Active', value: 'active' },
                    { label: 'Inactive', value: 'inactive' },
                  ]} />
                </div>
              </div>






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

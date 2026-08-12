'use client'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'

import FormInputField from '@/components/form-input-field'
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Route as SupplierRoute } from '@/routes/_protected/masters/party/_layout/supplier/_layout'
import { lowerCase } from '@/utils/removeEmptyStrings'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useForm, type Resolver } from 'react-hook-form'
import { useSupplierMutation } from '../data/queryOptions'
import { formSchema, type Supplier, type SupplierForm } from '../data/schema'
import AccountGroupDropdown from './dropdown/account_group-dropdown'
import AddressForm from './sub-component/address-form'

interface Props {
  currentRow?: Supplier
}
export function FormAction({ currentRow }: Props) {
  const isEdit = !!currentRow
  const navigate = useNavigate()

  const { mutate: saveSupplier, isPending } = useSupplierMutation()

  const form = useForm<SupplierForm>({
    resolver: zodResolver(formSchema) as Resolver<SupplierForm>,
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
            },
          },
          email: '',
          website: '',
          gstin: '',
          pan: '',
          status: 'active',
          accountGroupId: 20003,
          contactPerson: '',
          contactNo: '',
          phone: '',

          isEdit,
        },
  })
  //  const supplierStatusOptions: ActiveInactiveStatus[] = ['active', 'inactive'];
  const labelLayoutClass = 'sm:grid-cols-[150px_1fr]'
  const moduleName = 'Supplier'
  const onSubmit = (values: SupplierForm) => {
    // console.log("here: ", values)
    // form.reset()
    saveSupplier(currentRow ? { ...values, id: currentRow.id! } : values, {
      onSuccess: () => {
        navigate({ to: SupplierRoute.to })
      },
    })
  }

  return (
    <Dialog>
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

      <div className="h-full w-full max-w-3xl overflow-y-auto overflow-x-hidden py-0 sm:py-1">
        <Form {...form}>
          <form
            id="user-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 p-0 sm:space-y-6 sm:p-1"
          >
            <div className="grid grid-cols-1 items-start gap-5">
              <div className="space-y-4 sm:space-y-5">
                <section className="space-y-4 rounded-md border border-slate-200/70 bg-white p-3 sm:p-4 dark:border-white/[0.07] dark:bg-white/6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Basic Information
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Core supplier identity and statutory details used in
                      purchasing and ledger mapping.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <FormInputField
                      type="text"
                      gapClass={labelLayoutClass}
                      form={form}
                      name="name"
                      label="Name"
                    />
                    <FormInputField
                      type="text"
                      gapClass={labelLayoutClass}
                      form={form}
                      name="code"
                      label="Code"
                    />
                    <FormInputField
                      type="text"
                      gapClass={labelLayoutClass}
                      form={form}
                      name="gstin"
                      label="GST Number"
                    />
                    <FormInputField
                      type="text"
                      gapClass={labelLayoutClass}
                      form={form}
                      name="pan"
                      label="PAN Number"
                    />
                  </div>
                </section>
                <section className="space-y-4 rounded-md border border-slate-200/70 bg-white p-3 sm:p-4 dark:border-white/[0.07] dark:bg-white/6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Contact Information
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Primary contact details for supplier communication and
                      follow-up.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <FormInputField
                      type="text"
                      gapClass={labelLayoutClass}
                      form={form}
                      name="contactPerson"
                      label="Contact Person"
                    />
                    <FormInputField
                      type="text"
                      gapClass={labelLayoutClass}
                      form={form}
                      name="contactNo"
                      label="Contact Number"
                    />
                    <FormInputField
                      type="text"
                      gapClass={labelLayoutClass}
                      form={form}
                      name="phone"
                      label="Phone Number"
                    />
                    <FormInputField
                      type="text"
                      gapClass={labelLayoutClass}
                      form={form}
                      name="email"
                      label="Email"
                    />
                  </div>
                </section>
              </div>
              <div className="space-y-4 sm:space-y-5">
                <AddressForm form={form} labelLayoutClass={labelLayoutClass} />
                <section className="space-y-4 rounded-md border border-slate-200/70 bg-white p-3 sm:p-4 dark:border-white/[0.07] dark:bg-white/6">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Accounting
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Attach the supplier to the right account group and control
                      whether the record is active.
                    </p>
                  </div>
                  <div className="space-y-4">
                    {isEdit && form.getValues('accountLedger') ? (
                      <div
                        className={cn(
                          'grid grid-cols-1 items-start gap-x-4 gap-y-2 sm:grid-cols-[150px_1fr] sm:items-center sm:gap-y-1',
                        )}
                      >
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Ledger A/c
                        </div>
                        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-white/[0.07] dark:bg-secondary dark:text-slate-200">
                          {form.getValues('accountLedger')?.name}
                        </div>
                      </div>
                    ) : (
                      <AccountGroupDropdown
                        form={form}
                        gapClass={labelLayoutClass}
                      />
                    )}
                    <FormInputField
                      type="checkbox"
                      gapClass={labelLayoutClass}
                      form={form}
                      name="status"
                      label="Status"
                      options={[
                        { label: 'Active', value: 'active' },
                        { label: 'Inactive', value: 'inactive' },
                      ]}
                    />
                  </div>
                </section>
              </div>
            </div>
          </form>
        </Form>
      </div>

      <DialogFooter className="ml-0 mr-auto w-full max-w-3xl border-t border-slate-200/70 pt-4 sm:justify-start dark:border-white/[0.07]">
        <Button
          type="submit"
          className="self-center"
          form="user-form"
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

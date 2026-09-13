'use client'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'

import FormInputField from '@/components/form-input-field'
import { cn } from '@/lib/utils'
import { Route as DistributorRoute } from '@/routes/_protected/masters/party/_layout/distributor/_layout'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useForm, type Resolver } from 'react-hook-form'
import { useDistributorMutation } from '../data/queryOptions'
import {
  formSchema,
  type Distributor,
  type DistributorForm,
} from '../data/schema'
import AccountGroupDropdown from './dropdown/account_group-dropdown'
import AddressForm from './sub-component/address-form'

interface Props {
  currentRow?: Distributor
}
export function FormAction({ currentRow }: Props) {
  const isEdit = !!currentRow
  const navigate = useNavigate()

  const { mutate: saveDistributor, isPending } = useDistributorMutation()

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
            },
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
  const labelLayoutClass = 'sm:grid-cols-[150px_1fr]'
  const onSubmit = (values: DistributorForm) => {
    saveDistributor(currentRow ? { ...values, id: currentRow.id! } : values, {
      onSuccess: () => {
        form.reset()
        navigate({ to: DistributorRoute.to })
      },
    })
  }

  return (
    <Form {...form}>
      <form
        id="distributor-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
      >
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
              <div className="space-y-4 sm:space-y-5">
          <div className="space-y-5">
            <section className="space-y-4 rounded-md border border-slate-200/70 bg-white p-3 sm:p-4 dark:border-white/[0.07] dark:bg-white/[0.06]">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Basic Information
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Core distributor identity and tax details used in sales and
                  accounting workflows.
                </p>
              </div>
              <div className="space-y-4">
                <FormInputField
                  type="text"
                  gapClass={labelLayoutClass}
                  form={form}
                  name="name"
                  label="Name"
                  tabIndex={0}
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
            <section className="space-y-4 rounded-md border border-slate-200/70 bg-white p-3 sm:p-4 dark:border-white/[0.07] dark:bg-white/[0.06]">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Contact Information
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Store the primary distributor contact details used for order
                  coordination.
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
          <div className="space-y-5">
            <AddressForm form={form} labelLayoutClass={labelLayoutClass} />
            <section className="space-y-4 rounded-md border border-slate-200/70 bg-white p-3 sm:p-4 dark:border-white/[0.07] dark:bg-white/[0.06]">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Accounting
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Link the distributor to the correct account group and control
                  record activity.
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
      </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200/70 pt-4 dark:border-white/[0.07]">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => navigate({ to: DistributorRoute.to })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending
              ? 'Saving...'
              : isEdit
                ? 'Save Changes'
                : 'Create Distributor'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

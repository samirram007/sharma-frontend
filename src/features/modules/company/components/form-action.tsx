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
import { Route as CompanyRoute } from '@/routes/_protected/masters/organization/_layout/company/_layout'
import { lowerCase } from '@/utils/removeEmptyStrings'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useCompanyMutation } from '../data/queryOptions'
import { formSchema, type Company, type CompanyForm } from '../data/schema'
import CompanyTypeDropdown from './dropdown/company_type-dropdown'
import CurrencyDropdown from './dropdown/currency-dropdown'
import AddressForm from '../sub-components/address-form'
interface Props {
  currentRow?: Company
}
export function FormAction({ currentRow }: Props) {
  const isEdit = !!currentRow
  const navigate = useNavigate()

  const { mutate: saveCompany, isPending } = useCompanyMutation()

  const form = useForm<CompanyForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? { ...currentRow, isEdit }
      : {
          name: '',
          code: '',
          mailingName: '',
          companyTypeId: 1,
          address: {
            line1: '',
            line2: '',
            landmark: '',
            postOffice: 'rathbari',
            district: 'Malda',
            countryId: 76,
            stateId: 36,
            city: 'Malda',
            zipCode: '',
            isPrimary: true,
            addressable: {
              addressableId: null,
              addressableType: 'company',
            },
          },
          phoneNo: '',
          email: '',
          website: '',
          gstNo: '',
          panNo: '',
          tanNo: '',
          cinNo: '',
          currencyId: 2,
          status: 'active',
          isEdit,
        },
  })
  //  const companyStatusOptions: ActiveInactiveStatus[] = ['active', 'inactive'];

  const moduleName = 'Company'
  const labelLayoutClass = 'sm:grid-cols-[160px_1fr]'
  const onSubmit = (values: CompanyForm) => {
    saveCompany(currentRow ? { ...values, id: currentRow.id! } : values, {
      onSuccess: () => {
        form.reset()
        navigate({ to: CompanyRoute.to })
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

      <div className="ml-0 mr-auto h-full w-full max-w-3xl overflow-y-auto overflow-x-hidden py-0 sm:py-1">
        <Form {...form}>
          <form
            id="user-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 p-0 sm:space-y-6 sm:p-1"
          >
            <div className="grid grid-cols-1 items-start gap-6">
              <div className="space-y-5">
                <section className="space-y-4 rounded-md border border-slate-200/70 bg-white p-3 sm:p-4 dark:border-white/[0.07] dark:bg-white/[0.06]">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Basic Information
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Core details used to identify and classify the company.
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
                      name="mailingName"
                      label="Mailing Name"
                    />
                    <CompanyTypeDropdown
                      form={form}
                      gapClass={labelLayoutClass}
                    />
                    <CurrencyDropdown form={form} gapClass={labelLayoutClass} />
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

                <section className="space-y-4 rounded-md border border-slate-200/70 bg-white p-3 sm:p-4 dark:border-white/[0.07] dark:bg-white/[0.06]">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Contact Information
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Primary communication details for business operations.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <FormInputField
                      type="text"
                      gapClass={labelLayoutClass}
                      form={form}
                      name="phoneNo"
                      label="Phone No"
                    />

                    <FormInputField
                      type="text"
                      gapClass={labelLayoutClass}
                      form={form}
                      name="email"
                      label="Email"
                    />
                    <FormInputField
                      type="text"
                      gapClass={labelLayoutClass}
                      form={form}
                      name="website"
                      label="Website"
                    />
                  </div>
                </section>

                <section className="space-y-4 rounded-md border border-slate-200/70 bg-white p-3 sm:p-4 dark:border-white/[0.07] dark:bg-white/[0.06]">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Tax and Compliance
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Regulatory identifiers used in invoices and statutory
                      reporting.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <FormInputField
                      type="text"
                      gapClass={labelLayoutClass}
                      form={form}
                      name="gstNo"
                      label="GST No"
                    />
                    <FormInputField
                      type="text"
                      gapClass={labelLayoutClass}
                      form={form}
                      name="panNo"
                      label="PAN No"
                    />
                    <FormInputField
                      type="text"
                      gapClass={labelLayoutClass}
                      form={form}
                      name="tanNo"
                      label="TAN No"
                    />
                    <FormInputField
                      type="text"
                      gapClass={labelLayoutClass}
                      form={form}
                      name="cinNo"
                      label="CIN No"
                    />
                  </div>
                </section>
              </div>
              <section className="space-y-4 rounded-md border border-slate-200/70 bg-white p-3 sm:p-4 dark:border-white/[0.07] dark:bg-white/[0.06]">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Address
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Registered location and jurisdiction details for the
                    company.
                  </p>
                </div>
                <AddressForm
                  form={form}
                  labelLayoutClass={labelLayoutClass}
                  plain
                />
              </section>
            </div>
          </form>
        </Form>
      </div>
      <DialogFooter className="ml-0 mr-auto w-full max-w-3xl border-t border-slate-200/70 pt-4 sm:justify-start dark:border-white/[0.07]">
        <Button type="submit" form="user-form" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

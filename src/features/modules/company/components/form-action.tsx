'use client'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'

import FormInputField from '@/components/form-input-field'
import { Route as CompanyRoute } from '@/routes/_protected/masters/organization/_layout/company/_layout'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useCompanyMutation } from '../data/queryOptions'
import { formSchema, type Company, type CompanyForm } from '../data/schema'
import CompanyTypeDropdown from './dropdown/company_type-dropdown'
import CurrencyDropdown from './dropdown/currency-dropdown'
import AddressForm from '../sub-components/address-form'

interface Props {
  currentRow?: Company
}

const sectionClass =
  'space-y-4 rounded-md border border-slate-200/70 bg-white p-3 sm:p-4 dark:border-white/[0.07] dark:bg-white/[0.06]'
const headingClass = 'text-sm font-semibold text-slate-800 dark:text-slate-200'
const subHeadingClass = 'text-xs text-slate-500 dark:text-slate-400'

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
            postOffice: '',
            district: '',
            countryId: 76,
            stateId: 36,
            city: '',
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
    <Form {...form}>
      <form
        id="company-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {/* Basic Information */}
        <section className={sectionClass}>
          <div className="space-y-1">
            <h3 className={headingClass}>Basic Information</h3>
            <p className={subHeadingClass}>
              Core details used to identify and classify the company.
            </p>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            </div>
            <FormInputField
              type="text"
              gapClass={labelLayoutClass}
              form={form}
              name="mailingName"
              label="Mailing Name"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <CompanyTypeDropdown
                form={form}
                gapClass={labelLayoutClass}
              />
              <CurrencyDropdown form={form} gapClass={labelLayoutClass} />
            </div>
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

        {/* Contact Information */}
        <section className={sectionClass}>
          <div className="space-y-1">
            <h3 className={headingClass}>Contact Information</h3>
            <p className={subHeadingClass}>
              Primary communication details for business operations.
            </p>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          </div>
        </section>

        {/* Tax and Compliance */}
        <section className={sectionClass}>
          <div className="space-y-1">
            <h3 className={headingClass}>Tax and Compliance</h3>
            <p className={subHeadingClass}>
              Regulatory identifiers used in invoices and statutory reporting.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

        {/* Address */}
        <section className={sectionClass}>
          <div className="space-y-1">
            <h3 className={headingClass}>Address</h3>
            <p className={subHeadingClass}>
              Registered location and jurisdiction details for the company.
            </p>
          </div>
          <AddressForm form={form} labelLayoutClass={labelLayoutClass} plain />
        </section>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200/70 pt-4 dark:border-white/[0.07]">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => navigate({ to: CompanyRoute.to })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Company'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

'use client'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'

import FormInputField from '@/components/form-input-field'
import { cn } from '@/lib/utils'
import { Route as EmployeeRoute } from '@/routes/_protected/masters/payroll/_layout/employee/_layout'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useForm, type Resolver } from 'react-hook-form'
import { useEmployeeMutation } from '../data/queryOptions'
import { formSchema, type Employee, type EmployeeForm } from '../data/schema'
import CurrentLiabilityGroupsDropdown from './dropdown/current_liability_group-dropdown'
import DepartmentDropdown from './dropdown/department-dropdown'
import DesignationDropdown from './dropdown/designation-dropdown'
import EmployeeGroupDropdown from './dropdown/employee_group-dropdown'
import GradeDropdown from './dropdown/grade-dropdown'
import ShiftDropdown from './dropdown/shift-dropdown'
import AddressForm from './sub-component/address-form'
import { toast } from 'sonner'
import { useEffect } from 'react'

interface Props {
  currentRow?: Employee
}

const sectionClass =
  'space-y-4 rounded-md border border-slate-200/70 bg-white p-3 sm:p-4 shadow-sm dark:border-white/8 dark:bg-card'
const headingClass = 'text-sm font-semibold text-slate-800 dark:text-slate-200'
const subHeadingClass = 'text-xs text-slate-500 dark:text-slate-400'
// Two fields per row inside a section (single column on mobile).
const fieldGridClass = 'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-6'

export function FormAction({ currentRow }: Props) {
  const isEdit = !!currentRow
  const navigate = useNavigate()

  const { mutate: saveEmployee, isPending } = useEmployeeMutation()

  const form = useForm<EmployeeForm>({
    resolver: zodResolver(formSchema) as Resolver<EmployeeForm>,
    defaultValues: isEdit
      ? {
          ...currentRow,
          isEdit,
          hasUserAccount: currentRow?.user ? true : false,
          accountGroupId: currentRow?.accountLedger?.accountGroupId || 20010,
        }
      : {
          name: '',
          code: '',
          address: {
            line1: '',
            line2: '',
            landmark: '',
            postOffice: 'rathbari',
            district: 'Malda',
            countryId: 76,
            stateId: 36,
            city: 'Malda',
            postalCode: '',
            isPrimary: true,
            addressable: {
              addressableId: null,
              addressableType: '',
            },
          },
          dob: undefined,
          doj: undefined,
          email: '',
          contactNo: '',
          education: '',
          pan: '',
          status: 'active',
          departmentId: 101,
          designationId: 101,
          employeeGroupId: 101,
          gradeId: 101,
          shiftId: 101,

          accountGroupId: 20010,
          image: '4',
          hasUserAccount: false,

          isEdit,
        },
  })
  const gapClass =
    'grid grid-cols-1 gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-4'
  const onSubmit = (values: EmployeeForm) => {
    saveEmployee(currentRow ? { ...values, id: currentRow.id! } : values, {
      onSuccess: () => {
        navigate({ to: EmployeeRoute.to })
        form.reset()
      },
      onError: (error) => {
        toast.error(error.message)
      },
    })
  }
  useEffect(() => {
    if (currentRow) {
      form.reset({
        ...currentRow,
        isEdit: true,
        hasUserAccount: currentRow?.user ? true : false,
      })
    }
  }, [currentRow])

  return (
    <Form {...form}>
      <form
        id="user-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {/* Personal Information */}
        <section className={sectionClass}>
          <div className="space-y-1">
            <h3 className={headingClass}>Personal Information</h3>
            <p className={subHeadingClass}>
              Core identity and personal details used across payroll and
              statutory records (PAN, qualifications).
            </p>
          </div>
          <div className={fieldGridClass}>
            <FormInputField
              type="text"
              gapClass={gapClass}
              form={form}
              name="name"
              label="Name"
              tabIndex={0}
            />
            <FormInputField
              type="text"
              gapClass={gapClass}
              form={form}
              name="code"
              label="Employee Code"
            />
            <FormInputField
              type="date"
              gapClass={gapClass}
              form={form}
              name="dob"
              label="Date of Birth"
            />
            <FormInputField
              type="text"
              gapClass={gapClass}
              form={form}
              name="pan"
              label="PAN Number"
            />
            <FormInputField
              type="text"
              gapClass={gapClass}
              form={form}
              name="education"
              label="Education"
            />
          </div>
        </section>

        {/* Contact Information */}
        <section className={sectionClass}>
          <div className="space-y-1">
            <h3 className={headingClass}>Contact Information</h3>
            <p className={subHeadingClass}>
              Primary contact channels used for HR communication and payslip
              delivery.
            </p>
          </div>
          <div className={fieldGridClass}>
            <FormInputField
              type="text"
              gapClass={gapClass}
              form={form}
              name="contactNo"
              label="Contact Number"
            />
            <FormInputField
              type="text"
              gapClass={gapClass}
              form={form}
              name="email"
              label="Email"
            />
          </div>
        </section>

        {/* Address */}
        <AddressForm form={form} />

        {/* Employment Details */}
        <section className={sectionClass}>
          <div className="space-y-1">
            <h3 className={headingClass}>Employment Details</h3>
            <p className={subHeadingClass}>
              Job classification, shift schedule, joining date, and current
              employment status within the organization.
            </p>
          </div>
          <div className={fieldGridClass}>
            <DesignationDropdown form={form} gapClass={gapClass} />
            <DepartmentDropdown form={form} gapClass={gapClass} />
            <EmployeeGroupDropdown form={form} gapClass={gapClass} />
            <GradeDropdown form={form} gapClass={gapClass} />
            <ShiftDropdown form={form} gapClass={gapClass} />
            <FormInputField
              type="date"
              gapClass={gapClass}
              form={form}
              name="doj"
              label="Joining Date"
            />
            <FormInputField
              type="checkbox"
              gapClass={gapClass}
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

        {/* Payroll & Account Access */}
        <section className={sectionClass}>
          <div className="space-y-1">
            <h3 className={headingClass}>Payroll &amp; Account Access</h3>
            <p className={subHeadingClass}>
              Salary ledger mapping for payroll postings and the employee&apos;s
              portal login.
            </p>
          </div>
          <div className={fieldGridClass}>
            {isEdit && form.getValues('accountLedger') ? (
              <div
                className={cn(
                  gapClass,
                  'items-center sm:grid-cols-[120px_minmax(0,1fr)]',
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
              <CurrentLiabilityGroupsDropdown
                form={form}
                gapClass={gapClass}
              />
            )}
            <FormInputField
              type="checkbox"
              gapClass={gapClass}
              form={form}
              name="hasUserAccount"
              label="Has User Account"
              options={[
                { label: 'Yes', value: true },
                { label: 'No', value: false },
              ]}
            />
          </div>
        </section>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200/70 pt-4 dark:border-white/[0.07]">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => navigate({ to: EmployeeRoute.to })}
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
                : 'Create Employee'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

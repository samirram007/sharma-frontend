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
import { Route as EmployeeRoute } from '@/routes/_protected/masters/payroll/_layout/employee/_layout'
import { lowerCase } from '@/utils/removeEmptyStrings'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
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
            zipCode: '',
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
  //  const employeeStatusOptions: ActiveInactiveStatus[] = ['active', 'inactive'];
  const gapClass =
    'grid grid-cols-1 gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-4'
  const moduleName = 'Employee'
  const onSubmit = (values: EmployeeForm) => {
    // console.log("here: ", values)

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
    console.log('currentRow: ', currentRow)
    if (currentRow) {
      form.reset({
        ...currentRow,
        isEdit: true,
        hasUserAccount: currentRow?.user ? true : false,
      })
    }
  }, [currentRow])

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
            <div className="grid grid-cols-1 items-start gap-5">
              <section className="min-w-0 space-y-4 rounded-md border border-slate-200/70 bg-white p-3 sm:p-4 shadow-sm dark:border-white/8 dark:bg-card">
                <div className="space-y-1">
                  <h3 className="font-semibold text-md">Bio</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Primary employee identity and personal profile details.
                  </p>
                </div>
                <FormInputField
                  type="text"
                  gapClass={gapClass}
                  form={form}
                  name="name"
                  label="Name"
                />
                <FormInputField
                  type="text"
                  gapClass={gapClass}
                  form={form}
                  name="code"
                  label="Code"
                />

                <FormInputField
                  type="date"
                  gapClass={gapClass}
                  form={form}
                  name="dob"
                  label="DOB"
                />
                <FormInputField
                  type="date"
                  gapClass={gapClass}
                  form={form}
                  name="doj"
                  label="Joining Date"
                />
                <FormInputField
                  type="text"
                  gapClass={gapClass}
                  form={form}
                  name="pan"
                  label="Pan Number"
                />
                <FormInputField
                  type="text"
                  gapClass={gapClass}
                  form={form}
                  name="education"
                  label="Education"
                />
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
                  name="phone"
                  label="Phone Number"
                />
                <FormInputField
                  type="text"
                  gapClass={gapClass}
                  form={form}
                  name="email"
                  label="Email"
                />
              </section>
              <section className="min-w-0 space-y-4">
                <AddressForm form={form} />
              </section>
              <section className="min-w-0 space-y-4 rounded-md border border-slate-200/70 bg-white p-3 sm:p-4 shadow-sm dark:border-white/8 dark:bg-card">
                <div className="space-y-1">
                  <h3 className="font-semibold text-md">Additional</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Department, designation, payroll grouping, and account
                    settings.
                  </p>
                </div>
                <DesignationDropdown form={form} gapClass={gapClass} />
                <DepartmentDropdown form={form} gapClass={gapClass} />
                <EmployeeGroupDropdown form={form} gapClass={gapClass} />
                <ShiftDropdown form={form} gapClass={gapClass} />
                <GradeDropdown form={form} gapClass={gapClass} />
                {isEdit && form.getValues('accountLedger') ? (
                  <div className={cn(gapClass, 'items-center')}>
                    <div>Ledger A/c: </div>
                    <div
                      className={cn('font-bold border-2 px-2 py-1 rounded-sm')}
                    >
                      {form.getValues('accountLedger')?.name}
                    </div>
                  </div>
                ) : (
                  <>
                    <CurrentLiabilityGroupsDropdown
                      form={form}
                      gapClass={gapClass}
                    />
                  </>
                )}

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
                <FormInputField
                  type="checkbox"
                  form={form}
                  name="hasUserAccount"
                  label="Has user account"
                  options={[
                    { label: 'yes', value: true },
                    { label: 'No', value: false },
                  ]}
                />
              </section>
            </div>
          </form>
        </Form>
      </div>

      <DialogFooter className="ml-0 mr-auto w-full max-w-3xl border-t border-slate-200/70 pt-4 sm:justify-start dark:border-white/8">
        <Button type="submit" form="user-form" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

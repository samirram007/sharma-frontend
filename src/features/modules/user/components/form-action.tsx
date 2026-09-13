'use client'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'

import FormInputField from '@/components/form-input-field'
import { Route as UserRoute } from '@/routes/_protected/administration/_layout/user/_layout'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useForm, type Resolver } from 'react-hook-form'
import { useUserMutation } from '../data/queryOptions'
import { formSchema, type User, type UserForm } from '../data/schema'

interface Props {
  currentRow?: User
}

const sectionClass =
  'space-y-4 rounded-md border border-slate-200/70 bg-white p-3 sm:p-4 dark:border-white/[0.07] dark:bg-white/[0.06]'
const headingClass =
  'text-sm font-semibold text-slate-800 dark:text-slate-200'
const subHeadingClass = 'text-xs text-slate-500 dark:text-slate-400'

export function FormAction({ currentRow }: Props) {
  const isEdit = !!currentRow
  const navigate = useNavigate()

  const { mutate: saveUser, isPending } = useUserMutation()

  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema) as Resolver<UserForm>,
    defaultValues: isEdit
      ? {
          ...currentRow,
          email: currentRow.email ?? '',
          username: currentRow.username ?? '',
          userType: currentRow.userType ?? '',
          password: '',
          isEdit,
        }
      : {
          name: '',
          status: 'active',
          email: '',
          username: '',
          password: '',
          isEdit,
        },
  })

  const gapClass = 'sm:grid-cols-[160px_1fr]'
  const onSubmit = (values: UserForm) => {
    saveUser(currentRow ? { ...values, id: currentRow.id! } : values, {
      onSuccess: () => {
        form.reset()
        navigate({ to: UserRoute.to })
      },
    })
  }

  return (
    <Form {...form}>
      <form
        id="user-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {/* Account Information */}
        <section className={sectionClass}>
          <div className="space-y-1">
            <h3 className={headingClass}>Account Information</h3>
            <p className={subHeadingClass}>
              Core identity details used to sign in and identify this user
              across the application.
            </p>
          </div>
          <div className="space-y-4">
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
              name="username"
              label="Username"
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

        {/* Security */}
        <section className={sectionClass}>
          <div className="space-y-1">
            <h3 className={headingClass}>Security</h3>
            <p className={subHeadingClass}>
              {isEdit
                ? 'Leave the password blank to keep the current one.'
                : 'Leave the password blank to auto-generate a secure one.'}
            </p>
          </div>
          <div className="space-y-4">
            <FormInputField
              type="text"
              inputType="password"
              gapClass={gapClass}
              form={form}
              name="password"
              label="Password"
            />
          </div>
        </section>

        {/* Status */}
        <section className={sectionClass}>
          <div className="space-y-1">
            <h3 className={headingClass}>Status</h3>
            <p className={subHeadingClass}>
              Inactive users can no longer sign in, but their historical
              entries are preserved.
            </p>
          </div>
          <div className="space-y-4">
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

        <div className="flex items-center justify-end gap-2 border-t border-slate-200/70 pt-4 dark:border-white/[0.07]">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => navigate({ to: UserRoute.to })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create User'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

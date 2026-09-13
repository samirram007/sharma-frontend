'use client'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'

import FormInputField from '@/components/form-input-field'
import { Route as CountryRoute } from '@/routes/_protected/masters/organization/_layout/country/_layout'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { storeCountryService, updateCountryService } from '../data/api'
import { formSchema, type Country, type CountryForm } from '../data/schema'

interface Props {
  currentRow?: Country
}

const sectionClass =
  'space-y-4 rounded-md border border-slate-200/70 bg-white p-3 sm:p-4 dark:border-white/[0.07] dark:bg-white/[0.06]'
const headingClass = 'text-sm font-semibold text-slate-800 dark:text-slate-200'
const subHeadingClass = 'text-xs text-slate-500 dark:text-slate-400'

export function FormAction({ currentRow }: Props) {
  const isEdit = !!currentRow
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { mutate: saveCountry, isPending } = useMutation({
    mutationFn: async (data: CountryForm) => {
      if (isEdit && currentRow) {
        return await updateCountryService({ ...data, id: currentRow.id })
      } else if (!isEdit) {
        return await storeCountryService(data)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countrys'] })
    },
  })

  const form = useForm<CountryForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          ...currentRow,
          isEdit,
        }
      : {
          name: '',
          isoCode: '',
          phoneCode: '',
          isEdit,
        },
  })

  const labelLayoutClass = 'sm:grid-cols-[160px_1fr]'
  const onSubmit = (values: CountryForm) => {
    saveCountry(currentRow ? { ...values, id: currentRow.id! } : values, {
      onSuccess: () => {
        form.reset()
        navigate({ to: CountryRoute.to })
      },
    })
  }

  return (
    <Form {...form}>
      <form
        id="country-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {/* Country Details */}
        <section className={sectionClass}>
          <div className="space-y-1">
            <h3 className={headingClass}>Country Details</h3>
            <p className={subHeadingClass}>
              Maintain the primary identification and dialing metadata used for
              country configuration.
            </p>
          </div>
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
              name="isoCode"
              label="ISO Code"
            />
            <FormInputField
              type="text"
              gapClass={labelLayoutClass}
              form={form}
              name="phoneCode"
              label="Phone Code"
            />
          </div>
        </section>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200/70 pt-4 dark:border-white/[0.07]">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => navigate({ to: CountryRoute.to })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Country'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

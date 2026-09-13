'use client'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'

import FormInputField from '@/components/form-input-field'
import { Route as StateRoute } from '@/routes/_protected/masters/organization/_layout/state/_layout'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { storeStateService, updateStateService } from '../data/api'
import { formSchema, type State, type StateForm } from '../data/schema'
import CountryDropdown from './country-dropdown'

interface Props {
  currentRow?: State
}

const sectionClass =
  'space-y-4 rounded-md border border-slate-200/70 bg-white p-3 sm:p-4 dark:border-white/[0.07] dark:bg-white/[0.06]'
const headingClass = 'text-sm font-semibold text-slate-800 dark:text-slate-200'
const subHeadingClass = 'text-xs text-slate-500 dark:text-slate-400'

export function FormAction({ currentRow }: Props) {
  const isEdit = !!currentRow
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { mutate: saveState, isPending } = useMutation({
    mutationFn: async (data: StateForm) => {
      if (isEdit && currentRow) {
        return await updateStateService({ ...data, id: currentRow.id })
      } else if (!isEdit) {
        return await storeStateService(data)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['states'] })
    },
  })

  const form = useForm<StateForm, any, StateForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          ...currentRow,
          isEdit,
        }
      : {
          name: '',
          code: '',
          gstCode: '',
          countryId: 76,
          isEdit,
        },
  })

  const labelLayoutClass = 'sm:grid-cols-[160px_1fr]'
  const onSubmit = (values: StateForm) => {
    saveState(currentRow ? { ...values, id: currentRow.id! } : values, {
      onSuccess: () => {
        form.reset()
        navigate({ to: StateRoute.to })
      },
    })
  }

  return (
    <Form {...form}>
      <form
        id="state-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
      >
        {/* State Details */}
        <section className={sectionClass}>
          <div className="space-y-1">
            <h3 className={headingClass}>State Details</h3>
            <p className={subHeadingClass}>
              Define the state code, GST mapping, and country association used
              in regional setup.
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
              name="gstCode"
              label="GST Code"
            />
            <CountryDropdown form={form} gapClass={labelLayoutClass} />
          </div>
        </section>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200/70 pt-4 dark:border-white/[0.07]">
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => navigate({ to: StateRoute.to })}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create State'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

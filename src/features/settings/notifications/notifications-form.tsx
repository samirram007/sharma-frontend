import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { toast } from 'sonner'
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  getTypeLabel,
  type NotificationPreference,
} from './notification-prefs-api'

const prefsFormSchema = z.object({
  warning: z.boolean(),
  error: z.boolean(),
  info: z.boolean(),
  success: z.boolean(),
})

type PrefsFormValues = z.infer<typeof prefsFormSchema>

function prefsToFormValues(prefs: NotificationPreference[]): PrefsFormValues {
  return {
    warning: prefs.find((p) => p.type === 'warning')?.inApp ?? true,
    error: prefs.find((p) => p.type === 'error')?.inApp ?? true,
    info: prefs.find((p) => p.type === 'info')?.inApp ?? true,
    success: prefs.find((p) => p.type === 'success')?.inApp ?? true,
  }
}

function formValuesToPayload(
  values: PrefsFormValues,
): { type: string; in_app: boolean }[] {
  return Object.entries(values).map(([type, inApp]) => ({
    type,
    in_app: inApp,
  }))
}

const NOTIFICATION_TYPES = ['warning', 'error', 'info', 'success'] as const

export function NotificationsForm() {
  const { data: prefs, isLoading } = useNotificationPreferences()
  const updateMutation = useUpdateNotificationPreferences()

  const form = useForm<PrefsFormValues>({
    resolver: zodResolver(prefsFormSchema),
    defaultValues: {
      warning: true,
      error: true,
      info: true,
      success: true,
    },
  })

  // Sync API data into the form
  useEffect(() => {
    if (prefs && prefs.length > 0) {
      form.reset(prefsToFormValues(prefs))
    }
  }, [prefs, form])

  const onSubmit = (values: PrefsFormValues) => {
    updateMutation.mutate(formValuesToPayload(values), {
      onSuccess: () => {
        toast.success('Notification preferences updated')
      },
      onError: () => {
        toast.error('Failed to update preferences')
      },
    })
  }

  const hasChanges = form.formState.isDirty

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <div>
          <h3 className='mb-4 text-lg font-medium'>In-App Notifications</h3>
          <p className='text-muted-foreground mb-6 text-sm'>
            Choose which types of notifications you want to see in the
            notification bell and in-app.
          </p>

          {isLoading ? (
            <div className='space-y-4'>
              {NOTIFICATION_TYPES.map((type) => (
                <div
                  key={type}
                  className='flex flex-row items-center justify-between rounded-lg border p-4'
                >
                  <div className='space-y-0.5'>
                    <Skeleton className='h-5 w-24' />
                    <Skeleton className='h-4 w-64' />
                  </div>
                  <Skeleton className='h-6 w-10 rounded-full' />
                </div>
              ))}
            </div>
          ) : (
            <div className='space-y-4'>
              {NOTIFICATION_TYPES.map((type) => {
                const { label, description } = getTypeLabel(type)
                return (
                  <FormField
                    key={type}
                    control={form.control}
                    name={type}
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50'>
                        <div className='space-y-0.5'>
                          <FormLabel className='text-base cursor-pointer'>
                            {label}
                          </FormLabel>
                          <FormDescription>{description}</FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )
              })}
            </div>
          )}
        </div>

        <Button
          type='submit'
          disabled={!hasChanges || updateMutation.isPending}
        >
          {updateMutation.isPending ? 'Saving…' : 'Update preferences'}
        </Button>
      </form>
    </Form>
  )
}

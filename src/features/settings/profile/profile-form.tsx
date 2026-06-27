import { z } from 'zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { updateUserService } from '@/features/modules/user/data/api'
import { useChangePasswordMutation } from '@/features/auth/data/queryOptions'

const profileFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: 'Name must be at least 2 characters.',
    })
    .max(80, {
      message: 'Name must not be longer than 80 characters.',
    }),
  username: z
    .string()
    .min(1, {
      message: 'Username is required.',
    })
    .max(30, {
      message: 'Username must not be longer than 30 characters.',
    }),
  email: z.union([z.literal(''), z.string().email('Please enter a valid email.')]),
  bio: z.string().max(160).optional(),
  userType: z.string().optional(),
})

const securityFormSchema = z.object({
  newPassword: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long.' }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>
type SecurityFormValues = z.infer<typeof securityFormSchema>

const defaultValues: Partial<ProfileFormValues> = {
  name: '',
  username: '',
  email: '',
  bio: '',
  userType: '',
}

export default function ProfileForm() {
  const { user, userFiscalYear, permissions, fetchProfile } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [visitCount, setVisitCount] = useState(0)
  const [durationText, setDurationText] = useState('0m')
  const { mutateAsync: changePassword, isPending: isPasswordUpdating } = useChangePasswordMutation()

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  })

  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: { newPassword: '' },
    mode: 'onChange',
  })

  useEffect(() => {
    if (!user) return

    const usernameLooksLikeEmail = Boolean(user.username && user.username.includes('@'))
    const resolvedEmail = user.email ?? (usernameLooksLikeEmail ? user.username ?? '' : '')
    const resolvedUsername = usernameLooksLikeEmail && !user.email ? '' : user.username ?? ''

    form.reset({
      name: user.name ?? '',
      username: resolvedUsername,
      email: resolvedEmail,
      bio: '',
      userType: user.userType ?? '',
    })
  }, [form, user])

  useEffect(() => {
    const pageKey = 'profile_page_visit_count'
    const currentCount = Number(window.localStorage.getItem(pageKey) || '0')
    const nextCount = currentCount + 1
    window.localStorage.setItem(pageKey, String(nextCount))
    setVisitCount(nextCount)

    const sessionKey = 'profile_session_started_at'
    const currentSessionStart = window.sessionStorage.getItem(sessionKey)
    const startedAt = currentSessionStart ? Number(currentSessionStart) : Date.now()

    if (!currentSessionStart) {
      window.sessionStorage.setItem(sessionKey, String(startedAt))
    }

    const formatDuration = (seconds: number) => {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      const secs = seconds % 60
      if (hours > 0) return `${hours}h ${minutes}m ${secs}s`
      if (minutes > 0) return `${minutes}m ${secs}s`
      return `${secs}s`
    }

    const refreshDuration = () => {
      const elapsed = Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
      setDurationText(formatDuration(elapsed))
    }

    refreshDuration()
    const intervalId = window.setInterval(refreshDuration, 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  const initials = user?.name
    ? user.name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
    : 'US'

  const roleNames: string[] = (user?.roles ?? [])
    .map((role: { name?: string | null }) => role?.name ?? '')
    .filter(Boolean)

  const userRecord = (user ?? null) as Record<string, unknown> | null

  const parseDate = (value: unknown): Date | null => {
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value)
      return Number.isNaN(date.getTime()) ? null : date
    }
    return null
  }

  const lastLoginDate = useMemo(() => {
    if (!userRecord) return null
    return parseDate(
      userRecord.lastLoginAt ??
      userRecord.last_login_at ??
      userRecord.lastLogin ??
      userRecord.last_login
    )
  }, [userRecord])

  const tokenExpiryDate = useMemo(() => {
    if (!userRecord) return null
    return parseDate(
      userRecord.tokenExpiry ??
      userRecord.token_expiry ??
      userRecord.tokenExpiresAt ??
      userRecord.expiresAt ??
      userRecord.sessionExpiresAt
    )
  }, [userRecord])

  const fiscalLabel = userFiscalYear?.fiscalYear
    ? `${new Date(userFiscalYear.fiscalYear.startDate).toLocaleDateString()} - ${new Date(userFiscalYear.fiscalYear.endDate).toLocaleDateString()}`
    : 'Not set'

  const bioLength = (form.watch('bio') ?? '').length

  const onSubmit = async (data: ProfileFormValues) => {
    if (!user?.id) return
    setIsSaving(true)
    try {
      await updateUserService({
        id: user.id,
        name: data.name,
        email: data.email || null,
        username: data.username || null,
        userType: user.userType ?? null,
        status: user.status,
        isEdit: true,
      })

      await fetchProfile()
    } finally {
      setIsSaving(false)
    }
  }

  const onPasswordSubmit = async (data: SecurityFormValues) => {
    await changePassword({ newPassword: data.newPassword })
    securityForm.reset({ newPassword: '' })
    securityForm.setFocus('newPassword')
  }

  const socialLoginLinks = [
    {
      name: 'Google',
      url: import.meta.env.VITE_GOOGLE_LOGIN_URL || '#',
    },
    {
      name: 'GitHub',
      url: import.meta.env.VITE_GITHUB_LOGIN_URL || '#',
    },
    {
      name: 'Microsoft',
      url: import.meta.env.VITE_MICROSOFT_LOGIN_URL || '#',
    },
  ]

  return (
    <Tabs defaultValue='overview' className='space-y-4'>
      <TabsList className='grid w-full grid-cols-3 md:w-[420px]'>
        <TabsTrigger value='overview'>Overview</TabsTrigger>
        <TabsTrigger value='security'>Security</TabsTrigger>
        <TabsTrigger value='activity'>Activity</TabsTrigger>
      </TabsList>

      <TabsContent value='overview' className='space-y-5'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
            <div className='rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50/70 to-white p-4 shadow-sm md:p-6'>
              <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                <div className='flex items-center gap-4'>
                  <Avatar className='h-14 w-14 border border-slate-200 shadow-sm'>
                    <AvatarFallback className='bg-slate-100 text-slate-700'>{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='text-xs font-medium uppercase tracking-[0.14em] text-slate-500'>Profile Overview</p>
                    <p className='text-xl font-semibold text-slate-900'>{user?.name ?? 'User'}</p>
                    <p className='text-sm text-slate-600'>
                      {form.getValues('email') || form.getValues('username') || 'No primary contact found'}
                    </p>
                  </div>
                </div>

                <div className='flex flex-wrap items-center gap-2'>
                  <Badge variant='secondary' className='rounded-full px-3 py-1'>
                    {user?.status ?? 'unknown'}
                  </Badge>
                  <Badge variant='outline' className='rounded-full px-3 py-1'>
                    {user?.userType ?? 'user'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
              <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-xs'>
                <p className='text-xs font-medium uppercase tracking-wide text-slate-500'>Roles</p>
                <p className='mt-2 text-lg font-semibold text-slate-900'>{roleNames.length}</p>
                <p className='mt-1 text-xs text-slate-600'>{roleNames.slice(0, 2).join(', ') || 'No roles assigned'}</p>
              </div>
              <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-xs'>
                <p className='text-xs font-medium uppercase tracking-wide text-slate-500'>Permissions</p>
                <p className='mt-2 text-lg font-semibold text-slate-900'>{permissions.length}</p>
                <p className='mt-1 text-xs text-slate-600'>Feature access mapped from your role.</p>
              </div>
              <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-xs'>
                <p className='text-xs font-medium uppercase tracking-wide text-slate-500'>Fiscal Year</p>
                <p className='mt-2 text-sm font-semibold text-slate-900'>{fiscalLabel}</p>
                <p className='mt-1 text-xs text-slate-600'>Current reporting window.</p>
              </div>
            </div>

            <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6'>
              <div className='mb-4'>
                <h3 className='text-base font-semibold text-slate-900'>Basic Information</h3>
                <p className='text-sm text-slate-600'>Keep your user details accurate and easy to identify.</p>
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem className='rounded-xl border border-slate-200/80 bg-slate-50/60 p-3'>
                      <FormLabel className='text-[11px] font-semibold uppercase tracking-wide text-slate-600'>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter full name'
                          autoComplete='name'
                          className='bg-white'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Displayed in profile, headers, and activity records.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='username'
                  render={({ field }) => (
                    <FormItem className='rounded-xl border border-slate-200/80 bg-slate-50/60 p-3'>
                      <FormLabel className='text-[11px] font-semibold uppercase tracking-wide text-slate-600'>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Enter username'
                          autoComplete='username'
                          className='bg-white'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Unique user identity for login and references.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem className='md:col-span-2'>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type='email'
                          placeholder='name@example.com'
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormDescription>
                        Primary contact email for this account. Leave empty if not used.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='bio'
                  render={({ field }) => (
                    <FormItem className='md:col-span-2'>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Tell us a little bit about yourself'
                          className='min-h-[120px] resize-none'
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional short note for quick context.
                      </FormDescription>
                      <div className='text-right text-xs text-slate-500'>{bioLength}/160</div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className='flex items-center justify-end'>
              <Button type='submit' className='min-w-36' disabled={isSaving || !user?.id}>
                {isSaving ? 'Updating...' : 'Update profile'}
              </Button>
            </div>
          </form>
        </Form>
      </TabsContent>

      <TabsContent value='security' className='space-y-5'>
        <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6'>
          <h3 className='text-base font-semibold text-slate-900'>Change Password</h3>
          <p className='mt-1 text-sm text-slate-600'>Use a strong password with at least 6 characters.</p>

          <Form {...securityForm}>
            <form onSubmit={securityForm.handleSubmit(onPasswordSubmit)} className='mt-4 grid gap-4 md:max-w-md'>
              <FormField
                control={securityForm.control}
                name='newPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type='password' placeholder='Enter new password' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type='submit' className='w-full md:w-auto' disabled={isPasswordUpdating}>
                {isPasswordUpdating ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </Form>
        </div>

        <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6'>
          <h3 className='text-base font-semibold text-slate-900'>Social Login Links</h3>
          <p className='mt-1 text-sm text-slate-600'>Link your preferred provider for faster sign-in.</p>

          <div className='mt-4 grid gap-3 md:grid-cols-3'>
            {socialLoginLinks.map((provider) => (
              <a
                key={provider.name}
                href={provider.url}
                className='rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white'
              >
                Link {provider.name}
              </a>
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value='activity' className='space-y-4'>
        <div className='grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4'>
          <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-xs'>
            <p className='text-xs font-medium uppercase tracking-wide text-slate-500'>Visit Frequency</p>
            <p className='mt-2 text-lg font-semibold text-slate-900'>{visitCount}</p>
            <p className='mt-1 text-xs text-slate-600'>Times this profile page was visited.</p>
          </div>

          <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-xs'>
            <p className='text-xs font-medium uppercase tracking-wide text-slate-500'>Last Login</p>
            <p className='mt-2 text-sm font-semibold text-slate-900'>
              {lastLoginDate ? lastLoginDate.toLocaleString() : 'Not provided by API'}
            </p>
            <p className='mt-1 text-xs text-slate-600'>Based on server profile payload.</p>
          </div>

          <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-xs'>
            <p className='text-xs font-medium uppercase tracking-wide text-slate-500'>Current Duration</p>
            <p className='mt-2 text-lg font-semibold text-slate-900'>{durationText}</p>
            <p className='mt-1 text-xs text-slate-600'>Time spent in this active browser session.</p>
          </div>

          <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-xs'>
            <p className='text-xs font-medium uppercase tracking-wide text-slate-500'>Token Expiry</p>
            <p className='mt-2 text-sm font-semibold text-slate-900'>
              {tokenExpiryDate ? tokenExpiryDate.toLocaleString() : 'Server-managed (httpOnly cookie)'}
            </p>
            <p className='mt-1 text-xs text-slate-600'>Client side cannot always read token expiry.</p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}

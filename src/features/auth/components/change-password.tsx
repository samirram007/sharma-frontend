import { useForm, type Resolver } from 'react-hook-form'

import { Button } from '@/components/ui/button'

import { useChangePasswordMutation } from '../data/queryOptions'
import { Form } from '@/components/ui/form'
import FormInputField from '@/components/form-input-field'


import z from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'



const changePasswordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters long'),
})
type FormData = z.infer<typeof changePasswordSchema>

export default function ChangePassword() {
  const { mutate: changePassword, isPending } = useChangePasswordMutation()
  const form = useForm<FormData>({
    resolver: zodResolver(changePasswordSchema) as Resolver<FormData>,
    defaultValues: {
      newPassword: '',
    },
    mode: 'onChange',
  })


  const onSubmit = async (data: FormData) => {
    await changePassword(data, {
      onSuccess: () => {
        form.reset()
        form.setFocus('newPassword')
      },
    })
  }

  return (
    <div className='space-y-2 p-4 md:p-8'>
      <div className='text-2xl'>Change Password</div>
      <div>
        <p className='text-sm text-muted-foreground'>
          Update your account's password here.
        </p>
      </div>
      <div>
        <hr className='my-4' />
        <div className='w-3/12 border p-4 rounded-md'>

          <Form {...form}  >
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormInputField type='text' form={form} name="newPassword" label="New Password" required />

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </Form >
        </div>
      </div>

    </div>

  )
}

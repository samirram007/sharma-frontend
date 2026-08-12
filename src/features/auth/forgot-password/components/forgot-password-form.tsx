import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { type HTMLAttributes, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { forgotPasswordService } from '../../services/apis'

type ForgotFormProps = HTMLAttributes<HTMLDivElement>

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email' })
    .email({ message: 'Invalid email address' }),
})

export function ForgotForm({ className, ...props }: ForgotFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      await forgotPasswordService({ email: data.email })
      // successHandler in dataClient.tsx already toasts the backend message
      form.reset()
    } catch (error: unknown) {
      console.error('Forgot password request failed:', error)

      const apiError = error as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> }
        }
      }

      const fieldErrors = apiError?.response?.data?.errors

      // Show backend validation errors inline under the matching form field
      // (same pattern as the sign-in form). The global errorHandler in
      // dataClient.tsx already toasts these as red error toasts, so no
      // duplicate toast is shown here.
      if (fieldErrors) {
        const messages = fieldErrors['email']
        if (messages?.length) {
          form.setError(
            'email',
            { message: messages[0] },
            { shouldFocus: true },
          )
        }
        return
      }

      // Only toast message-only responses the global handler doesn't show.
      const message = apiError?.response?.data?.message
      if (message) {
        // Stable id so repeated attempts replace the previous toast
        toast.error(message, { id: 'forgot-password-error' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@example.com"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        // Clear the server-set inline error as the user types
                        // so it doesn't linger until the next submit
                        form.clearErrors('email')
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="mt-2" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Continue'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

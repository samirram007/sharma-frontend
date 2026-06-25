import { PasswordInput } from '@/components/password-input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconBrandFacebook, IconBrandGithub } from '@tabler/icons-react';
import { Link, useRouter } from '@tanstack/react-router';
import { type HTMLAttributes } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import { clean_logout, clearAllCookies } from '@/utils/protectedRoute';

type UserAuthFormProps = HTMLAttributes<HTMLDivElement>;

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Please enter your email' })
    .email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(1, {
      message: 'Please enter your password',
    })
    .min(7, {
      message: 'Password must be at least 7 characters long',
    }),
})

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const { login, isLoading } = useAuth()

  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    // setIsLoading(true)
    await login(data)
      .then(() => router.invalidate())
      .catch((error) => {
        console.error("Login failed:...........", error)

        // throw redirect({
        //   to: '/sign-in',
        // })
        // handle error here
      })
    // eslint-disable-next-line no-console
    // console.log(data)

    // setTimeout(() => {
    //   setIsLoading(false)
    // }, 3000)
  }

  return (
    <div className={cn('grid gap-5', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='grid gap-3'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='space-y-1.5'>
                  <FormLabel className='text-slate-700'>Email</FormLabel>
                  <FormControl>
                    <Input
                      unstyled
                      placeholder='name@example.com'
                      className=' rounded-lg border border-slate-200 bg-white shadow-sm focus-within:border-cyan-500/60 focus-within:ring-2 focus-within:ring-cyan-500/40'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem className='space-y-1.5'>
                  <div className='flex items-center justify-between'>
                    <FormLabel className='text-slate-700'>Password</FormLabel>
                    <Link
                      to='/forgot-password'
                      className='text-sm font-medium text-muted-foreground underline-offset-4 hover:text-cyan-700 hover:underline'
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <PasswordInput
                      placeholder='********'
                      className='border-slate-200 bg-white shadow-sm focus-visible:border-cyan-500/60 focus-visible:ring-cyan-500/40'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className='mt-2 h-11 bg-linear-to-r from-cyan-600 to-blue-600 text-base font-semibold hover:from-cyan-700 hover:to-blue-700' disabled={isLoading}>
              Login
            </Button>

            <div className='relative my-2'>
              <div className='absolute inset-0 flex items-center'>
                <span className='w-full border-t' />
              </div>
              <div className='relative hidden justify-center text-xs uppercase'>
                <span className='bg-background px-2 text-muted-foreground'>
                  Or continue with
                </span>
              </div>

            </div>

            <div className='hidden items-center gap-2'>
              <Button
                variant='outline'
                className='w-1/2'
                type='button'
                disabled={isLoading}
              >
                <IconBrandGithub className='h-4 w-4' /> GitHub
              </Button>
              <Button
                variant='outline'
                className='w-1/2'
                type='button'
                disabled={isLoading}
              >
                <IconBrandFacebook className='h-4 w-4' /> Facebook
              </Button>
            </div>
          </div>
        </form>
      </Form>
      <FailSafe />
    </div>
  )
}

const FailSafe = () => {
  const handleClick = () => {

    clean_logout();
    clearAllCookies();
  };

  return (
    <div onClick={handleClick} className='text-xs text-center text-slate-500 cursor-pointer hover:text-cyan-700 hover:underline'>
      Click here if you are facing issues logging in.
    </div>
  )
}
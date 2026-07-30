import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Link, useRouter } from '@tanstack/react-router'
import { ShieldX, ArrowLeft, Home, Lock, LogIn } from 'lucide-react'
import { useAuthSafe } from './use-auth-safe'

interface ForbiddenErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  minimal?: boolean
}

export default function ForbiddenError({
  className,
  minimal = false,
}: ForbiddenErrorProps) {
  const { history } = useRouter()
  const { user, isAuthenticated } = useAuthSafe()

  return (
    <div
      className={cn(
        'flex w-full items-center justify-center bg-gradient-to-br from-background via-background to-destructive/5',
        minimal ? 'min-h-full' : 'h-svh',
        className
      )}
    >
      <div className='mx-auto flex w-full max-w-lg flex-col items-center px-6 text-center'>
        {/* Animated shield icon */}
        <div className='relative mb-8'>
          <div className='flex h-24 w-24 items-center justify-center rounded-3xl bg-destructive/10 ring-1 ring-destructive/20'>
            <ShieldX className='h-12 w-12 text-destructive' strokeWidth={1.5} />
          </div>
          <div className='absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 ring-4 ring-background dark:bg-amber-900/40'>
            <Lock className='h-4 w-4 text-amber-600 dark:text-amber-400' />
          </div>
        </div>

        {!minimal && (
          <h1 className='mb-2 text-6xl font-extrabold tracking-tight text-foreground sm:text-7xl'>
            403
          </h1>
        )}

        <h2 className='mb-3 text-xl font-semibold text-foreground sm:text-2xl'>
          Access Denied
        </h2>

        {isAuthenticated && user ? (
          <p className='mb-8 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base'>
            Sorry <span className='font-medium text-foreground'>{user.name}</span>,
            you don&apos;t have the necessary permissions to view this page.
            Please contact your administrator if you believe this is a mistake.
          </p>
        ) : (
          <p className='mb-8 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base'>
            You don&apos;t have the necessary permissions to view this page.
            Please contact your administrator if you believe this is a mistake.
          </p>
        )}

        {!minimal && (
          <div className='flex flex-col gap-3 sm:flex-row'>
            <Button
              variant='outline'
              size='lg'
              onClick={() => history.go(-1)}
              className='gap-2'
            >
              <ArrowLeft className='h-4 w-4' />
              Go Back
            </Button>
            {isAuthenticated ? (
              <Button asChild variant='default' size='lg' className='gap-2'>
                <Link to='/'>
                  <Home className='h-4 w-4' />
                  Back to Dashboard
                </Link>
              </Button>
            ) : (
              <Button asChild variant='default' size='lg' className='gap-2'>
                <Link to='/sign-in'>
                  <LogIn className='h-4 w-4' />
                  Sign In
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

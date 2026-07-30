import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Link, useRouter } from '@tanstack/react-router'
import { AlertCircle, ArrowLeft, Home, LogIn, LogOut } from 'lucide-react'
import { useAuthSafe } from './use-auth-safe'

interface UnauthorisedErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  minimal?: boolean
}

export default function UnauthorisedError({
  className,
  minimal = false,
}: UnauthorisedErrorProps) {
  const { history } = useRouter()
  const { user, isAuthenticated } = useAuthSafe()

  return (
    <div
      className={cn(
        'flex w-full items-center justify-center bg-gradient-to-br from-background via-background to-amber-500/5',
        minimal ? 'min-h-full' : 'h-svh',
        className
      )}
    >
      <div className='mx-auto flex w-full max-w-lg flex-col items-center px-6 text-center'>
        {/* Animated alert icon */}
        <div className='relative mb-8'>
          <div className='flex h-24 w-24 items-center justify-center rounded-3xl bg-amber-500/10 ring-1 ring-amber-500/20'>
            <AlertCircle className='h-12 w-12 text-amber-500' strokeWidth={1.5} />
          </div>
          <div className='absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-100 ring-4 ring-background dark:bg-red-900/40'>
            <LogOut className='h-4 w-4 text-red-600 dark:text-red-400' />
          </div>
        </div>

        {!minimal && (
          <h1 className='mb-2 text-6xl font-extrabold tracking-tight text-foreground sm:text-7xl'>
            401
          </h1>
        )}

        {isAuthenticated && user ? (
          <>
            <h2 className='mb-1 text-xl font-semibold text-foreground sm:text-2xl'>
              Session Expired
            </h2>
            <p className='mb-2 text-sm text-muted-foreground'>
              Hi <span className='font-medium text-foreground'>{user.name}</span>,
              your session has expired. Please sign in again to continue.
            </p>
          </>
        ) : (
          <>
            <h2 className='mb-3 text-xl font-semibold text-foreground sm:text-2xl'>
              Unauthorized Access
            </h2>
            <p className='mb-8 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base'>
              Please sign in with the appropriate credentials to access this
              resource.
            </p>
          </>
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

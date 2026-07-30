import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import { Wrench, Home, LogIn } from 'lucide-react'
import { useAuthSafe } from './use-auth-safe'

interface MaintenanceErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  minimal?: boolean
}

export default function MaintenanceError({
  className,
  minimal = false,
}: MaintenanceErrorProps) {
  const { user, isAuthenticated } = useAuthSafe()

  return (
    <div
      className={cn(
        'flex w-full items-center justify-center bg-gradient-to-br from-background via-background to-orange-500/5',
        minimal ? 'min-h-full' : 'h-svh',
        className
      )}
    >
      <div className='mx-auto flex w-full max-w-lg flex-col items-center px-6 text-center'>
        {/* Animated wrench icon */}
        <div className='relative mb-8'>
          <div className='flex h-24 w-24 items-center justify-center rounded-3xl bg-orange-500/10 ring-1 ring-orange-500/20'>
            <Wrench className='h-12 w-12 text-orange-500' strokeWidth={1.5} />
          </div>
        </div>

        {!minimal && (
          <h1 className='mb-2 text-6xl font-extrabold tracking-tight text-foreground sm:text-7xl'>
            503
          </h1>
        )}

        <h2 className='mb-3 text-xl font-semibold text-foreground sm:text-2xl'>
          Under Maintenance
        </h2>

        {isAuthenticated && user ? (
          <p className='mb-8 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base'>
            Hi <span className='font-medium text-foreground'>{user.name}</span>,
            the system is currently under scheduled maintenance. We&apos;ll be
            back online shortly. Thank you for your patience.
          </p>
        ) : (
          <p className='mb-8 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base'>
            The system is currently under scheduled maintenance. We&apos;ll be
            back online shortly. Thank you for your patience.
          </p>
        )}

        {!minimal && (
          <div className='flex flex-col gap-3 sm:flex-row'>
            <Button
              variant='outline'
              size='lg'
              onClick={() => window.location.reload()}
              className='gap-2'
            >
              <Wrench className='h-4 w-4' />
              Try Again
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

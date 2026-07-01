import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Link, useRouter } from '@tanstack/react-router'

interface ForbiddenErrorProps extends React.HTMLAttributes<HTMLDivElement> {
  minimal?: boolean
}

export default function ForbiddenError({
  className,
  minimal = false,
}: ForbiddenErrorProps) {
  const { history } = useRouter()

  return (
    <div className={cn('h-svh w-full', className)}>
      <div className='m-auto flex h-full w-full flex-col items-center justify-center gap-2'>
        {!minimal && (
          <h1 className='text-[7rem] font-bold leading-tight text-destructive/80'>
            403
          </h1>
        )}
        <div className='flex items-center gap-2 text-amber-600 dark:text-amber-400'>
          <svg
            className='h-6 w-6'
            xmlns='http://www.w3.org/2000/svg'
            width='24'
            height='24'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <rect width='18' height='11' x='3' y='11' rx='2' ry='2' />
            <path d='M7 11V7a5 5 0 0 1 10 0v4' />
          </svg>
          <span className='font-medium'>Access Denied</span>
        </div>
        <p className='text-center text-muted-foreground'>
          You don&apos;t have permission to access this page.{' '}
          <br />
          Please contact your administrator if you believe this is a mistake.
        </p>
        {!minimal && (
          <div className='mt-6 flex gap-4'>
            <Button variant='outline' onClick={() => history.go(-1)}>
              Go Back
            </Button>
            <Button asChild variant='default'>
              <Link to='/' className='flex items-center gap-2'>
                Back to Home
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

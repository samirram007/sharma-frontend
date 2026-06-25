import { Button } from '@/components/ui/button';
import { createFileRoute, Link, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  beforeLoad: async ({ context }) => { 
    if (context.auth?.user) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: RouteComponent,
})

function RouteComponent() {

  return <div className='flex h-screen w-full items-center justify-center flex-col space-y-4'>
    <img src="/logo512.png" alt="Logo" className='h-16 w-16' />
    <p className='text-lg'>Welcome to the App</p>
    <p className='text-sm text-gray-500'>Please sign in to continue</p>
    <p className='text-sm text-gray-500'>This is a demo app built with React and TanStack Router</p>
    <p className='text-sm text-gray-500'>You can find the source code on <a href="https://github.com/samirram007" className='text-blue-500 hover:underline'>GitHub</a></p>

    <h1 className='text-2xl font-bold tracking-tight'>Welcome to the App</h1>
    <p className='mt-2'><Link className='' to="/sign-in">
      <Button className='bg-blue-500 text-white cursor-pointer hover:bg-blue-600'>
        Sign In
      </Button>
    </Link></p>
  </div>

}

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import { Main } from '@/layouts/components/main'
import { Link, Outlet } from '@tanstack/react-router'
import { useTransaction } from '../context/transaction-context'


const TransactionLayout = () => {
    const { headerVisible } = useTransaction()
    const { userFiscalYear } = useAuth();


    if (!userFiscalYear) {
        return (
            <div className='flex flex-row gap-6 items-center justify-center text-center text-red-600 font-semibold'>
                <div>

                    It looks like no Fiscal Year is assigned. Please set one or contact support.
                </div>
                <Button className=' text-blue-700 border-blue-600 border-2' variant='outline' size='sm' asChild>
                    <Link to='/user-fiscal-year'>Set Fiscal Year</Link>
                </Button>
            </div>
        )
    }
    return (

        <Main fixed className='  overflow-hidden'>

            {headerVisible &&
                <>
            <div className='space-y-0.5'>
                <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
                    Transaction Gateway
                </h1>
                <p className='text-muted-foreground'>
                    Manage your transaction.
                </p>
            </div>
            <Separator className='my-1 lg:my-1' />
                </>
            }
            <div className='flex flex-1  flex-col space-y-2 overflow-hidden md:space-y-0 lg:flex-row lg:space-y-0 '>

                <div className='px-2 flex w-full overflow-y-hidden  '>
                    <Outlet />
                </div>
            </div>
            {/* <TransporterDialog />
            <DeliveryVehicleDialog /> */}

        </Main>
    )
}

export default TransactionLayout
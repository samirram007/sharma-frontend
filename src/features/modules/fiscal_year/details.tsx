
import { Main } from '@/layouts/components/main'
import { Button } from '@/components/ui/button'
import { ActionPages } from './components/action-page'
import { type FiscalYear } from './data/schema'
import { Link } from '@tanstack/react-router'
import { IconArchive, IconDoorEnter } from '@tabler/icons-react'

interface FiscalYearProps {
    data?: FiscalYear
}

export default function FiscalYearDetails(props: FiscalYearProps) {
    const { data } = props
    const keyName = 'fiscalYears'
    const fyId = data?.id

    return (
        <>
            <Main>
                {fyId && (
                    <div className='mb-4 flex flex-wrap items-center gap-2'>
                        <Button asChild variant='outline' size='sm'>
                            <Link to='/masters/organization/fiscal_year/$id/close' params={{ id: fyId }}>
                                <IconArchive className='mr-1.5 h-4 w-4' />
                                Close Fiscal Year
                            </Link>
                        </Button>
                        <Button asChild variant='outline' size='sm'>
                            <Link to='/masters/organization/fiscal_year/$id/open' params={{ id: fyId }}>
                                <IconDoorEnter className='mr-1.5 h-4 w-4' />
                                Opening Journal
                            </Link>
                        </Button>
                    </div>
                )}
                <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
                    <ActionPages currentRow={data}
                        key={`${keyName}-add`} />
                </div>
            </Main>
        </>
    )
}

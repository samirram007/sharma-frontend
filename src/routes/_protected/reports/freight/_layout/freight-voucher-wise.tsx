import { SkeletonTable } from '@/components/skeleton'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { freightReportQueryOptions } from '@/features/modules/voucher/freight/data/queryOptions'
import FreightVoucherWise from '@/features/modules/voucher/freight/voucher-wise'
import { IconMessage2Cancel } from '@tabler/icons-react'

import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute(
    '/_protected/reports/freight/_layout/freight-voucher-wise',
)({
    loader: ({ context }) =>
        context.queryClient.ensureQueryData(freightReportQueryOptions('voucher_wise')),
    component: () => {
        const { data: freightVoucherWise } = useSuspenseQuery(freightReportQueryOptions('voucher_wise'))
        return <FreightVoucherWise data={freightVoucherWise?.data} />
    },
    errorComponent: (error: any) =>
        <div className='h-[50vh] no-scrollbar flex justify-center items-center flex-col gap-2'>
            <Card className='w-[400px] h-[200px] p-8 border-2 border-red-600 flex flex-col gap-4 justify-between items-between shadow-lg'>
                <div className=" flex gap-2 items-center justify-start"><IconMessage2Cancel /> <p className='text-2xl'>Something went wrong</p></div>


                <pre className='text-sm text-red-600 overflow-auto max-h-20'>{error.error.message}</pre>


                <Button variant={'destructive'} onClick={() => window.location.reload()}>Reload</Button>
            </Card>
        </div>
    ,
    pendingComponent: () => <div className='h-[50vh] no-scrollbar flex justify-start items-center flex-col gap-2'>
        <SkeletonTable className='w-full' />
    </div>,
})
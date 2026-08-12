import { FullPageSkeleton } from '@/components/skeleton'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { IconMessage2Cancel } from '@tabler/icons-react'

import DeliveryNoteZoneWise from '@/features/modules/voucher/freight/delivery-note-zone-wise'
import { deliveryNoteZoneWiseQueryOptions } from '@/features/modules/voucher/freight/delivery-note-zone-wise/data/queryOptions'

export const Route = createFileRoute(
  '/_protected/reports/freight/_layout/delivery-note-zone-wise',
)({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(deliveryNoteZoneWiseQueryOptions()),
  component: () => {
    const { data: zoneWiseData } = useSuspenseQuery(
      deliveryNoteZoneWiseQueryOptions(),
    )

    return (
      <DeliveryNoteZoneWise
        data={zoneWiseData?.data}
        chartTitle="Delivery Notes per Zone"
        title="Delivery Note (Zone Wise)"
      />
    )
  },
  errorComponent: (error: any) => (
    <div className="h-[50vh] no-scrollbar flex justify-center items-center flex-col gap-2">
      <Card className="w-[400px] h-[200px] p-8 border-2 border-red-600 flex flex-col gap-4 justify-between items-between shadow-lg">
        <div className="flex gap-2 items-center justify-start">
          <IconMessage2Cancel />{' '}
          <p className="text-2xl">Something went wrong</p>
        </div>
        <pre className="text-sm text-red-600 overflow-auto max-h-20">
          {error.error?.message ?? 'Unknown error'}
        </pre>
        <Button
          variant={'destructive'}
          onClick={() => window.location.reload()}
        >
          Reload
        </Button>
      </Card>
    </div>
  ),
  pendingComponent: () => <FullPageSkeleton />,
})

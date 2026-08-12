import { FullPageSkeleton } from '@/components/skeleton'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { IconMessage2Cancel } from '@tabler/icons-react'

import DeliveryNoteGodownWise from '@/features/modules/voucher/freight/delivery-note-godown-wise'
import { fetchZonesService } from '@/features/modules/godown/data/zones-api'
import { fetchGodownService } from '@/features/modules/godown/data/api'
import { godownListSchema } from '@/features/modules/godown/data/schema'

export const Route = createFileRoute(
  '/_protected/reports/freight/_layout/delivery-note-godown-wise',
)({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: ['zones'],
        queryFn: fetchZonesService,
      }),
      context.queryClient.ensureQueryData({
        queryKey: ['godowns'],
        queryFn: fetchGodownService,
      }),
    ]),
  component: () => {
    const { data: zonesResponse } = useSuspenseQuery({
      queryKey: ['zones'],
      queryFn: fetchZonesService,
    })
    const { data: godownsResponse } = useSuspenseQuery({
      queryKey: ['godowns'],
      queryFn: fetchGodownService,
    })
    const zones = godownListSchema.parse(zonesResponse?.data ?? [])
    const godowns = godownListSchema.parse(godownsResponse?.data ?? [])

    return <DeliveryNoteGodownWise zones={zones} godowns={godowns} />
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

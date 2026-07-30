import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Main } from '@/layouts/components/main'
import { useQuery } from '@tanstack/react-query'
import {
  IconChartBar,
  IconEye,
  IconLoader2,
  IconRefresh,
  IconX,
  IconBuildingWarehouse,
  IconPackage,
} from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  runningBalanceItemsQueryOptions,
  runningBalanceDetailQueryOptions,
  runningBalanceGodownsQueryOptions,
  godownRunningBalanceItemsQueryOptions,
} from './data/queryOptions'
import type {
  RunningBalanceItem,
  RunningBalanceDetail,
  RunningBalanceGodown,
  GodownRunningBalanceResponse,
} from './data/schema'
import ItemGrid from './components/item-grid'
import GodownGrid from './components/godown-grid'
import GodownItems from './components/godown-items'
import RunningBalanceDetailView from './components/running-balance-detail'

type View = 'item-grid' | 'godown-grid' | 'godown-items' | 'detail'
type Tab = 'item-wise' | 'godown-wise'

export default function RunningBalanceDashboard() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('item-wise')
  const [view, setView] = useState<View>('item-grid')
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)
  const [selectedGodownId, setSelectedGodownId] = useState<number | null>(null)
  const [selectedGodownDetailId, setSelectedGodownDetailId] = useState<number | null>(null)

  // Item-wise queries
  const {
    data: itemsData,
    isLoading: itemsLoading,
    isError: itemsError,
    refetch: refetchItems,
  } = useQuery(runningBalanceItemsQueryOptions())

  // Godown-wise queries
  const {
    data: godownsData,
    isLoading: godownsLoading,
    isError: godownsError,
    refetch: refetchGodowns,
  } = useQuery(runningBalanceGodownsQueryOptions())

  const {
    data: godownItemsData,
    isLoading: godownItemsLoading,
  } = useQuery({
    ...godownRunningBalanceItemsQueryOptions(selectedGodownId ?? 0),
    enabled: view === 'godown-items' && !!selectedGodownId,
  })

  // Detail query (with optional godown filter)
  const selectedFilterGodownId =
    tab === 'godown-wise' ? selectedGodownDetailId : null

  const {
    data: detailData,
    isLoading: detailLoading,
    isError: detailError,
  } = useQuery({
    ...runningBalanceDetailQueryOptions(selectedItemId ?? 0, selectedFilterGodownId ?? undefined),
    enabled: view === 'detail' && !!selectedItemId,
  })

  const items = (itemsData?.data ?? []) as RunningBalanceItem[]
  const godowns = (godownsData?.data ?? []) as RunningBalanceGodown[]
  const godownItems = godownItemsData?.data as GodownRunningBalanceResponse | undefined
  const detail = detailData?.data as RunningBalanceDetail | undefined

  const handleSelectItem = (itemId: number) => {
    setSelectedItemId(itemId)
    setSelectedGodownDetailId(selectedGodownId)
    setView('detail')
  }

  const handleBackToGrid = () => {
    setView(tab === 'item-wise' ? 'item-grid' : 'godown-grid')
    setSelectedItemId(null)
    setSelectedGodownDetailId(null)
  }

  const handleSelectGodown = (godownId: number) => {
    setSelectedGodownId(godownId)
    setView('godown-items')
  }

  const handleBackToGodowns = () => {
    setView('godown-grid')
    setSelectedGodownId(null)
  }

  const handleTabChange = (value: string) => {
    const newTab = value as Tab
    setTab(newTab)
    setView(newTab === 'item-wise' ? 'item-grid' : 'godown-grid')
    setSelectedItemId(null)
    setSelectedGodownId(null)
  }

  const isLoading =
    (tab === 'item-wise' && itemsLoading) ||
    (tab === 'godown-wise' && godownsLoading)

  const isError =
    (tab === 'item-wise' && itemsError) ||
    (tab === 'godown-wise' && godownsError)

  const handleRefresh = () => {
    if (tab === 'item-wise') refetchItems()
    else refetchGodowns()
  }

  if (isLoading) {
    return (
      <Main className='flex items-center justify-center min-h-[60vh]'>
        <IconLoader2 className='h-8 w-8 animate-spin text-muted-foreground' />
      </Main>
    )
  }

  if (isError) {
    return (
      <Main className='flex items-center justify-center min-h-[60vh]'>
        <div className='text-center space-y-4'>
          <IconX className='h-12 w-12 text-destructive mx-auto' />
          <p className='text-lg font-medium text-destructive'>Failed to load running balance data</p>
          <Button variant='outline' onClick={handleRefresh}>
            <IconRefresh className='mr-2 h-4 w-4' />
            Retry
          </Button>
        </div>
      </Main>
    )
  }

  const isGrid = view === 'item-grid' || view === 'godown-grid'

  return (
    <Main className='max-w-7xl mx-auto space-y-6 py-6'>
      {/* Header */}
      <div className='flex flex-wrap items-start justify-between gap-4'>
        <div className='space-y-1'>
          {isGrid ? (
            <>
              <div className='flex items-center gap-3'>
                <h1 className='text-3xl font-bold tracking-tight'>Running Balance</h1>
                <Badge variant='secondary' className='px-3 py-1'>
                  <IconChartBar className='mr-1 h-3.5 w-3.5' />
                  Dashboard
                </Badge>
              </div>
              <p className='text-muted-foreground'>
                View stock movement from opening balance through transactions to current stock.
                Drill down by item or godown to see full running balance with voucher-level detail.
              </p>
            </>
          ) : (
            <div className='flex items-center gap-3'>
              <Button variant='ghost' size='sm' onClick={handleBackToGrid} className='-ml-2'>
                <IconEye className='h-4 w-4' />
              </Button>
              <h2 className='text-2xl font-bold'>
                {view === 'detail' ? 'Item Detail' : 'Godown Items'}
              </h2>
            </div>
          )}
        </div>
        {isGrid && (
          <Button
            variant='outline'
            onClick={() => navigate({ to: '/reports/stock_summary' })}
          >
            <IconEye className='mr-2 h-4 w-4' />
            Stock Summary Reports
          </Button>
        )}
      </div>

      <Separator />

      {/* Tabs (only show on grid views) */}
      {isGrid && (
        <Tabs value={tab} onValueChange={handleTabChange} className='space-y-4'>
          <TabsList>
            <TabsTrigger value='item-wise' className='flex items-center gap-2'>
              <IconPackage className='h-4 w-4' />
              Item Wise
            </TabsTrigger>
            <TabsTrigger value='godown-wise' className='flex items-center gap-2'>
              <IconBuildingWarehouse className='h-4 w-4' />
              Godown Wise
            </TabsTrigger>
          </TabsList>

          <TabsContent value='item-wise'>
            <ItemGrid
              items={items}
              onSelectItem={handleSelectItem}
              selectedItemId={selectedItemId}
            />
          </TabsContent>

          <TabsContent value='godown-wise'>
            <GodownGrid
              godowns={godowns}
              onSelectGodown={handleSelectGodown}
              selectedGodownId={selectedGodownId}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Godown Items View */}
      {view === 'godown-items' && (
        <>
          {godownItemsLoading ? (
            <div className='flex items-center justify-center py-12'>
              <IconLoader2 className='h-8 w-8 animate-spin text-muted-foreground' />
            </div>
          ) : godownItems ? (
            <GodownItems
              data={godownItems}
              onSelectItem={(itemId) => {
                setSelectedItemId(itemId)
                setSelectedGodownDetailId(selectedGodownId)
                setView('detail')
              }}
              onBack={handleBackToGodowns}
              selectedItemId={selectedItemId}
            />
          ) : null}
        </>
      )}

      {/* Detail View */}
      {view === 'detail' && (
        <>
          {detailLoading ? (
            <div className='flex items-center justify-center py-12'>
              <IconLoader2 className='h-8 w-8 animate-spin text-muted-foreground' />
            </div>
          ) : detailError ? (
            <div className='text-center py-12 space-y-4'>
              <IconX className='h-12 w-12 text-destructive mx-auto' />
              <p className='text-lg font-medium text-destructive'>Failed to load detail</p>
              <Button variant='outline' onClick={handleBackToGrid}>
                Back
              </Button>
            </div>
          ) : detail ? (
            <RunningBalanceDetailView
              data={detail}
              onBack={handleBackToGrid}
              godownId={selectedGodownDetailId}
            />
          ) : null}
        </>
      )}
    </Main>
  )
}

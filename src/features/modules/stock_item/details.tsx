import { EntryPageHeader } from '@/components/entry-page-header'
import { Main } from '@/layouts/components/main'

import { useInventory } from '@/features/masters/inventory/context/inventory-context'
import { Package } from 'lucide-react'
import { useEffect } from 'react'
import { ActionPages } from './components/action-page'
import { type StockItem } from './data/schema'

interface StockItemProps {
  data?: StockItem
}

export default function StockItemDetails(props: StockItemProps) {
  const { setSideBarOpen } = useInventory()
  const { data } = props
  const isEdit = !!data

  useEffect(() => {
    setSideBarOpen && setSideBarOpen(false)
  }, [])

  return (
    <Main className="min-w-full">
      <div className="flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
        <EntryPageHeader
          backTo="/masters/inventory/stock_item"
          backLabel="Back to stock item list"
          isEdit={isEdit}
          name={data?.name}
          createTitle="Add New Stock Item"
          subtitle={
            isEdit
              ? `Manage inventory and valuation settings for ${data.name}.`
              : 'Fill in the details below to create a new stock item.'
          }
          avatar={<Package className="h-5 w-5 text-muted-foreground" />}
          status={isEdit ? (data.status as 'active' | 'inactive') : undefined}
        />

        {/* Form */}
        <div className="mx-auto w-full max-w-5xl pb-8">
          <ActionPages currentRow={data} key={`stock_items-${data?.id ?? 'add'}`} />
        </div>
      </div>
    </Main>
  )
}

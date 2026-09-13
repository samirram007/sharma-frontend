import { EntryPageHeader } from '@/components/entry-page-header'
import { Main } from '@/layouts/components/main'
import { Coins } from 'lucide-react'

import { ActionPages } from './components/action-page'
import { type Currency } from './data/schema'

interface CurrencyProps {
  data?: Currency
}

export default function CurrencyDetails(props: CurrencyProps) {
  const { data } = props
  const isEdit = !!data

  return (
    <Main>
      <div className="flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
        <EntryPageHeader
          backTo="/masters/organization/currency"
          backLabel="Back to currency list"
          isEdit={isEdit}
          name={data?.name}
          createTitle="Add New Currency"
          subtitle={
            isEdit
              ? `Manage formatting and exchange settings for ${data.name}.`
              : 'Fill in the details below to create a new currency.'
          }
          avatar={<Coins className="h-5 w-5 text-muted-foreground" />}
          status={isEdit ? data.status : undefined}
        />

        {/* Form */}
        <div className="mx-auto w-full max-w-3xl pb-8">
          <ActionPages currentRow={data} key={`currencies-${data?.id ?? 'add'}`} />
        </div>
      </div>
    </Main>
  )
}

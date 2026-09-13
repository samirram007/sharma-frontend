import { EntryPageHeader } from '@/components/entry-page-header'
import { Main } from '@/layouts/components/main'
import { Users } from 'lucide-react'

import { ActionPages } from './components/action-page'
import { type Distributor } from './data/schema'

interface DistributorProps {
  data?: Distributor
}

export default function DistributorDetails(props: DistributorProps) {
  const { data } = props
  const isEdit = !!data

  return (
    <Main className="min-w-full">
      <div className="flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
        <EntryPageHeader
          backTo="/masters/party/distributor"
          backLabel="Back to distributor list"
          isEdit={isEdit}
          name={data?.name}
          createTitle="Add New Distributor"
          subtitle={
            isEdit
              ? `Manage account and contact details for ${data.name}.`
              : 'Fill in the details below to create a new distributor.'
          }
          avatar={<Users className="h-5 w-5 text-muted-foreground" />}
          status={isEdit ? data.status : undefined}
        />

        {/* Form */}
        <div className="mx-auto w-full max-w-4xl pb-8">
          <ActionPages
            currentRow={data}
            key={`distributors-${data?.id ?? 'add'}`}
          />
        </div>
      </div>
    </Main>
  )
}

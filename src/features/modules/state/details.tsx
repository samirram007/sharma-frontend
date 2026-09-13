import { EntryPageHeader } from '@/components/entry-page-header'
import { Main } from '@/layouts/components/main'
import { MapPin } from 'lucide-react'

import { ActionPages } from './components/action-page'
import { type State } from './data/schema'

interface StateProps {
  data?: State
}

export default function StateDetails(props: StateProps) {
  const { data } = props
  const isEdit = !!data

  return (
    <Main>
      <div className="flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
        <EntryPageHeader
          backTo="/masters/organization/state"
          backLabel="Back to state list"
          isEdit={isEdit}
          name={data?.name}
          createTitle="Add New State"
          subtitle={
            isEdit
              ? `Manage codes and regional mapping for ${data.name}.`
              : 'Fill in the details below to create a new state.'
          }
          avatar={<MapPin className="h-5 w-5 text-muted-foreground" />}
        />

        {/* Form */}
        <div className="mx-auto w-full max-w-3xl pb-8">
          <ActionPages currentRow={data} key={`states-${data?.id ?? 'add'}`} />
        </div>
      </div>
    </Main>
  )
}

import { EntryPageHeader } from '@/components/entry-page-header'
import { Main } from '@/layouts/components/main'
import { Globe } from 'lucide-react'

import { ActionPages } from './components/action-page'
import { type Country } from './data/schema'

interface CountryProps {
  data?: Country
}

export default function CountryDetails(props: CountryProps) {
  const { data } = props
  const isEdit = !!data

  return (
    <Main>
      <div className="flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12">
        <EntryPageHeader
          backTo="/masters/organization/country"
          backLabel="Back to country list"
          isEdit={isEdit}
          name={data?.name}
          createTitle="Add New Country"
          subtitle={
            isEdit
              ? `Manage identification and dialing metadata for ${data.name}.`
              : 'Fill in the details below to create a new country.'
          }
          avatar={<Globe className="h-5 w-5 text-muted-foreground" />}
        />

        {/* Form */}
        <div className="mx-auto w-full max-w-3xl pb-8">
          <ActionPages currentRow={data} key={`countries-${data?.id ?? 'add'}`} />
        </div>
      </div>
    </Main>
  )
}

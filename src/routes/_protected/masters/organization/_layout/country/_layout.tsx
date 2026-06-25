import CountryProvider from '@/features/modules/country/contexts/country-context'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Loader } from 'lucide-react'

export const Route = createFileRoute(
  '/_protected/masters/organization/_layout/country/_layout',
)({

  component: () => {
    //const { data: country } = useSuspenseQuery(countryQueryOptions())
    return (
      <CountryProvider>
        <Outlet />
      </CountryProvider >
    )
  },
  errorComponent: () => <div> <span className='bg-red-400  '>Layout:</span> Error loading country data[]. </div>
  ,
  pendingComponent: () => <Loader className="animate-spin" />,
})



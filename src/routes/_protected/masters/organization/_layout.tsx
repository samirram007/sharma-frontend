import ForbiddenError from '@/features/errors/403'
import GeneralError from '@/features/errors/general-error'
import Organization from '@/features/masters/organization'
import OrganizationProvider from '@/features/masters/organization/context/organization-context'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/masters/organization/_layout',
)({
  component: () => {
    return (
      <OrganizationProvider>
        <Organization />
      </OrganizationProvider>
    )
  },
  notFoundComponent: () => <ForbiddenError minimal />,
  errorComponent: () => <GeneralError minimal />,
})

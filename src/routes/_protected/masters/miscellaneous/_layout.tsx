import ForbiddenError from '@/features/errors/403'
import GeneralError from '@/features/errors/general-error'

import Miscellaneous from '@/features/masters/miscellanous'
import MiscellanousProvider from '@/features/masters/miscellanous/context/miscellanous-context'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/masters/miscellaneous/_layout',
)({
  component: () => {
    return (
      <MiscellanousProvider>
        <Miscellaneous />
      </MiscellanousProvider>
    )
  },
  notFoundComponent: () => <ForbiddenError minimal />,
  errorComponent: () => <GeneralError minimal />,
})

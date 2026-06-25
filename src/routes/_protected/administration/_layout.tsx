
import GeneralError from '@/features/errors/general-error'
import NotFoundError from '@/features/errors/not-found-error'
import Administration from '@/features/masters/administration'
import AdministrationProvider from '@/features/masters/administration/context/administration-context'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/administration/_layout')({
  component: () => {
    return (
      <AdministrationProvider>
        <Administration />
      </AdministrationProvider>
    )
  },
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})


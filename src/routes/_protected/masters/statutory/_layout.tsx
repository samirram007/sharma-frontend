
import GeneralError from '@/features/errors/general-error'
import NotFoundError from '@/features/errors/not-found-error'
import Statutory from '@/features/masters/statutory'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/masters/statutory/_layout')({
    component: Statutory,
    notFoundComponent: NotFoundError,
    errorComponent: GeneralError,
})


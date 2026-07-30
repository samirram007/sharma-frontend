
import ForbiddenError from '@/features/errors/403'
import GeneralError from '@/features/errors/general-error'
import Statutory from '@/features/masters/statutory'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/masters/statutory/_layout')({
    component: Statutory,
    notFoundComponent: () => <ForbiddenError minimal />,
    errorComponent: () => <GeneralError minimal />,
})


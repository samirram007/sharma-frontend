import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/masters/organization/_layout/')({
    beforeLoad: async () => {
        throw redirect({ to: '/masters/organization/company' })
    },
})

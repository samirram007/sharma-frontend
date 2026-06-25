import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/masters/party/_layout/')({
    beforeLoad: async () => {
        throw redirect({ to: '/masters/party/distributor' })
    },
})

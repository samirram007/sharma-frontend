import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/masters/payroll/_layout/')({
    beforeLoad: async () => {
        throw redirect({ to: '/masters/payroll/employee' })
    },
})

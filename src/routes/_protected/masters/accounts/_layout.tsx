import GeneralError from '@/features/errors/general-error'
import NotFoundError from '@/features/errors/not-found-error'
import Accounts from '@/features/masters/accounts'
import AccountProvider from '@/features/masters/accounts/contexts/account-context'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
    '/_protected/masters/accounts/_layout',
)({
    component: () => {
        return (
            <AccountProvider>
                <Accounts />
            </AccountProvider>
        )
    },
    notFoundComponent: NotFoundError,
    errorComponent: GeneralError,
})



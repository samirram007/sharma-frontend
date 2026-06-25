import GeneralError from '@/features/errors/general-error'
import NotFoundError from '@/features/errors/not-found-error'
import RoleProvider from '@/features/modules/role/contexts/role-context'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
    '/_protected/administration/_layout/role/_layout',
)({
    component: () => {
        return (
            <RoleProvider>
                <Outlet />
            </RoleProvider>
        )
    },
    notFoundComponent: NotFoundError,
    errorComponent: GeneralError,
})



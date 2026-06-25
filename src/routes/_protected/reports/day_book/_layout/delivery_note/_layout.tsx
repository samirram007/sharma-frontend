import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
    '/_protected/reports/day_book/_layout/delivery_note/_layout',
)({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <>
            <Outlet />
        </>
    )
}

import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_protected/(auth)/user-fiscal-year/_layout',
)({
  component: Outlet,
})


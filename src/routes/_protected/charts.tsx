import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/charts')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected/charts"!</div>
}

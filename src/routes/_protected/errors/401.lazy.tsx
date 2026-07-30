import { createLazyFileRoute } from '@tanstack/react-router'
import UnauthorisedError from '@/features/errors/unauthorized-error'

export const Route = createLazyFileRoute('/_protected/errors/401')({
  component: () => <UnauthorisedError minimal />,
})

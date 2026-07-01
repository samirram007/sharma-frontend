import ForbiddenError from '@/features/errors/403'
import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/(errors)/403')({
  component: () => <ForbiddenError />,
})

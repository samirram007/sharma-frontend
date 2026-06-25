
import { createFileRoute } from '@tanstack/react-router'

import MastersLanding from '@/features/masters'

export const Route = createFileRoute('/_protected/masters/')({
    component: MastersLanding,
})


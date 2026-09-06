import ProfileComponent from '@/features/auth/profile'
import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

/**
 * `?tab=` deep-links to a specific profile tab (e.g. from the header avatar
 * menu → "Change Background"). Falls back to the Overview tab when absent.
 */
const profileSearchSchema = z.object({
  tab: z.enum(['overview', 'background', 'security', 'activity']).optional(),
})

export const Route = createFileRoute('/_protected/(auth)/profile/')({
  validateSearch: profileSearchSchema,
  component: ProfileComponent,
})

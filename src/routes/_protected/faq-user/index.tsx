import { faqQueryOptions } from '@/features/modules/faq/data/queryOptions'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import FaqHelpCenterTab from '@/features/modules/faq/components/help-center-tab'

export const Route = createFileRoute('/_protected/faq-user/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(faqQueryOptions()),
  component: FaqUserPage,
  errorComponent: () => (
    <div className="flex h-64 items-center justify-center">
      <p className="text-sm text-slate-500">
        Error loading FAQs. Please try again.
      </p>
    </div>
  ),
  pendingComponent: () => (
    <div className="flex h-64 items-center justify-center">
      <Loader className="h-6 w-6 animate-spin text-slate-400" />
    </div>
  ),
})

function FaqUserPage() {
  // Use the help-center tab component which provides search, category filters, and FAQ display
  return <FaqHelpCenterTab />
}

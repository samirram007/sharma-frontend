import { faqQueryOptions } from '@/features/modules/faq/data/queryOptions'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import Faq from '@/features/modules/faq'
import FaqProvider from '@/features/modules/faq/contexts/faq-context'

export const Route = createFileRoute('/_protected/faqs/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(faqQueryOptions()),
  component: FaqsPage,
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

function FaqsPage() {
  const { data: faq } = useSuspenseQuery(faqQueryOptions())
  return (
    <FaqProvider>
      <Faq data={faq?.data} />
    </FaqProvider>
  )
}

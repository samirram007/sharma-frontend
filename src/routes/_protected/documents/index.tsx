import { createFileRoute } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import { Main } from '@/layouts/components/main'
import { DocumentsManager } from '@/features/modules/document/components/documents-manager'
import { documentBrowseQueryOptions } from '@/features/modules/document/data/queryOptions'

export const Route = createFileRoute('/_protected/documents/')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(documentBrowseQueryOptions(null)),
  pendingComponent: () => (
    <Main className="min-w-full">
      <div className="flex h-64 items-center justify-center">
        <Loader className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    </Main>
  ),
  errorComponent: () => (
    <Main className="min-w-full">
      <div className="flex h-64 flex-col items-center justify-center text-sm text-slate-500">
        <p>There was a problem loading documents.</p>
        <p className="mt-1">Please try again.</p>
      </div>
    </Main>
  ),
  component: DocumentsPage,
})

function DocumentsPage() {
  return (
    <Main className="min-w-full">
      <DocumentsManager />
    </Main>
  )
}

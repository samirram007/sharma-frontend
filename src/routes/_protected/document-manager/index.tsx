import { Navigate, createFileRoute } from '@tanstack/react-router'

// The Document Manager lives at /documents. This route keeps the old
// /document-manager address working for links and bookmarks.
export const Route = createFileRoute('/_protected/document-manager/')({
  component: DocumentManagerRedirect,
})

function DocumentManagerRedirect() {
  return <Navigate to="/documents" replace />
}

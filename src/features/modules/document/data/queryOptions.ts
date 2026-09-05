import { useEffect, useState } from 'react'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  browseDocumentsService,
  createFolderService,
  deleteNodeService,
  documentMetaService,
  moveNodeService,
  searchDocumentsService,
  shareTargetsService,
  syncNodeSharesService,
  updateNodeService,
} from './api'

// ─── Query options ───────────────────────────────────────────────────────────

export const documentBrowseQueryOptions = (folderId: number | null) =>
  queryOptions({
    queryKey: ['document-manager', 'browse', folderId],
    queryFn: () => browseDocumentsService(folderId),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })

export const documentSearchQueryOptions = (term: string) =>
  queryOptions({
    queryKey: ['document-manager', 'search', term],
    queryFn: () => searchDocumentsService(term),
    staleTime: 1000 * 60 * 2,
    retry: 1,
    enabled: term.trim().length > 0,
  })

export const documentMetaQueryOptions = () =>
  queryOptions({
    queryKey: ['document-manager', 'meta'],
    queryFn: documentMetaService,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  })

// Legacy text-document query (still referenced by the /documents route loader).
export const documentsQueryOptions = () =>
  queryOptions({
    queryKey: ['document-manager', 'browse', null],
    queryFn: () => browseDocumentsService(null),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useDocumentBrowse(folderId: number | null) {
  return useQuery(documentBrowseQueryOptions(folderId))
}

/** Debounce helper — keeps search typing snappy without hammering the API. */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])
  return debounced
}

export function useDocumentSearch(term: string) {
  return useQuery(documentSearchQueryOptions(term))
}

export function useShareTargets(enabled = true) {
  return useQuery({
    queryKey: ['document-manager', 'share-targets'],
    queryFn: shareTargetsService,
    staleTime: 1000 * 60 * 5,
    retry: 1,
    enabled,
  })
}

// ─── Mutations ───────────────────────────────────────────────────────────────

function useInvalidateDocuments() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['document-manager'] })
}

export function useCreateFolder() {
  const invalidate = useInvalidateDocuments()
  return useMutation({
    mutationFn: createFolderService,
    onSuccess: () => invalidate(),
  })
}

export function useMoveNode() {
  const invalidate = useInvalidateDocuments()
  return useMutation({
    mutationFn: ({
      id,
      parentId,
    }: {
      id: number
      parentId: number | null
    }) => moveNodeService(id, parentId),
    onSuccess: () => invalidate(),
  })
}

export function useRenameNode() {
  const invalidate = useInvalidateDocuments()
  return useMutation({
    mutationFn: ({
      id,
      name,
    }: {
      id: number
      name: string
    }) => updateNodeService(id, { name }),
    onSuccess: () => invalidate(),
  })
}

export function useDeleteNode() {
  const invalidate = useInvalidateDocuments()
  return useMutation({
    mutationFn: (id: number) => deleteNodeService(id),
    onSuccess: () => invalidate(),
  })
}

export function useSyncShares() {
  const invalidate = useInvalidateDocuments()
  return useMutation({
    mutationFn: ({
      id,
      userIds,
      roleIds,
    }: {
      id: number
      userIds: number[]
      roleIds: number[]
    }) => syncNodeSharesService(id, { userIds, roleIds }),
    onSuccess: () => invalidate(),
  })
}

import { useEffect, useState } from 'react'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  browseDocumentsService,
  copyNodeService,
  createFolderService,
  createShortcutService,
  deleteNodeService,
  documentMetaService,
  folderOptionsService,
  folderStatsService,
  moveNodeService,
  searchDocumentsService,
  shareTargetsService,
  sharedByMeService,
  sharedWithMeService,
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

export const sharedWithMeQueryOptions = () =>
  queryOptions({
    queryKey: ['document-manager', 'shared-with-me'],
    queryFn: sharedWithMeService,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })

export const sharedByMeQueryOptions = () =>
  queryOptions({
    queryKey: ['document-manager', 'shared-by-me'],
    queryFn: sharedByMeService,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })

export const documentFolderOptionsQueryOptions = () =>
  queryOptions({
    queryKey: ['document-manager', 'folder-options'],
    queryFn: folderOptionsService,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })

export const documentMetaQueryOptions = () =>
  queryOptions({
    queryKey: ['document-manager', 'meta'],
    queryFn: documentMetaService,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  })

export const folderStatsQueryOptions = (folderId: number) =>
  queryOptions({
    queryKey: ['document-manager', 'stats', folderId],
    queryFn: () => folderStatsService(folderId),
    staleTime: 1000 * 60 * 2,
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
      conflict,
    }: {
      id: number
      parentId: number | null
      conflict?: 'replace' | 'rename'
    }) => moveNodeService(id, parentId, conflict),
    onSuccess: () => invalidate(),
  })
}

export function useRenameNode() {
  const invalidate = useInvalidateDocuments()
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      updateNodeService(id, { name }),
    onSuccess: () => invalidate(),
  })
}

/** Change a folder's accent colour (null resets to the default). */
export function useUpdateNodeColor() {
  const invalidate = useInvalidateDocuments()
  return useMutation({
    mutationFn: ({ id, color }: { id: number; color: string | null }) =>
      updateNodeService(id, { color }),
    onSuccess: () => invalidate(),
  })
}

export function useCopyNode() {
  const invalidate = useInvalidateDocuments()
  return useMutation({
    mutationFn: ({
      id,
      parentId,
      conflict,
    }: {
      id: number
      parentId: number | null
      conflict?: 'replace' | 'rename'
    }) => copyNodeService(id, parentId, conflict),
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
      permissions,
    }: {
      id: number
      userIds: number[]
      roleIds: number[]
      /** Per-target action grants, keyed "user:3" / "role:5". */
      permissions?: Record<string, string[]>
    }) => syncNodeSharesService(id, { userIds, roleIds, permissions }),
    onSuccess: () => invalidate(),
  })
}

export function useCreateShortcut() {
  const invalidate = useInvalidateDocuments()
  return useMutation({
    mutationFn: createShortcutService,
    onSuccess: () => invalidate(),
  })
}

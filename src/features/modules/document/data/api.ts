import { getData, postData, putData, deleteData } from '@/utils/dataClient'
import { API_BASE_URL } from '@/lib/env'
import axiosClient from '@/utils/axios-client'

export interface ShareTargets {
  users: Array<{ id: number; name: string; email: string }>
  roles: Array<{ id: number; name: string }>
}

const API_PATH = '/document-manager'

// ─── Browse / search ─────────────────────────────────────────────────────────

export async function browseDocumentsService(folderId: number | null) {
  const query = folderId != null ? `?folderId=${folderId}` : ''
  return await getData(`${API_PATH}/browse${query}`)
}

export async function searchDocumentsService(term: string) {
  return await getData(`${API_PATH}/search?q=${encodeURIComponent(term)}`)
}

/** Flat list of nodes other people shared with the current user. */
export async function sharedWithMeService() {
  return await getData(`${API_PATH}/shared-with-me`)
}

/** Flat list of the current user's nodes shared outward. */
export async function sharedByMeService() {
  return await getData(`${API_PATH}/shared-by-me`)
}

export async function documentMetaService() {
  return await getData(`${API_PATH}/meta`)
}

export async function shareTargetsService() {
  return await getData(`${API_PATH}/share-targets`)
}

export async function syncNodeSharesService(
  id: number,
  payload: {
    userIds: number[]
    roleIds: number[]
    /** Per-target action grants, keyed "user:3" / "role:5". */
    permissions?: Record<string, string[]>
  },
) {
  return await putData(`${API_PATH}/nodes/${id}/shares`, {
    user_ids: payload.userIds,
    role_ids: payload.roleIds,
    permissions: payload.permissions ?? {},
  })
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export async function createFolderService(payload: {
  name: string
  parentId?: number | null
  visibility?: string
  description?: string | null
}) {
  return await postData(`${API_PATH}/folders`, payload)
}

/**
 * Upload a single file. Uses axios directly (not dataClient) so we can attach
 * an onUploadProgress callback — dataClient's payload cleaning would also
 * mangle a FormData body.
 */
export async function uploadDocumentService(
  file: File,
  options: {
    parentId?: number | null
    name?: string
    visibility?: string
    categoryId?: number | null
    description?: string | null
    onProgress?: (percent: number) => void
    signal?: AbortSignal
  } = {},
) {
  const formData = new FormData()
  formData.append('file', file)
  if (options.name) formData.append('name', options.name)
  if (options.parentId != null)
    formData.append('parentId', String(options.parentId))
  if (options.visibility) formData.append('visibility', options.visibility)
  if (options.categoryId != null)
    formData.append('categoryId', String(options.categoryId))
  if (options.description) formData.append('description', options.description)

  // Relative path — axiosClient already has baseURL = API_BASE_URL, so
  // prefixing API_BASE_URL here would double it ("/api/api/...").
  return await axiosClient
    .post(`${API_PATH}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (!options.onProgress) return
        if (event.total) {
          options.onProgress(Math.round((event.loaded / event.total) * 100))
        }
      },
      signal: options.signal,
    })
    .then((response) => response.data)
}

export async function updateNodeService(
  id: number,
  payload: {
    name?: string
    visibility?: string
    categoryId?: number | null
    typeId?: number | null
    description?: string | null
    parentId?: number | null
  },
  conflict?: 'replace' | 'rename',
) {
  // PATCH — the backend route only accepts PATCH/DELETE on nodes/{node}.
  // Sent through axios directly (not dataClient) so a null parentId survives:
  // dataClient's removeEmptyStrings strips nulls, which would make moving a
  // node back to the root impossible.
  return await axiosClient
    .patch(
      `${API_PATH}/nodes/${id}`,
      conflict ? { ...payload, conflict } : payload,
    )
    .then((response) => response.data)
}

export async function moveNodeService(
  id: number,
  parentId: number | null,
  conflict?: 'replace' | 'rename',
) {
  return await updateNodeService(id, { parentId }, conflict)
}

/** Deep copy: folders clone their whole subtree (incl. stored files). */
export async function copyNodeService(
  id: number,
  parentId: number | null,
  conflict?: 'replace' | 'rename',
) {
  return await axiosClient
    .post(
      `${API_PATH}/nodes/${id}/copy`,
      conflict ? { parentId, conflict } : { parentId },
    )
    .then((response) => response.data)
}

/** A name collision reported by the backend's /conflicts pre-check. */
export interface NodeConflict {
  movedId: number
  movedName: string
  movedKind: 'folder' | 'file'
  movedSizeBytes?: number | null
  movedUpdatedAt?: string | null
  existingId?: number | null
  existingKind?: 'folder' | 'file' | null
  existingSizeBytes?: number | null
  existingUpdatedAt?: string | null
  existingOwnerName?: string | null
}

/**
 * Which destination siblings already hold the given names. Called before a
 * move/copy so the UI can offer Skip / Replace / Keep both. Root (null
 * parentId) never conflicts — the backend allows same-name roots — so the
 * call is skipped entirely in that case.
 */
export async function conflictsService(ids: number[], parentId: number) {
  return await postData(`${API_PATH}/conflicts`, { ids, parentId })
}

// ─── Shortcuts (links) ───────────────────────────────────────────────────

/** Create a shortcut to a folder/file inside parentId (null = root). */
export async function createShortcutService(payload: {
  targetId: number
  parentId?: number | null
  name?: string
}) {
  return await postData(`${API_PATH}/shortcuts`, {
    targetId: payload.targetId,
    parentId: payload.parentId ?? null,
    name: payload.name ?? null,
  })
}

/**
 * Where a shortcut points. Resolves to the target node shape; a broken
 * link rejects with HTTP 410 so the UI can offer cleanup.
 */
export async function resolveShortcutService(shortcutId: number) {
  return await getData(`${API_PATH}/shortcuts/${shortcutId}/resolve`)
}

/** Remove a broken shortcut (intact ones go through the normal delete). */
export async function deleteBrokenShortcutService(shortcutId: number) {
  return await deleteData(`${API_PATH}/shortcuts/${shortcutId}`)
}

/** Flat list of accessible folders — destination pickers for move/copy. */
export async function folderOptionsService() {
  return await getData(`${API_PATH}/folders`)
}

/** Recursive contents summary for a folder (files/folders counts + size). */
export async function folderStatsService(id: number) {
  return await getData(`${API_PATH}/nodes/${id}/stats`)
}

export async function deleteNodeService(id: number) {
  return await deleteData(`${API_PATH}/nodes/${id}`)
}

// ─── File streaming ──────────────────────────────────────────────────────────

/**
 * URL for the download/preview endpoints, shaped for the caller's transport:
 * - 'axios' → relative path (axiosClient's baseURL = API_BASE_URL adds /api)
 * - 'fetch' → absolute URL (native fetch has no baseURL)
 *
 * The transport is a required argument on purpose: picking the wrong variant
 * yields a doubled "/api/api/..." 404 (axios) or a request relative to the SPA
 * origin (fetch), so callers must state how they'll send the request.
 */
export function documentUrl(
  nodeId: number,
  action: 'download' | 'preview',
  transport: 'axios' | 'fetch',
) {
  const path = `${API_PATH}/nodes/${nodeId}/${action}`
  return transport === 'fetch' ? `${API_BASE_URL}${path}` : path
}

export async function downloadNodeService(id: number, name: string) {
  const response = await axiosClient.get(documentUrl(id, 'download', 'axios'), {
    responseType: 'blob',
  })
  const url = URL.createObjectURL(response.data as Blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

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

export async function documentMetaService() {
  return await getData(`${API_PATH}/meta`)
}

export async function shareTargetsService() {
  return await getData(`${API_PATH}/share-targets`)
}

export async function syncNodeSharesService(
  id: number,
  payload: { userIds: number[]; roleIds: number[] },
) {
  return await putData(`${API_PATH}/nodes/${id}/shares`, {
    user_ids: payload.userIds,
    role_ids: payload.roleIds,
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
  if (options.parentId != null) formData.append('parentId', String(options.parentId))
  if (options.visibility) formData.append('visibility', options.visibility)
  if (options.categoryId != null) formData.append('categoryId', String(options.categoryId))
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
) {
  return await putData(`${API_PATH}/nodes/${id}`, payload)
}

export async function moveNodeService(id: number, parentId: number | null) {
  return await updateNodeService(id, { parentId })
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

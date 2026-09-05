import { readFileSync } from 'node:fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'

// ─── Helpers ─────────────────────────────────────────────────────────────────
//
// The 404 regression this file guards against: axiosClient already sets
// baseURL = API_BASE_URL ("/api"), so a caller that ALSO prefixes
// API_BASE_URL produces "/api/api/…" URLs. These tests pin the transport
// contract: axios calls carry RELATIVE paths (baseURL supplies /api), and
// fetch-target URLs are ABSOLUTE (native fetch has no baseURL).

import { resolve } from 'node:path'

// Vitest runs without file:// import.meta.url here, so resolve sources from
// the project root (vitest always runs with cwd = sharma-frontend).
const THIS_DIR = resolve(process.cwd(), 'src/features/modules/document/data')

/**
 * api.ts reads VITE_API_BASE_URL at module scope, so each branch is tested by
 * stubbing the env var and re-importing the module fresh (same pattern as
 * src/lib/token-storage.test.ts). '/api' is the CI/dev default.
 */
async function loadApiModule() {
  vi.stubEnv('VITE_API_BASE_URL', '/api')
  vi.resetModules()
  return await import('./api')
}

/** Records every outgoing request instead of hitting the network. */
function useCapturingAdapter(client: AxiosInstance) {
  const requests: InternalAxiosRequestConfig[] = []
  client.defaults.adapter = async (config) => {
    requests.push(config)
    return {
      data: {},
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }
  }
  return requests
}

beforeEach(() => {
  vi.unstubAllEnvs()
  // jsdom lacks blob URL support; downloadNodeService needs both to finish.
  ;(URL as unknown as Record<string, unknown>).createObjectURL = vi.fn(
    () => 'blob:mock',
  )
  ;(URL as unknown as Record<string, unknown>).revokeObjectURL = vi.fn()
})

// ─── Transport contract of documentUrl ───────────────────────────────────────

describe('documentUrl transport contract', () => {
  it('axios transport returns a relative path (baseURL supplies /api)', async () => {
    const { documentUrl } = await loadApiModule()

    const url = documentUrl(7, 'download', 'axios')
    expect(url).toBe('/document-manager/nodes/7/download')
    expect(url.startsWith('/api')).toBe(false)
  })

  it('fetch transport returns an absolute URL prefixed with API_BASE_URL', async () => {
    const { documentUrl } = await loadApiModule()

    const url = documentUrl(7, 'preview', 'fetch')
    expect(url).toBe('/api/document-manager/nodes/7/preview')
  })

  it('the two transports differ only by API_BASE_URL (no doubled prefix)', async () => {
    const { documentUrl } = await loadApiModule()

    for (const action of ['download', 'preview'] as const) {
      const axiosUrl = documentUrl(7, action, 'axios')
      const fetchUrl = documentUrl(7, action, 'fetch')

      expect(fetchUrl).toBe(`/api${axiosUrl}`)
      // The actual 404 shape — must never appear in either variant.
      expect(axiosUrl.includes('/api/api/')).toBe(false)
      expect(fetchUrl.includes('/api/api/')).toBe(false)
    }
  })
})

// ─── Client calls must send single-prefixed URLs ─────────────────────────────

describe('document client calls', () => {
  it('uploadDocumentService posts to /document-manager/upload (not /api/api/…)', async () => {
    const { uploadDocumentService } = await loadApiModule()
    const requests = useCapturingAdapter((await import('@/utils/axios-client')).default)

    const file = new File(['hello'], 'report.pdf', { type: 'application/pdf' })
    await uploadDocumentService(file, { parentId: 3, visibility: 'private' })

    expect(requests).toHaveLength(1)
    const { url, baseURL, data, headers } = requests[0]
    expect(url).toBe('/document-manager/upload')
    expect(baseURL).toBe('/api')
    expect(String(url).includes('/api/api/')).toBe(false)
    expect(data).toBeInstanceOf(FormData)
    expect(headers['Content-Type']).toContain('multipart/form-data')
  })

  it('downloadNodeService gets the single-prefixed download URL', async () => {
    const { downloadNodeService } = await loadApiModule()
    const requests = useCapturingAdapter((await import('@/utils/axios-client')).default)

    await downloadNodeService(7, 'report.pdf')

    expect(requests).toHaveLength(1)
    const { url, baseURL } = requests[0]
    expect(url).toBe('/document-manager/nodes/7/download')
    expect(baseURL).toBe('/api')
    expect(String(url).includes('/api/api/')).toBe(false)
  })
})

// ─── Source guard: the anti-pattern must not come back ───────────────────────

describe('source guard: API_BASE_URL is never embedded in axiosClient calls', () => {
  // The original bug was `.post(\`${API_BASE_URL}${API_PATH}/upload\`, …)` on
  // axiosClient — a template-literal prefix axios would double. Scan the
  // client sources so a reintroduction fails CI even if no test exercises
  // that specific endpoint. (Line-based: catches the one-line template
  // literals Prettier emits for these calls.)
  it('no axiosClient method call in document api.ts prefixes API_BASE_URL', async () => {
    await loadApiModule() // still pin the env contract while scanning

    const source = readFileSync(resolve(THIS_DIR, 'api.ts'), 'utf8')
    const callLines = source.split('\n').filter((line) =>
      /axiosClient\.(get|post|put|patch|delete)\(/.test(line),
    )
    // If the call sites disappear entirely, the scan is checking nothing.
    expect(callLines.length).toBeGreaterThan(0)

    for (const line of callLines) {
      expect(line, `doubled prefix in: ${line.trim()}`).not.toContain(
        'API_BASE_URL',
      )
    }
  })

  it('every documentUrl call site declares its transport', async () => {
    const sources = [
      resolve(THIS_DIR, 'api.ts'),
      resolve(THIS_DIR, '../components/documents-manager.tsx'),
    ].map((path) => readFileSync(path, 'utf8'))

    for (const source of sources) {
      // Single-line call sites only ([^)\n]) — skips the multi-line function
      // definition — and the lookbehind skips declarations outright.
      const bareCalls =
        source.match(
          /(?<!function\s)documentUrl\((?:(?!,\s*'(?:axios|fetch)')[^)\n])*\)/g,
        ) ?? []
      expect(
        bareCalls,
        `documentUrl calls without a transport argument: ${bareCalls.join(', ')}`,
      ).toEqual([])
    }
  })
})

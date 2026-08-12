import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  attachReverbKeyDriftWarning,
  probeBroadcastAuthEndpoint,
} from './broadcast-drift'

describe('probeBroadcastAuthEndpoint', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('does not warn when the endpoint answers (any non-404 status)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ status: 403 }), // unauthenticated probe → 403
    )

    const result = await probeBroadcastAuthEndpoint('/broadcasting/auth')

    expect(result.status).toBe(403)
    expect(warn).not.toHaveBeenCalled()
  })

  it('does not warn when the endpoint answers 200 (fully reachable)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 200 }))

    const result = await probeBroadcastAuthEndpoint(
      'https://api.example.com/broadcasting/auth',
    )

    expect(result.status).toBe(200)
    expect(warn).not.toHaveBeenCalled()
  })

  it('warns when the endpoint returns 404 (route/host drift)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ status: 404 }))

    await probeBroadcastAuthEndpoint(
      'http://localhost:5173/api/broadcasting/auth',
    )

    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('404')
    expect(warn.mock.calls[0][0]).toContain(
      'http://localhost:5173/api/broadcasting/auth',
    )
  })

  it('warns when the endpoint is unreachable (network/CORS drift)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('Failed to fetch')),
    )

    const result = await probeBroadcastAuthEndpoint(
      'https://api.example.com/broadcasting/auth',
    )

    expect(result.status).toBeNull()
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('Could not reach')
    expect(warn.mock.calls[0][0]).toContain(
      'https://api.example.com/broadcasting/auth',
    )
  })
})

describe('attachReverbKeyDriftWarning', () => {
  function makeEcho() {
    const handlers: Record<string, (data: unknown) => void> = {}
    const connection = {
      bind: vi.fn((event: string, handler: (data: unknown) => void) => {
        handlers[event] = handler
      }),
    }
    return {
      echo: { connector: { pusher: { connection } } },
      emit: (event: string, data: unknown) => handlers[event]?.(data),
    }
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('warns on Reverb code 4001 (app key mismatch)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { echo, emit } = makeEcho()

    attachReverbKeyDriftWarning(echo)
    emit('error', {
      type: 'PusherError',
      data: '{"code":4001,"message":"Application does not exist"}',
    })

    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toContain('4001')
    expect(warn.mock.calls[0][0]).toContain('VITE_REVERB_APP_KEY')
  })

  it('warns only once even if the error fires repeatedly', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { echo, emit } = makeEcho()

    attachReverbKeyDriftWarning(echo)
    emit('error', { type: 'WebSocketError', error: { code: 4001 } })
    emit('error', { type: 'WebSocketError', error: { code: 4001 } })

    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('does not warn for unrelated error codes', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { echo, emit } = makeEcho()

    attachReverbKeyDriftWarning(echo)
    emit('error', { type: 'WebSocketError', error: { code: 4201 } })

    expect(warn).not.toHaveBeenCalled()
  })

  it('is a no-op when the Echo internals are unavailable', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    attachReverbKeyDriftWarning({})
    expect(warn).not.toHaveBeenCalled()
  })
})

/**
 * Runtime self-checks for the Reverb realtime configuration.
 *
 * The frontend cannot read the backend's `.env`, so these checks treat the
 * backend itself as the source of truth and log a console warning when the
 * `VITE_REVERB_*` settings drift from what the server actually serves:
 *
 * - `probeBroadcastAuthEndpoint` — GET-probes the channel-auth endpoint.
 *   Laravel registers `/broadcasting/auth` for GET|POST and answers with 403
 *   when unauthenticated, so any non-404 response means the route is registered
 *   and reachable. A 404 means a wrong host/path, a stale route cache, or a
 *   static server / proxy swallowing the request (e.g. the SPA host returning
 *   nginx 405s/404s). A network failure means the host is unreachable or CORS
 *   does not allow the request.
 *
 *   IMPORTANT: only run this probe as a *diagnostic after a real channel-auth
 *   request has failed*. A bare GET is answered with 403, which the browser
 *   logs as a "Failed to load resource" error in the devtools console even
 *   though the probe treats it as healthy. Probing eagerly on every page load
 *   therefore pollutes the console (dev and prod alike); probing on failure
 *   keeps the console clean when realtime works and gives an immediate
 *   explanation when it doesn't.
 * - `attachReverbKeyDriftWarning` — listens for Reverb's `pusher:error` close
 *   code 4001 ("Application does not exist") and warns when
 *   `VITE_REVERB_APP_KEY` does not match the backend's `REVERB_APP_KEY`. This
 *   one is safe to attach eagerly: it only warns on an actual error event.
 *
 * Both are non-blocking and only ever log warnings — they never throw.
 */

export interface EchoLike {
  connector?: {
    pusher?: {
      connection?: {
        bind: (event: string, handler: (data: unknown) => void) => unknown
      }
    }
  }
}

export interface ProbeResult {
  /** HTTP status of the probe, or null when the request failed entirely. */
  status: number | null
}

/** Reverb/Pusher protocol close codes for an invalid or unknown app key. */
const KEY_ERROR_CODES = new Set([4001, 4008])

const PREFIX = '[realtime]'

/**
 * Probe the channel-auth endpoint for existence/reachability. Resolves with
 * the HTTP status (`null` when the fetch failed) and warns on 404 or on
 * network/CORS failure.
 */
export async function probeBroadcastAuthEndpoint(
  authUrl: string,
): Promise<ProbeResult> {
  let status: number | null = null

  try {
    const response = await fetch(authUrl, {
      method: 'GET',
      credentials: 'include',
    })
    status = response.status

    if (status === 404) {
      console.warn(
        `${PREFIX} Broadcast auth endpoint returned 404: ${authUrl}\n` +
          'Laravel should serve GET|POST /broadcasting/auth. Check that the route ' +
          'is registered (re-run `php artisan route:cache` after deploys), the URL ' +
          'points at the API host, and no static server or proxy is intercepting it.',
      )
    }
  } catch (error) {
    console.warn(
      `${PREFIX} Could not reach the broadcast auth endpoint: ${authUrl}\n` +
        `(${error instanceof Error ? error.message : String(error)}). ` +
        'If this is a cross-origin request, make sure CORS includes broadcasting/*.',
    )
  }

  return { status }
}

/**
 * Recursively pull a Pusher/Reverb error code out of a connection error event.
 * Handles `{ type: 'PusherError', data: '{"code":4001,...}' }`,
 * `{ type: 'WebSocketError', error: { code: 4001 } }`, and plain `{ code }`.
 */
function extractErrorCode(data: unknown): number | null {
  if (typeof data === 'string') {
    try {
      return extractErrorCode(JSON.parse(data))
    } catch {
      return null
    }
  }

  if (typeof data !== 'object' || data === null) return null

  const record = data as Record<string, unknown>
  if (typeof record.code === 'number') return record.code

  for (const key of ['data', 'error'] as const) {
    const nested = record[key]
    if (
      typeof nested === 'string' ||
      (typeof nested === 'object' && nested !== null)
    ) {
      const code = extractErrorCode(nested)
      if (code !== null) return code
    }
  }

  return null
}

/**
 * Bind a one-shot warning that fires when Reverb rejects the WebSocket
 * connection because the app key does not exist on the server — i.e.
 * `VITE_REVERB_APP_KEY` drifts from the backend's `REVERB_APP_KEY`.
 * Safe to call with any Echo-like object (no-op when internals are missing).
 */
export function attachReverbKeyDriftWarning(echo: EchoLike): void {
  const connection = echo?.connector?.pusher?.connection
  if (!connection?.bind) return

  let warned = false
  connection.bind('error', (data) => {
    if (warned) return

    const code = extractErrorCode(data)
    if (code !== null && KEY_ERROR_CODES.has(code)) {
      warned = true
      console.warn(
        `${PREFIX} Reverb rejected the WebSocket connection (code ${code}): ` +
          'VITE_REVERB_APP_KEY does not match the backend REVERB_APP_KEY.',
      )
    }
  })
}

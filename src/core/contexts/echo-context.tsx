import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import {
  attachReverbKeyDriftWarning,
  probeBroadcastAuthEndpoint,
} from '@/lib/broadcast-drift'
import { API_BASE_URL } from '@/lib/env'
import axiosClient from '@/utils/axios-client'

// Augment Window type for Pusher
declare global {
  interface Window {
    Pusher: typeof Pusher
  }
}

type EchoInstance = InstanceType<typeof Echo>

interface EchoContextValue {
  echo: EchoInstance | null
}

const EchoContext = createContext<EchoContextValue>({ echo: null })

/**
 * Broadcast channel-authorization endpoint.
 *
 * Laravel registers it at `/broadcasting/auth` (NOT under `/api`) and without
 * an `authEndpoint` laravel-echo falls back to the relative `/broadcasting/auth`,
 * which resolves against the SPA's own origin. In production the SPA
 * (sharmahardware.co.in) is a different host than the API
 * (api.sharmahardware.co.in), so that request hits the static SPA host and gets
 * a 405. Derive the absolute URL from VITE_API_BASE_URL (e.g.
 * `https://api.sharmahardware.co.in/api` → `https://api.sharmahardware.co.in/broadcasting/auth`),
 * or override it explicitly with VITE_REVERB_AUTH_ENDPOINT.
 */
const BROADCAST_AUTH_ENDPOINT =
  import.meta.env.VITE_REVERB_AUTH_ENDPOINT ??
  (/^https?:\/\//i.test(API_BASE_URL)
    ? new URL('/broadcasting/auth', API_BASE_URL).toString()
    : '/broadcasting/auth')

export function EchoProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [echo, setEcho] = useState<EchoInstance | null>(null)
  // Fire the endpoint probe at most once per page load, only after a real
  // channel-auth failure that indicates endpoint drift (404 / network error).
  // (The WS app-key warning has its own once-guard.)
  const probeFiredRef = useRef(false)

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setEcho(null)
      return
    }

    // Define Pusher on window for laravel-echo
    window.Pusher = Pusher

    const instance = new Echo({
      broadcaster: 'reverb',
      key:
        import.meta.env.VITE_REVERB_APP_KEY ??
        'af749dfcf9c0012a6a40a3fd24650e4a',
      wsHost: import.meta.env.VITE_REVERB_HOST ?? window.location.hostname,
      wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
      wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
      forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
      enabledTransports: ['ws', 'wss'],
      withCredentials: true,
      authEndpoint: BROADCAST_AUTH_ENDPOINT,
      // Authorize private/presence channel subscriptions against the API host
      // with the current bearer token (axiosClient re-reads it on every request
      // and auto-refreshes on 401) instead of pusher-js's default same-origin
      // `/broadcasting/auth` POST, which 405s against the static SPA host.
      authorizer: (channel) => ({
        authorize: (socketId, callback) => {
          // axios resolves relative URLs against its baseURL (`/api`), which
          // would wrongly turn /broadcasting/auth into /api/broadcasting/auth.
          // Resolve against the SPA origin so dev (same-origin, via the Vite
          // proxy) and prod (absolute API URL) both post the right path.
          const authUrl = new URL(
            BROADCAST_AUTH_ENDPOINT,
            window.location.origin,
          ).toString()
          axiosClient
            .post(authUrl, {
              socket_id: socketId,
              channel_name: channel.name,
            })
            .then((response) => callback(null, response.data))
            .catch((error) => {
              // Diagnose endpoint drift once: only when the failure points at
              // the endpoint itself (404 = wrong host/path/route-cache, or a
              // network/CORS error). A 403/401 means the route exists and auth
              // failed elsewhere — probing would only add a second 403 console
              // entry with no diagnostic value. Probing only here (never
              // eagerly) keeps the console clean on healthy loads.
              const status = (error as { response?: { status?: number } })
                .response?.status
              if (
                !probeFiredRef.current &&
                (status === 404 || status === undefined)
              ) {
                probeFiredRef.current = true
                probeBroadcastAuthEndpoint(authUrl)
              }
              callback(
                error instanceof Error ? error : new Error(String(error)),
                null,
              )
            })
        },
      }),
    })

    setEcho(instance)

    // App-key drift check — binds to the WS connection's error event and warns
    // once when Reverb rejects the connection with code 4001/4008 (key
    // mismatch). Safe to attach eagerly: it only fires on an actual error.
    attachReverbKeyDriftWarning(instance)

    return () => {
      instance.disconnect()
      setEcho(null)
    }
  }, [isAuthenticated, user?.id])

  return (
    <EchoContext.Provider value={{ echo }}>{children}</EchoContext.Provider>
  )
}

export function useEcho() {
  const context = useContext(EchoContext)
  if (!context) {
    throw new Error('useEcho must be used within an EchoProvider')
  }
  return context
}

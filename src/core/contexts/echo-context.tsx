import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@/features/auth/contexts/AuthContext'

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

export function EchoProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [echo, setEcho] = useState<EchoInstance | null>(null)

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
    })

    setEcho(instance)

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

import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useEcho } from '@/core/contexts/echo-context'

/**
 * Hook that listens for real-time document changes inside the given folder
 * via Laravel Echo (private `document.folder.{id}` channel, authorized for
 * the folder owner and every share recipient) and invalidates the
 * document-manager caches so co-sharers see each other's created/uploaded
 * nodes without a manual refresh — host → client and client → host alike.
 *
 * Every document-manager query (browse, stats, folder tree, shared views)
 * shares the ['document-manager'] key prefix, so a single prefix
 * invalidation refreshes whichever of them are currently mounted.
 */
export function useRealtimeDocumentFolder(folderId: number | null) {
  const { echo } = useEcho()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!echo || folderId == null) return

    const channelName = `document.folder.${folderId}`
    const channel = echo.private(channelName)

    channel.listen('.document.node.changed', () => {
      void queryClient.invalidateQueries({ queryKey: ['document-manager'] })
    })

    return () => {
      try {
        echo.leave(channelName)
      } catch {
        // Ignore errors during disconnect
      }
    }
  }, [echo, folderId, queryClient])
}

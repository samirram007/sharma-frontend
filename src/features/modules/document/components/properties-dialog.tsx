import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatBytes } from '@/utils/format-num'
import { formatDistanceToNow } from '@/utils/date'
import { folderStatsQueryOptions } from '../data/queryOptions'
import { describeNode } from './preview-utils'
import { FileThumbnail, VisibilityBadge } from './file-thumbnail'
import { ShareSettingsPanel } from './share-settings-panel'
import type { DocumentNode } from '../data/schema'

/**
 * Properties dialog with two tabs:
 *  - General: thumbnail/icon, identity + content summary (read-only).
 *  - Sharing: full share settings (targets + per-target action grants),
 *    powered by the same ShareSettingsPanel as the Share dialog.
 */
export function PropertiesDialog({
  node,
  onClose,
}: {
  node: DocumentNode | null
  onClose: () => void
}) {
  const [tab, setTab] = useState<'general' | 'sharing'>('general')

  // Folder contents are summed server-side (subfolders included) and only
  // fetched while the dialog is open on a real folder node. The synthetic
  // root entry (id 0) has no backing node — no stats to fetch.
  const isRootPlaceholder = node?.id === 0
  const statsQuery = useQuery({
    ...folderStatsQueryOptions(node?.id ?? 0),
    enabled: node?.kind === 'folder' && !isRootPlaceholder,
  })

  // Reset to General whenever a different node opens.
  const [lastNodeId, setLastNodeId] = useState<number | null>(null)
  if (node && node.id !== lastNodeId) {
    setLastNodeId(node.id)
    setTab('general')
  }

  if (!node) return null

  const isFolder = node.kind === 'folder'
  const rows: Array<[string, React.ReactNode]> = [
    ['Name', node.name],
    ['Type', describeNode(node)],
    [
      'Size',
      isFolder
        ? isRootPlaceholder
          ? '—'
          : statsQuery.data?.data?.totalSizeBytes != null
            ? formatBytes(statsQuery.data.data.totalSizeBytes)
            : '…'
        : node.sizeBytes
          ? formatBytes(node.sizeBytes)
          : 'Unknown',
    ],
    [
      'Location',
      node.parentId == null
        ? 'All documents (root)'
        : `Folder #${node.parentId}`,
    ],
    ['Owner', node.ownerName ?? '—'],
    [
      'Visibility',
      <span key="visibility" className="inline-flex items-center gap-1.5">
        <VisibilityBadge node={node} />
        {node.visibility}
      </span>,
    ],
    ['Category', node.category?.name ?? 'None'],
    ['Document type', node.type?.name ?? 'None'],
    ['Description', node.description || '—'],
    [
      'Shared with',
      `${node.sharedWith.length} target${node.sharedWith.length === 1 ? '' : 's'}`,
    ],
    [
      'Contents',
      isFolder
        ? isRootPlaceholder
          ? 'All top-level folders and files'
          : statsQuery.isLoading
            ? '…'
            : `${statsQuery.data?.data?.filesCount ?? 0} file${
                (statsQuery.data?.data?.filesCount ?? 0) === 1 ? '' : 's'
              }, ${statsQuery.data?.data?.foldersCount ?? 0} folder${
                (statsQuery.data?.data?.foldersCount ?? 0) === 1 ? '' : 's'
              }`
        : '—',
    ],
    ['Created', node.createdAt ? formatDistanceToNow(node.createdAt) : '—'],
    ['Modified', node.updatedAt ? formatDistanceToNow(node.updatedAt) : '—'],
    ['ID', String(node.id)],
  ]

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileThumbnail node={node} large />
            Properties —{' '}
            {isFolder
              ? 'folder'
              : node.kind === 'shortcut'
                ? 'shortcut'
                : 'file'}
          </DialogTitle>
          <DialogDescription className="truncate">
            {node.name}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as 'general' | 'sharing')}
          className="flex min-h-0 flex-1 flex-col gap-3"
        >
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="sharing" className="gap-1.5">
              Sharing
              {node.sharedWith.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({node.sharedWith.length})
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="general"
            className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto"
          >
            {/* Thumbnail / icon header */}
            <div className="flex items-center gap-3 rounded-md border bg-muted/30 p-3">
              <FileThumbnail node={node} large />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{node.name}</p>
                <p className="text-xs text-muted-foreground">
                  {describeNode(node)}
                  {node.extension ? ` · .${node.extension}` : ''}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              {rows.map(([label, value]) => (
                <div key={label} className="contents">
                  <span className="py-0.5 text-muted-foreground">{label}</span>
                  <span className="break-all py-0.5 font-medium">
                    {value}
                    {label === 'Contents' &&
                    isFolder &&
                    statsQuery.isFetching &&
                    !isRootPlaceholder ? (
                      <span className="ml-1 inline h-3 w-3 animate-spin text-muted-foreground">
                        …
                      </span>
                    ) : null}
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent
            value="sharing"
            className="flex min-h-0 flex-1 flex-col overflow-y-auto"
          >
            {isRootPlaceholder ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                The root is a location, not a document — select a folder or file
                to manage its sharing.
              </p>
            ) : (
              <ShareSettingsPanel node={node} embedded onSaved={onClose} />
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

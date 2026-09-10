import {
  IconFile,
  IconFolderFilled,
  IconLink,
  IconLoader2,
  IconPencil,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { formatBytes } from '@/utils/format-num'
import { formatDistanceToNow } from '@/utils/date'
import { PreviewImage, VisibilityBadge } from './file-thumbnail'
import { previewFamily } from './preview-utils'
import { OwnerChipAvatar } from './document-grid'
import type { DocumentNode } from '../data/schema'

interface PreviewPaneProps {
  node: DocumentNode | null
  loading: boolean
  onPreviewFile: (file: DocumentNode) => void
  /** Open an editable text file (md/txt/csv/json/log) in the editor. */
  onEdit?: (node: DocumentNode) => void
  onDownload: (node: DocumentNode) => void
}

/**
 * Windows-Explorer-style details/preview panel: shows the selected node's
 * large preview (images render inline) plus its metadata. Docks to the right
 * of the file panel, stretching to the row height; when nothing is selected
 * it disappears entirely so the grid keeps the full width.
 */
export function PreviewPane({
  node,
  loading,
  onPreviewFile,
  onEdit,
  onDownload,
}: PreviewPaneProps) {
  // Text-family files get an Edit shortcut in the footer (hidden when the
  // host has no editor, mirroring the context menu).
  const isEditableText =
    node?.kind === 'file' && onEdit != null && previewFamily(node) === 'text'

  if (loading) {
    return (
      <aside className="hidden w-64 shrink-0 self-stretch rounded-md border p-4 xl:block">
        <div className="flex h-full items-center justify-center text-muted-foreground">
          <IconLoader2 className="h-5 w-5 animate-spin" />
        </div>
      </aside>
    )
  }
  if (!node) return null

  return (
    // Sticky within the workspace row so long grids keep the pane on screen;
    // capped to the viewport with its own scroll for very tall metadata.
    <aside className="hidden w-64 shrink-0 flex-col gap-3 self-stretch rounded-md border p-3 xl:flex xl:sticky xl:top-4 xl:max-h-[calc(100svh-2rem)] xl:overflow-y-auto">
      {/* Large preview area */}
      <div className="flex h-40 min-h-40 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/30">
        {node.kind === 'folder' ? (
          <IconFolderFilled className="h-14 w-14 text-amber-500 dark:text-amber-400" />
        ) : node.kind === 'shortcut' ? (
          <IconLink className="h-14 w-14 text-muted-foreground/50" />
        ) : (
          <div className="h-full w-full p-2">
            <PreviewImage node={node} />
          </div>
        )}
      </div>

      <div className="min-w-0">
        <p className="flex items-center gap-1.5 break-all text-sm font-medium">
          <span className="min-w-0 truncate" title={node.name}>
            {node.name}
          </span>
          <VisibilityBadge node={node} />
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {node.kind === 'folder'
            ? 'Folder'
            : node.kind === 'shortcut'
              ? 'Shortcut'
              : (node.extension?.toUpperCase() ?? 'File')}
          {node.kind === 'file' && node.sizeBytes != null && (
            <> · {formatBytes(node.sizeBytes)}</>
          )}
        </p>
        <OwnerChipAvatar node={node} />
      </div>

      <dl className="space-y-1.5 text-xs">
        {node.category && (
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Category</dt>
            <dd className="truncate font-medium">{node.category.name}</dd>
          </div>
        )}
        {node.type && (
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Type</dt>
            <dd className="truncate font-medium">{node.type.name}</dd>
          </div>
        )}
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Modified</dt>
          <dd className="truncate font-medium">
            {node.updatedAt ? formatDistanceToNow(node.updatedAt) : '—'}
          </dd>
        </div>
        {node.createdAt && (
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">Created</dt>
            <dd className="truncate font-medium">
              {formatDistanceToNow(node.createdAt)}
            </dd>
          </div>
        )}
        {node.description && (
          <div className="pt-1">
            <dt className="text-muted-foreground">Description</dt>
            <dd className="mt-0.5 break-words text-foreground">
              {node.description}
            </dd>
          </div>
        )}
      </dl>

      {node.kind === 'file' && (
        <div className="mt-auto flex gap-2">
          <Button
            size="sm"
            className="h-7 flex-1 gap-1 text-xs"
            onClick={() => onPreviewFile(node)}
          >
            <IconFile className="h-3.5 w-3.5" />
            Open
          </Button>
          {isEditableText && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 flex-1 gap-1 text-xs"
              onClick={() => onEdit?.(node)}
            >
              <IconPencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="h-7 flex-1 gap-1 text-xs"
            onClick={() => onDownload(node)}
          >
            Download
          </Button>
        </div>
      )}
    </aside>
  )
}

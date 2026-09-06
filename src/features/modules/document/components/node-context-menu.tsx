import type { ReactNode } from 'react'
import {
  IconArrowBackUp,
  IconClipboardCopy,
  IconCopy,
  IconEye,
  IconFolderPlus,
  IconLink,
  IconPhoto,
  IconInfoCircle,
  IconPencil,
  IconRefresh,
  IconTrash,
  IconUpload,
  IconUserCircle,
  IconUsersGroup,
} from '@tabler/icons-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { documentUrl, downloadNodeService } from '../data/api'
import { appearance } from './appearance-store'
import { previewFamily } from './preview-utils'
import type { ClipboardEntry } from './document-clipboard-store'
import type { DocumentNode } from '../data/schema'

export type { ClipboardEntry }

export interface NodeMenuActions {
  onPreview: (node: DocumentNode) => void
  onRename: (node: DocumentNode) => void
  onDelete: (node: DocumentNode) => void
  onShare: (node: DocumentNode) => void
  onMoveCopy: (node: DocumentNode, mode: 'move' | 'copy') => void
  onProperties: (node: DocumentNode) => void
  onClipboard: (node: DocumentNode, mode: 'copy' | 'cut') => void
  /** Create a shortcut to this node in the same folder. */
  onCreateShortcut?: (node: DocumentNode) => void
}

/**
 * Right-click menu shared by grid cards, table rows and folder-tree items:
 * preview/download, copy/cut for paste, move/copy to, share, rename, set as
 * profile image / background, properties, delete.
 */
export function NodeContextMenu({
  node,
  disabled,
  actions,
  children,
}: {
  node: DocumentNode
  disabled?: boolean
  actions: NodeMenuActions
  children: ReactNode
}) {
  const isImage = previewFamily(node) === 'image'

  return (
    <ContextMenu>
      <ContextMenuTrigger disabled={disabled} asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        {node.kind === 'file' && (
          <>
            <ContextMenuItem onSelect={() => actions.onPreview(node)}>
              <IconEye className="h-4 w-4" />
              Preview
            </ContextMenuItem>
            <ContextMenuItem
              onSelect={() => void downloadNodeService(node.id, node.name)}
            >
              <IconArrowBackUp className="h-4 w-4 rotate-180" />
              Download
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}

        <ContextMenuItem onSelect={() => actions.onClipboard(node, 'copy')}>
          <IconClipboardCopy className="h-4 w-4" />
          Copy
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => actions.onClipboard(node, 'cut')}>
          <IconClipboardCopy className="h-4 w-4 rotate-180" />
          Cut
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => actions.onMoveCopy(node, 'move')}>
          <IconArrowBackUp className="h-4 w-4" />
          Move to…
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => actions.onMoveCopy(node, 'copy')}>
          <IconCopy className="h-4 w-4" />
          Copy to…
        </ContextMenuItem>

        <ContextMenuSeparator />

        {actions.onCreateShortcut && node.kind !== 'shortcut' && (
          <ContextMenuItem onSelect={() => actions.onCreateShortcut?.(node)}>
            <IconLink className="h-4 w-4" />
            Create shortcut
          </ContextMenuItem>
        )}

        <ContextMenuItem onSelect={() => actions.onShare(node)}>
          <IconUsersGroup className="h-4 w-4" />
          Share
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => actions.onRename(node)}>
          <IconPencil className="h-4 w-4" />
          Rename
        </ContextMenuItem>

        {isImage && (
          <>
            <ContextMenuItem
              onSelect={() =>
                // Absolute URL — fetch URLs must include the /api prefix
                // (relative ones resolve against the SPA origin and 404).
                appearance.setAvatar(documentUrl(node.id, 'preview', 'fetch'))
              }
            >
              <IconUserCircle className="h-4 w-4" />
              Set as profile image
            </ContextMenuItem>
            <ContextMenuItem
              onSelect={() =>
                appearance.setWallpaper(
                  documentUrl(node.id, 'preview', 'fetch'),
                )
              }
            >
              <IconPhoto className="h-4 w-4" />
              Set as background
            </ContextMenuItem>
          </>
        )}

        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => actions.onProperties(node)}>
          <IconInfoCircle className="h-4 w-4" />
          Properties
        </ContextMenuItem>
        <ContextMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={() => actions.onDelete(node)}
        >
          <IconTrash className="h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

/**
 * Context menu for the empty background area — new folder, upload, paste,
 * refresh and properties. Used by the documents file panel and the folder
 * panel, mirroring the file dialog's background menu.
 */
export function BackgroundContextMenu({
  onNewFolder,
  onUpload,
  onPaste,
  canPaste,
  onRefresh,
  onProperties,
  children,
}: {
  onNewFolder: () => void
  /** Open the upload dialog (or a file picker in hosts without one). */
  onUpload?: () => void
  onPaste: () => void
  canPaste: boolean
  /** Re-fetch/sync the visible documents from the server. */
  onRefresh?: () => void
  /** Right-clicking empty space shows the properties of the open folder. */
  onProperties?: () => void
  children: ReactNode
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem onSelect={onNewFolder}>
          <IconFolderPlus className="h-4 w-4" />
          New folder
        </ContextMenuItem>
        {onUpload && (
          <ContextMenuItem onSelect={onUpload}>
            <IconUpload className="h-4 w-4" />
            Upload
          </ContextMenuItem>
        )}
        <ContextMenuItem disabled={!canPaste} onSelect={onPaste}>
          <IconClipboardCopy className="h-4 w-4" />
          Paste
        </ContextMenuItem>
        {onRefresh && (
          <ContextMenuItem onSelect={onRefresh}>
            <IconRefresh className="h-4 w-4" />
            Refresh
          </ContextMenuItem>
        )}
        {onProperties && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onSelect={onProperties}>
              <IconInfoCircle className="h-4 w-4" />
              Properties
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}

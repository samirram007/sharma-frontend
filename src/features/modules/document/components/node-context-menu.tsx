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
  IconLayoutGrid,
  IconTableRow,
  IconList,
  IconSortAscending,
  IconSortDescending,
  IconCheck,
  IconMarkdown,
  IconFileText,
  IconPalette,
} from '@tabler/icons-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { documentUrl, downloadNodeService } from '../data/api'
import { cn } from '@/lib/utils'
import { appearance } from './appearance-store'
import { previewFamily } from './preview-utils'
import { FOLDER_COLORS, DEFAULT_FOLDER_COLOR } from './folder-color-picker'
import type { ClipboardEntry } from './document-clipboard-store'
import type { DocumentNode } from '../data/schema'
import {
  DOCUMENT_SORT_OPTIONS,
  type DocumentSort,
  type DocumentView,
} from './document-toolbar'

export type { ClipboardEntry }

export interface NodeMenuActions {
  onPreview: (node: DocumentNode) => void
  /** Open an editable text file (md/txt/csv/json/log) in the text editor. */
  onEdit?: (node: DocumentNode) => void
  onRename: (node: DocumentNode) => void
  onDelete: (node: DocumentNode) => void
  onShare: (node: DocumentNode) => void
  onMoveCopy: (node: DocumentNode, mode: 'move' | 'copy') => void
  onProperties: (node: DocumentNode) => void
  onClipboard: (node: DocumentNode, mode: 'copy' | 'cut') => void
  /** Create a shortcut to this node in the same folder. */
  onCreateShortcut?: (node: DocumentNode) => void
  /** Change a folder's accent colour (null = default). */
  onChangeColor?: (node: DocumentNode, color: string | null) => void
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
  // Any text-family file opens in the editor; md/txt are the primary ones.
  const isEditableText = node.kind === 'file' && previewFamily(node) === 'text'

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
            {isEditableText && actions.onEdit && (
              <ContextMenuItem onSelect={() => actions.onEdit?.(node)}>
                <IconPencil className="h-4 w-4" />
                Edit
              </ContextMenuItem>
            )}
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

        {node.kind === 'folder' && actions.onChangeColor && (
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <IconPalette className="h-4 w-4" />
              Colour
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="grid grid-cols-6 gap-1 p-2">
              <ContextMenuItem
                className="h-7 w-7 justify-center p-0"
                title="Default"
                onSelect={() => actions.onChangeColor?.(node, null)}
              >
                <span
                  className="h-5 w-5 rounded-full"
                  style={{ backgroundColor: DEFAULT_FOLDER_COLOR }}
                />
              </ContextMenuItem>
              {FOLDER_COLORS.map((color) => (
                <ContextMenuItem
                  key={color.value}
                  className="h-7 w-7 justify-center p-0"
                  title={color.name}
                  aria-label={`Folder colour ${color.name}`}
                  onSelect={() => actions.onChangeColor?.(node, color.value)}
                >
                  <span
                    className="h-5 w-5 rounded-full"
                    style={{ backgroundColor: color.value }}
                  />
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}

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
  /** Create a new markdown file (New › Markdown file). */
  onNewMarkdown,
  /** Create a new plain text file (New › Text file). */
  onNewTextFile,
  onUpload,
  onPaste,
  canPaste,
  onRefresh,
  onProperties,
  /** Grid view mode submenu (documents manager only). */
  view,
  onViewChange,
  /** Sort submenu (documents manager only). */
  sort,
  onSortChange,
  children,
}: {
  onNewFolder: () => void
  /** Create a new markdown file (New › Markdown file). */
  onNewMarkdown?: () => void
  /** Create a new plain text file (New › Text file). */
  onNewTextFile?: () => void
  /** Open the upload dialog (or a file picker in hosts without one). */
  onUpload?: () => void
  onPaste: () => void
  canPaste: boolean
  /** Re-fetch/sync the visible documents from the server. */
  onRefresh?: () => void
  /** Right-clicking empty space shows the properties of the open folder. */
  onProperties?: () => void
  /** Current grid view — renders the submenu when provided. */
  view?: DocumentView
  onViewChange?: (view: DocumentView) => void
  /** Current sort — renders the submenu when provided. */
  sort?: DocumentSort
  onSortChange?: (sort: DocumentSort) => void
  children: ReactNode
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        {(onNewMarkdown || onNewTextFile) && (
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <IconFolderPlus className="h-4 w-4" />
              New
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-44">
              <ContextMenuItem onSelect={onNewFolder}>
                <IconFolderPlus className="h-4 w-4" />
                Folder
              </ContextMenuItem>
              {onNewMarkdown && (
                <ContextMenuItem onSelect={onNewMarkdown}>
                  <IconMarkdown className="h-4 w-4" />
                  Markdown file
                </ContextMenuItem>
              )}
              {onNewTextFile && (
                <ContextMenuItem onSelect={onNewTextFile}>
                  <IconFileText className="h-4 w-4" />
                  Text file
                </ContextMenuItem>
              )}
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}
        {!onNewMarkdown && !onNewTextFile && (
          <ContextMenuItem onSelect={onNewFolder}>
            <IconFolderPlus className="h-4 w-4" />
            New folder
          </ContextMenuItem>
        )}
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
        {view && onViewChange && (
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <IconLayoutGrid className="h-4 w-4" />
              View
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-40">
              {(
                [
                  ['cards', 'Cards', IconLayoutGrid],
                  ['list', 'List', IconTableRow],
                  ['table', 'Table', IconList],
                ] as const
              ).map(([value, label, Icon]) => (
                <ContextMenuItem
                  key={value}
                  onSelect={() => onViewChange(value)}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                  <IconCheck
                    className={cn(
                      'ml-auto h-4 w-4',
                      view === value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </ContextMenuItem>
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}
        {sort && onSortChange && (
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              {sort.dir === 'desc' ? (
                <IconSortDescending className="h-4 w-4" />
              ) : (
                <IconSortAscending className="h-4 w-4" />
              )}
              Sort by
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-40">
              {DOCUMENT_SORT_OPTIONS.map((option) => (
                <ContextMenuItem
                  key={option.key}
                  onSelect={() =>
                    onSortChange(
                      option.key === sort.key
                        ? {
                            key: option.key,
                            dir: sort.dir === 'asc' ? 'desc' : 'asc',
                          }
                        : { key: option.key, dir: 'asc' },
                    )
                  }
                >
                  {option.label}
                  <IconCheck
                    className={cn(
                      'ml-auto h-4 w-4',
                      sort.key === option.key ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </ContextMenuItem>
              ))}
              <ContextMenuSeparator />
              <ContextMenuItem
                onSelect={() =>
                  onSortChange({
                    key: sort.key,
                    dir: sort.dir === 'asc' ? 'desc' : 'asc',
                  })
                }
              >
                {sort.dir === 'asc' ? (
                  <IconSortDescending className="h-4 w-4" />
                ) : (
                  <IconSortAscending className="h-4 w-4" />
                )}
                {sort.dir === 'asc' ? 'Descending' : 'Ascending'}
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}
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

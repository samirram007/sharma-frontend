import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  IconFolder,
  IconFolderOpen,
  IconChevronRight,
  IconPlus,
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconLoader2,
  IconUpload,
  IconArrowBackUp,
  IconCopy,
  IconUsersGroup,
} from '@tabler/icons-react'
import {
  documentBrowseQueryOptions,
  sharedByMeQueryOptions,
  sharedWithMeQueryOptions,
} from '@/features/modules/document/data/queryOptions'
import { browseDocumentsService } from '@/features/modules/document/data/api'
import {
  BackgroundContextMenu,
  NodeContextMenu,
  type NodeMenuActions,
} from './node-context-menu'
import { useAuth } from '@/features/auth/contexts/AuthContext'
import type { DocumentNode } from '@/features/modules/document/data/schema'

export interface TreeFolder {
  id: number
  name: string
  parentId: number | null
  /** Children fetched lazily — undefined means "not expanded yet". */
  children?: TreeFolder[]
}

type ViewMode = 'browse' | 'shared-with-me' | 'shared-by-me'

interface FolderTreeProps {
  /** Set of folder ids the user has expanded (shared with the manager). */
  expanded: Set<number>
  onToggleExpand: (id: number) => void
  activeFolderId: number | null
  /** Transient highlight — e.g. the folder containing a clicked search result. */
  markedFolderId?: number | null
  onSelect: (folderId: number | null) => void
  onCreateFolder: (parentId: number | null) => void
  onRenameFolder: (folder: DocumentNode) => void
  onDeleteFolder: (folder: DocumentNode) => void
  onMoveCopyFolder: (folder: DocumentNode, mode: 'move' | 'copy') => void
  /** Full right-click action set — supplied by the manager. */
  menuActions: NodeMenuActions
  /** Active drag node id — folders become drop targets while dragging. */
  draggingNodeId?: number | null
  /** Drag started from a tree row — registers the dragged node. */
  onDragStartFolder?: (folder: DocumentNode) => void
  /** Drag finished (drop cancelled or completed) — clears the dragged node. */
  onDragEndFolder?: () => void
  onDropOnFolder: (
    folderId: number | null,
    options?: { copy?: boolean },
  ) => void
  /** OS file drop on a folder (or root when null) — upload straight into it. */
  onFileDropOnFolder?: (files: File[], folderId: number | null) => void
  /** Which view mode is active — controls the special shared items in the tree. */
  viewMode: ViewMode
  /** Whether the "Shared with me" view is active. */
  sharedOnly: boolean
  /** Whether the "Shared by me" view is active. */
  sharedByMe: boolean
  /** Open the upload dialog targeting the folder being right-clicked. */
  onUpload?: () => void
  /** Paste the clipboard into the folder being right-clicked (null = root). */
  onPaste?: (parentId: number | null) => void
  /** Whether the clipboard holds anything (enables Paste). */
  canPaste?: boolean
  /** Re-fetch/sync documents from the server. */
  onRefresh?: () => void
  /** Entry count for the "Shared with me" badge (undefined hides it). */
  sharedWithMeCount?: number
}

/**
 * Folder sidebar built on the real folder hierarchy. Roots come from the
 * current browse query; children load lazily when a folder is expanded.
 */
export function FolderTree({
  expanded,
  onToggleExpand,
  activeFolderId,
  markedFolderId = null,
  onSelect,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveCopyFolder,
  menuActions,
  draggingNodeId,
  onDragStartFolder,
  onDragEndFolder,
  onDropOnFolder,
  onFileDropOnFolder,
  sharedOnly,
  sharedByMe,
  onUpload,
  onPaste = () => {},
  canPaste = false,
  onRefresh,
  sharedWithMeCount,
}: FolderTreeProps) {
  // Which folder list to show in the tree depends on the view mode.
  const browse = useQuery(documentBrowseQueryOptions(null))
  const sharedQuery = useQuery({
    ...sharedWithMeQueryOptions(),
    enabled: sharedOnly,
  })
  const sharedByMeQuery = useQuery({
    ...sharedByMeQueryOptions(),
    enabled: sharedByMe,
  })

  const isFileDrag = useCallback(
    (event: React.DragEvent) =>
      Array.from(event.dataTransfer?.types ?? []).includes('Files'),
    [],
  )

  // Build a parent→children map from a flat folder list so we can display
  // shared folders as a tree even though the API returns them flat.
  // We annotate roots with a __children payload so TreeItem can render them.
  function buildSharedTree(
    folders: DocumentNode[],
  ): Array<DocumentNode & { __children?: DocumentNode[] }> {
    const byId = new Map(folders.map((f) => [f.id, f]))
    const childrenByParent = new Map<number | null, DocumentNode[]>()
    for (const f of folders) {
      const list = childrenByParent.get(f.parentId) ?? []
      list.push(f)
      childrenByParent.set(f.parentId, list)
    }
    const rootIds = folders.filter(
      (f) => f.parentId == null || !byId.has(f.parentId),
    )
    const out: Array<DocumentNode & { __children?: DocumentNode[] }> =
      rootIds.map((r) => ({
        ...r,
        __children: childrenByParent.get(r.id) ?? [],
      }))
    return out
  }

  const { user } = useAuth()

  const sharedWithMeRoots = sharedOnly
    ? buildSharedTree((sharedQuery.data?.data?.folders ?? []) as DocumentNode[])
    : []
  const sharedByMeRoots = sharedByMe
    ? buildSharedTree(
        (sharedByMeQuery.data?.data?.folders ?? []) as DocumentNode[],
      )
    : []

  // Collect all shared folder ids (both "Shared with me" and "Shared by me")
  // so we can exclude them from the "All documents" tree to avoid duplication.
  const sharedRoots = useMemo(
    () => sharedWithMeRoots.concat(sharedByMeRoots).map((f) => f.id),
    [sharedWithMeRoots, sharedByMeRoots],
  )
  const browseRoots = (browse.data?.data?.folders ?? []).filter(
    (folder: DocumentNode) =>
      folder.ownerId == null ||
      (folder.ownerId === user?.id && !sharedRoots.includes(folder.id)),
  )

  const folderHeaderTitle: string = sharedOnly
    ? 'Shared with me'
    : sharedByMe
      ? 'Shared by me'
      : 'Folders'

  return (
    <BackgroundContextMenu
      onNewFolder={() => onCreateFolder(null)}
      onUpload={onUpload}
      onPaste={() => onPaste(null)}
      canPaste={canPaste}
      onRefresh={onRefresh}
    >
      <div className="flex h-full flex-col rounded-md border bg-card p-2">
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm font-medium">{folderHeaderTitle}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title="New root folder"
            onClick={() => onCreateFolder(null)}
            disabled={sharedOnly || sharedByMe}
          >
            <IconPlus className="h-4 w-4" />
          </Button>
        </div>{' '}
        <div
          className="flex-1 space-y-0.5 overflow-y-auto"
          onDragOver={(event) => {
            if (draggingNodeId == null && !isFileDrag(event)) return
            event.preventDefault()
          }}
          onDrop={(event) => {
            if (draggingNodeId == null && !isFileDrag(event)) return
            event.preventDefault()
            event.stopPropagation()
            if (isFileDrag(event)) {
              if (event.dataTransfer?.files?.length) {
                onFileDropOnFolder?.(Array.from(event.dataTransfer.files), null)
              }
              return
            }
            // Ctrl held while dropping → copy instead of move.
            onDropOnFolder(null, { copy: event.ctrlKey || event.metaKey })
          }}
        >
          {/* "All documents" root entry — always visible. In shared mode it
            acts as a back link to return to browse (clears shared context). */}
          <button
            type="button"
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
              !sharedOnly && !sharedByMe && activeFolderId === null
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted/60'
            } ${draggingNodeId != null ? 'ring-1 ring-inset ring-primary/30' : ''}`}
            onClick={() => {
              if (sharedOnly || sharedByMe) {
                // In shared mode, return to browse.
                onSelect(0)
                return
              }
              onSelect(null)
            }}
          >
            <IconFolderOpen className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
            <span className="truncate">All documents</span>
          </button>

          {/* Private folder tree — always rendered beneath "All documents". */}
          {browse.isLoading ? (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
              <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
              Loading…
            </div>
          ) : (
            browseRoots.map((folder: DocumentNode) => (
              <TreeItem
                key={folder.id}
                folder={folder}
                depth={0}
                expanded={expanded}
                onToggleExpand={onToggleExpand}
                activeFolderId={activeFolderId}
                markedFolderId={markedFolderId}
                sharedOnly={sharedOnly}
                sharedByMe={sharedByMe}
                onSelect={onSelect}
                onCreateFolder={onCreateFolder}
                onRenameFolder={onRenameFolder}
                onDeleteFolder={onDeleteFolder}
                onMoveCopyFolder={onMoveCopyFolder}
                menuActions={menuActions}
                draggingNodeId={draggingNodeId}
                onDragStartFolder={onDragStartFolder}
                onDragEndFolder={onDragEndFolder}
                onDropOnFolder={onDropOnFolder}
                onFileDropOnFolder={onFileDropOnFolder}
              />
            ))
          )}

          {/* Shared-with-me entry — always reachable; its subtree renders
            when the view is active. */}
          <button
            type="button"
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
              sharedOnly
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted/60'
            } ${draggingNodeId != null ? 'ring-1 ring-inset ring-primary/30' : ''}`}
            onClick={() => onSelect(-1)}
          >
            <IconUsersGroup className="h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400" />
            <span className="min-w-0 flex-1 truncate">Shared with me</span>
            {sharedWithMeCount != null && sharedWithMeCount > 0
              ? sharedCountBadge(sharedWithMeCount)
              : null}
          </button>
          {sharedOnly &&
            sharedWithMeRoots.map((folder: DocumentNode) => (
              <TreeItem
                key={folder.id}
                folder={folder}
                depth={0}
                expanded={expanded}
                onToggleExpand={onToggleExpand}
                activeFolderId={activeFolderId}
                markedFolderId={markedFolderId}
                sharedOnly={sharedOnly}
                sharedByMe={sharedByMe}
                onSelect={onSelect}
                onCreateFolder={onCreateFolder}
                onRenameFolder={onRenameFolder}
                onDeleteFolder={onDeleteFolder}
                onMoveCopyFolder={onMoveCopyFolder}
                menuActions={menuActions}
                draggingNodeId={draggingNodeId}
                onDragStartFolder={onDragStartFolder}
                onDragEndFolder={onDragEndFolder}
                onDropOnFolder={onDropOnFolder}
                onFileDropOnFolder={onFileDropOnFolder}
              />
            ))}

          {/* Shared-by-me entry — same pattern. */}
          <button
            type="button"
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
              sharedByMe
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted/60'
            } ${draggingNodeId != null ? 'ring-1 ring-inset ring-primary/30' : ''}`}
            onClick={() => onSelect(-2)}
          >
            <IconUsersGroup className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
            <span className="truncate">Shared by me</span>
          </button>
          {sharedByMe &&
            sharedByMeRoots.map((folder: DocumentNode) => (
              <TreeItem
                key={folder.id}
                folder={folder}
                depth={0}
                expanded={expanded}
                onToggleExpand={onToggleExpand}
                activeFolderId={activeFolderId}
                markedFolderId={markedFolderId}
                sharedOnly={sharedOnly}
                sharedByMe={sharedByMe}
                onSelect={onSelect}
                onCreateFolder={onCreateFolder}
                onRenameFolder={onRenameFolder}
                onDeleteFolder={onDeleteFolder}
                onMoveCopyFolder={onMoveCopyFolder}
                menuActions={menuActions}
                draggingNodeId={draggingNodeId}
                onDragStartFolder={onDragStartFolder}
                onDragEndFolder={onDragEndFolder}
                onDropOnFolder={onDropOnFolder}
                onFileDropOnFolder={onFileDropOnFolder}
              />
            ))}
        </div>
      </div>
    </BackgroundContextMenu>
  )
}

interface TreeItemProps {
  folder: DocumentNode
  depth: number
  expanded: Set<number>
  markedFolderId?: number | null
  /** Whether "Shared with me" view is active */
  sharedOnly: boolean
  /** Whether "Shared by me" view is active */
  sharedByMe: boolean
  onToggleExpand: (id: number) => void
  activeFolderId: number | null
  onSelect: (folderId: number | null) => void
  onCreateFolder: (parentId: number | null) => void
  onRenameFolder: (folder: DocumentNode) => void
  onDeleteFolder: (folder: DocumentNode) => void
  onMoveCopyFolder: (folder: DocumentNode, mode: 'move' | 'copy') => void
  menuActions: NodeMenuActions
  draggingNodeId?: number | null
  onDragStartFolder?: (folder: DocumentNode) => void
  onDragEndFolder?: () => void
  onDropOnFolder: (
    folderId: number | null,
    options?: { copy?: boolean },
  ) => void
  onFileDropOnFolder?: (files: File[], folderId: number | null) => void
}
function TreeItem({
  folder,
  depth,
  expanded,
  onToggleExpand,
  activeFolderId,
  markedFolderId = null,
  sharedOnly,
  sharedByMe,
  onSelect,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveCopyFolder,
  menuActions,
  draggingNodeId,
  onDragStartFolder,
  onDragEndFolder,
  onDropOnFolder,
  onFileDropOnFolder,
}: TreeItemProps) {
  const [isFileHover, setIsFileHover] = useState(false)
  const [isMoveHover, setIsMoveHover] = useState(false)
  const isExpanded = expanded.has(folder.id)
  const isActive = activeFolderId === folder.id
  const isMarked = markedFolderId === folder.id
  const isSelfDrag = draggingNodeId === folder.id
  // A folder the user can browse but does not own — someone shared it with
  // them (directly, via role, or company-public). Marked so it stands out
  // in the tree.
  const { user } = useAuth()
  const isSharedWithMe = folder.ownerId != null && folder.ownerId !== user?.id

  // Children are fetched when the folder is expanded. For shared-view roots
  // the first level comes prebuilt (__children), so the fetch waits until the
  // user actually expands it; on refetch (stale cache) fresh data simply
  // replaces the prebuilt list via childFolders above.
  const childrenQuery = useQuery({
    queryKey: ['document-manager', 'browse', 'tree-children', folder.id],
    queryFn: () => browseDocumentsService(folder.id),
    enabled: isExpanded,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  })
  // Prebuilt children come only from the shared views' flat list
  // (buildSharedTree). NOTE: it can be an EMPTY array — the shared-with-me
  // list hides children of foreign-owned folders so they load via browse on
  // expand — so it must never shadow fetched data once the query resolves.
  // (A previous `prebuilt || fetched || []` chain kept the truthy empty
  // array and expanding a shared folder showed nothing.) Server-fetched
  // folders carry no __children key at all.
  const prebuiltChildren = (
    folder as DocumentNode & { __children?: DocumentNode[] }
  ).__children
  const fetchedChildren = childrenQuery.data?.data?.folders
  const childFolders = fetchedChildren ?? prebuiltChildren ?? []

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      event.stopPropagation()
      setIsFileHover(false)
      setIsMoveHover(false)
      if (Array.from(event.dataTransfer?.types ?? []).includes('Files')) {
        if (event.dataTransfer?.files?.length) {
          onFileDropOnFolder?.(Array.from(event.dataTransfer.files), folder.id)
        }
        return
      }
      if (draggingNodeId == null || draggingNodeId === folder.id) return
      // Ctrl held while dropping → copy instead of move.
      onDropOnFolder(folder.id, { copy: event.ctrlKey || event.metaKey })
    },
    [draggingNodeId, folder.id, onDropOnFolder, onFileDropOnFolder],
  )

  return (
    <div>
      <NodeContextMenu node={folder} actions={menuActions}>
        <div
          draggable
          onDragStart={(event) => {
            // Required for Firefox to initiate the drag at all.
            event.dataTransfer.setData('text/plain', folder.name)
            event.dataTransfer.effectAllowed = 'copyMove'
            onDragStartFolder?.(folder)
          }}
          onDragEnd={onDragEndFolder}
          className={`group relative flex items-center rounded-md pr-1 transition-colors ${
            isFileHover
              ? 'bg-primary/10 outline outline-1 outline-primary/50'
              : isMoveHover
                ? 'bg-muted'
                : ''
          } ${isSelfDrag ? 'opacity-50' : ''} ${
            isMarked ? 'ring-1 ring-inset ring-primary/40 bg-primary/5' : ''
          }`}
          onDragEnter={(event) => {
            if (Array.from(event.dataTransfer?.types ?? []).includes('Files')) {
              setIsFileHover(true)
            } else if (draggingNodeId != null) {
              setIsMoveHover(true)
            }
          }}
          onDragLeave={(event) => {
            const related = event.relatedTarget as Node | null
            if (!related || !event.currentTarget.contains(related)) {
              setIsFileHover(false)
              setIsMoveHover(false)
            }
          }}
          onDragOver={(event) => {
            if (
              draggingNodeId == null &&
              !Array.from(event.dataTransfer?.types ?? []).includes('Files')
            ) {
              return
            }
            event.preventDefault()
            event.stopPropagation()
            // Show copy cursor when Ctrl is held during the drag.
            event.dataTransfer.dropEffect =
              event.ctrlKey || event.metaKey ? 'copy' : 'move'
          }}
          onDrop={handleDrop}
        >
          <button
            type="button"
            aria-expanded={isExpanded}
            className="flex h-6 w-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground"
            onClick={(event) => {
              event.stopPropagation()
              onToggleExpand(folder.id)
            }}
          >
            <IconChevronRight
              className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            />
          </button>
          <button
            type="button"
            className={`flex min-w-0 flex-1 items-center gap-2 rounded-md py-1.5 pr-1 text-left text-sm transition-colors ${
              isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            style={{ paddingLeft: 0 }}
            onClick={() => {
              onSelect(folder.id)
              if (!isExpanded) onToggleExpand(folder.id)
            }}
          >
            {isExpanded ? (
              <IconFolderOpen
                className={`h-4 w-4 shrink-0 ${
                  folder.color ? '' : 'text-amber-600 dark:text-amber-500'
                }`}
                style={folder.color ? { color: folder.color } : undefined}
              />
            ) : (
              <IconFolder
                className={`h-4 w-4 shrink-0 ${
                  folder.color ? '' : 'text-amber-600 dark:text-amber-500'
                }`}
                style={folder.color ? { color: folder.color } : undefined}
              />
            )}
            {isFileHover ? (
              <IconUpload className="h-3.5 w-3.5 shrink-0 text-primary" />
            ) : null}
            <span className="truncate">{folder.name}</span>
            {isActive && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 rounded-md bg-muted"
              />
            )}
          </button>

          {/* Shared-with-me marker: a folder owned by someone else that the
            current user can still see — pinned to the far right. */}
          {isSharedWithMe && (
            <span
              className="mr-0.5 inline-flex shrink-0 items-center"
              title={`Shared by ${folder.ownerName ?? 'another user'}`}
            >
              <IconUsersGroup className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
            </span>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(event) => event.stopPropagation()}
              >
                <IconDotsVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              onClick={(event) => event.stopPropagation()}
            >
              <DropdownMenuItem onSelect={() => onCreateFolder(folder.id)}>
                <IconPlus className="h-4 w-4" />
                New subfolder
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => onMoveCopyFolder(folder, 'move')}
              >
                <IconArrowBackUp className="h-4 w-4" />
                Move to…
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => onMoveCopyFolder(folder, 'copy')}
              >
                <IconCopy className="h-4 w-4" />
                Copy to…
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onRenameFolder(folder)}>
                <IconPencil className="h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={() => onDeleteFolder(folder)}
              >
                <IconTrash className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </NodeContextMenu>

      {isExpanded && (
        <div style={{ paddingLeft: `${(depth + 1) * 12}px` }}>
          {childFolders.map((child: DocumentNode) => (
            <TreeItem
              key={child.id}
              folder={child}
              depth={depth + 1}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              activeFolderId={activeFolderId}
              markedFolderId={markedFolderId}
              sharedOnly={sharedOnly}
              sharedByMe={sharedByMe}
              onSelect={onSelect}
              onCreateFolder={onCreateFolder}
              onRenameFolder={onRenameFolder}
              onDeleteFolder={onDeleteFolder}
              onMoveCopyFolder={onMoveCopyFolder}
              menuActions={menuActions}
              draggingNodeId={draggingNodeId}
              onDragStartFolder={onDragStartFolder}
              onDragEndFolder={onDragEndFolder}
              onDropOnFolder={onDropOnFolder}
              onFileDropOnFolder={onFileDropOnFolder}
            />
          ))}
          {childFolders.length === 0 && !childrenQuery.isLoading && (
            <p
              className="py-0.5 text-xs text-transparent"
              style={{ paddingLeft: '20px' }}
            >
              ·
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/** sessionStorage key for the per-view-mode expanded-folder sets. */
const EXPANDED_KEY = 'documents.expanded-folders'

/** Violet count pill for the "Shared with me" entry. */
function sharedCountBadge(count: number) {
  const label = count > 99 ? '99+' : String(count)
  return (
    <span
      className="shrink-0 rounded-full bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-medium leading-none text-violet-700 dark:text-violet-300"
      title={`${count} item${count === 1 ? '' : 's'} shared with you`}
    >
      {label}
    </span>
  )
}

type ExpandedMap = Record<string, number[]>

function readExpandedMap(): ExpandedMap {
  try {
    const raw = sessionStorage.getItem(EXPANDED_KEY)
    return raw ? (JSON.parse(raw) as ExpandedMap) : {}
  } catch {
    return {}
  }
}

function writeExpandedMap(map: ExpandedMap): void {
  try {
    sessionStorage.setItem(EXPANDED_KEY, JSON.stringify(map))
  } catch {
    // Storage full/unavailable — expansion state is cosmetic, ignore.
  }
}

/**
 * Hook managing the expanded-folder set for the tree — one independent set
 * per view mode (browse / shared-with-me / shared-by-me) so switching views
 * keeps each tree's expansion as the user left it. The sets persist in
 * sessionStorage for the tab's lifetime (folder ids stay valid; folder
 * deletion is self-healing — stale ids simply match nothing).
 */
export function useExpandedFolders(mode: string) {
  const [map, setMap] = useState<ExpandedMap>(readExpandedMap)
  const expanded = useMemo(() => new Set(map[mode] ?? []), [map, mode])

  const update = useCallback(
    (updater: (prev: Set<number>) => Set<number>) => {
      setMap((prevMap) => {
        const current = new Set(prevMap[mode] ?? [])
        const next = updater(current)
        const nextMap = { ...prevMap, [mode]: [...next] }
        writeExpandedMap(nextMap)
        return nextMap
      })
    },
    [mode],
  )

  const toggle = useCallback(
    (id: number) => {
      update((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })
    },
    [update],
  )

  /** Bulk-expand (no collapsing) — marks a folder chain after a search click. */
  const expandAll = useCallback(
    (ids: number[]) => {
      if (ids.length === 0) return
      update((prev) => {
        const next = new Set(prev)
        for (const id of ids) next.add(id)
        return next
      })
    },
    [update],
  )

  return useMemo(
    () => ({ expanded, toggle, expandAll }),
    [expanded, toggle, expandAll],
  )
}

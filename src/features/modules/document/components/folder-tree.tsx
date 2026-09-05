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
} from '@tabler/icons-react'
import { documentBrowseQueryOptions } from '@/features/modules/document/data/queryOptions'
import type { DocumentNode } from '@/features/modules/document/data/schema'

export interface TreeFolder {
  id: number
  name: string
  parentId: number | null
  /** Children fetched lazily — undefined means "not expanded yet". */
  children?: TreeFolder[]
}

interface FolderTreeProps {
  /** Set of folder ids the user has expanded (shared with the manager). */
  expanded: Set<number>
  onToggleExpand: (id: number) => void
  activeFolderId: number | null
  onSelect: (folderId: number | null) => void
  onCreateFolder: (parentId: number | null) => void
  onRenameFolder: (folder: DocumentNode) => void
  onDeleteFolder: (folder: DocumentNode) => void
  /** Active drag node id — folders become drop targets while dragging. */
  draggingNodeId?: number | null
  onDropOnFolder: (folderId: number | null) => void
  /** OS file drop on a folder (or root when null) — upload straight into it. */
  onFileDropOnFolder?: (files: File[], folderId: number | null) => void
}

/**
 * Folder sidebar built on the real folder hierarchy. Roots come from the
 * current browse query; children load lazily when a folder is expanded.
 */
export function FolderTree({
  expanded,
  onToggleExpand,
  activeFolderId,
  onSelect,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  draggingNodeId,
  onDropOnFolder,
  onFileDropOnFolder,
}: FolderTreeProps) {
  const browse = useQuery(documentBrowseQueryOptions(null))
  const roots = browse.data?.data?.folders ?? []

  /** True when the drag carries OS files (upload) rather than an app node (move). */
  const isFileDrag = useCallback(
    (event: React.DragEvent) =>
      Array.from(event.dataTransfer?.types ?? []).includes('Files'),
    [],
  )

  return (
    <div className="flex h-full flex-col rounded-md border bg-card p-2">
      <div className="flex items-center justify-between px-2 py-1.5">
        <span className="text-sm font-medium">Folders</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          title="New root folder"
          onClick={() => onCreateFolder(null)}
        >
          <IconPlus className="h-4 w-4" />
        </Button>
      </div>

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
          onDropOnFolder(null)
        }}
      >
        {/* Root — dropping here moves a dragged node to the top level, or uploads OS files. */}
        <button
          type="button"
          className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
            activeFolderId === null
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted/60'
          } ${draggingNodeId != null ? 'ring-1 ring-inset ring-primary/30' : ''}`}
          onClick={() => onSelect(null)}
        >
          <IconFolderOpen className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
          <span className="truncate">All documents</span>
        </button>

        {browse.isLoading ? (
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
            <IconLoader2 className="h-3.5 w-3.5 animate-spin" />
            Loading…
          </div>
        ) : (
          roots.map((folder: DocumentNode) => (
            <TreeItem
              key={folder.id}
              folder={folder}
              depth={0}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              activeFolderId={activeFolderId}
              onSelect={onSelect}
              onCreateFolder={onCreateFolder}
              onRenameFolder={onRenameFolder}
              onDeleteFolder={onDeleteFolder}
              draggingNodeId={draggingNodeId}
              onDropOnFolder={onDropOnFolder}
              onFileDropOnFolder={onFileDropOnFolder}
            />
          ))
        )}
      </div>
    </div>
  )
}

interface TreeItemProps extends Omit<FolderTreeProps, 'expanded'> {
  folder: DocumentNode
  depth: number
  expanded: Set<number>
}

function TreeItem({
  folder,
  depth,
  expanded,
  onToggleExpand,
  activeFolderId,
  onSelect,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  draggingNodeId,
  onDropOnFolder,
  onFileDropOnFolder,
}: TreeItemProps) {
  const [isFileHover, setIsFileHover] = useState(false)
  const [isMoveHover, setIsMoveHover] = useState(false)
  const isExpanded = expanded.has(folder.id)
  const isActive = activeFolderId === folder.id

  // Children are fetched only when the folder has been expanded at least once.
  const childrenQuery = useQuery({
    ...documentBrowseQueryOptions(folder.id),
    enabled: isExpanded,
  })
  const childFolders = childrenQuery.data?.data?.folders ?? []

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
      onDropOnFolder(folder.id)
    },
    [draggingNodeId, folder.id, onDropOnFolder, onFileDropOnFolder],
  )

  return (
    <div>
      <div
        className={`group relative flex items-center rounded-md pr-1 transition-colors ${
          isFileHover
            ? 'bg-primary/10 outline outline-1 outline-primary/50'
            : isMoveHover
              ? 'bg-muted'
              : ''
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
          if (draggingNodeId == null && !Array.from(event.dataTransfer?.types ?? []).includes('Files')) {
            return
          }
          event.preventDefault()
          event.stopPropagation()
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
            isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
          style={{ paddingLeft: 0 }}
          onClick={() => {
            onSelect(folder.id)
            if (!isExpanded) onToggleExpand(folder.id)
          }}
        >
          {isExpanded ? (
            <IconFolderOpen className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
          ) : (
            <IconFolder className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
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
          <DropdownMenuContent align="end" onClick={(event) => event.stopPropagation()}>
            <DropdownMenuItem onSelect={() => onCreateFolder(folder.id)}>
              <IconPlus className="h-4 w-4" />
              New subfolder
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
              onSelect={onSelect}
              onCreateFolder={onCreateFolder}
              onRenameFolder={onRenameFolder}
              onDeleteFolder={onDeleteFolder}
              draggingNodeId={draggingNodeId}
              onDropOnFolder={onDropOnFolder}
              onFileDropOnFolder={onFileDropOnFolder}
            />
          ))}
          {childFolders.length === 0 && (
            <p
              className="py-1 text-xs text-muted-foreground/70"
              style={{ paddingLeft: '20px' }}
            >
              {childrenQuery.isLoading ? 'Loading…' : 'Empty'}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/** Hook managing the expanded-folder set for the tree. */
export function useExpandedFolders() {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const toggle = useCallback((id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])
  return useMemo(() => ({ expanded, toggle }), [expanded, toggle])
}

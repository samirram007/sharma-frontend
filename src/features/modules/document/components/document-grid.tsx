import { useEffect, useMemo, useRef, useState } from 'react'
import {
  IconFile,
  IconDotsVertical,
  IconDownload,
  IconPencil,
  IconTrash,
  IconEye,
  IconUsersGroup,
  IconArrowBackUp,
  IconCopy,
  IconLink,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatBytes } from '@/utils/format-num'
import { formatDistanceToNow } from '@/utils/date'
import { downloadNodeService } from '@/features/modules/document/data/api'
import {
  FileThumbnail,
  ShortcutGlyph,
  VisibilityBadge,
  isBrokenShortcut,
} from '@/features/modules/document/components/file-thumbnail'
import {
  NodeContextMenu,
  type NodeMenuActions,
} from '@/features/modules/document/components/node-context-menu'
import {
  isMarqueeFarEnough,
  marqueeRect,
  nodeRectFromElement,
  type Point,
} from './selection-utils'
import type { DocumentNode } from '@/features/modules/document/data/schema'

interface DocumentGridProps {
  /** In search mode this is a flat list of mixed folders/files. */
  folders: DocumentNode[]
  files: DocumentNode[]
  /** Shortcut aliases, rendered after folders + files. */
  shortcuts?: DocumentNode[]
  view: 'cards' | 'table'
  /** Present when rendering search results (breadcrumb is not applicable). */
  searchMode?: boolean
  onOpenFolder: (folder: DocumentNode) => void
  onPreviewFile: (file: DocumentNode) => void
  onRename: (node: DocumentNode) => void
  onDelete: (node: DocumentNode) => void
  onShare: (node: DocumentNode) => void
  onMoveCopy: (node: DocumentNode, mode: 'move' | 'copy') => void
  /** Full right-click action set — supplied by the manager. */
  menuActions: NodeMenuActions
  /** Drag the whole selection (dragged node must be part of it). */
  onDragStartNode: (node: DocumentNode) => void
  onDragEndNode: () => void
  /** Drop a dragged node onto a folder card/row in this grid → move it there. */
  onDropOnFolder?: (
    targetFolderId: number,
    options?: { copy?: boolean },
  ) => void
  /** File dropped onto a file → offer to group both into a new folder. */
  onDropOnFile?: (targetFile: DocumentNode) => void
  /** Id of the node currently being dragged (moves need a valid drop guard). */
  draggingNodeId?: number | null
  /** Multi-select state (marquee, ctrl-click, shift-range). */
  selectedIds?: Set<number>
  onSelectionChange?: (ids: Set<number>) => void
  /**
   * Optional element that hosts the marquee mousedown handler instead of the
   * grid container — the file panel, so drag-select also starts in the empty
   * space below/around the entries. Hit-testing still uses the grid.
   */
  marqueeSurface?: HTMLDivElement | null
  /** Double-click resolution for a shortcut alias. */
  onOpenShortcut?: (shortcut: DocumentNode) => void
}

interface GridEntryProps {
  node: DocumentNode
  draggingNodeId: number | null
  menuActions: NodeMenuActions
  onRename: (node: DocumentNode) => void
  onDelete: (node: DocumentNode) => void
  onShare: (node: DocumentNode) => void
  onMoveCopy: (node: DocumentNode, mode: 'move' | 'copy') => void
  view: 'cards' | 'table'
  searchMode: boolean
  onDragStartNode: (node: DocumentNode) => void
  onDragEndNode: () => void
  onPreviewFile: (file: DocumentNode) => void
  onDropOnFolder?: (
    targetFolderId: number,
    options?: { copy?: boolean },
  ) => void
  /** File dropped onto a file → offer to group both into a new folder. */
  onDropOnFile?: (targetFile: DocumentNode) => void
  selected: boolean
  /** Selection is active (more than one row) — render selection chrome. */
  selectionActive: boolean
  onEntryClick: (node: DocumentNode, event: React.MouseEvent) => void
  /** Double-click opens folders / previews files / resolves shortcuts. */
  onEntryOpen: (node: DocumentNode) => void
}

/**
 * One grid entry (card or table row). Folder entries double as drop targets:
 * dragging another node onto them moves it into that folder — mirroring the
 * folder-tree behavior. Hooks live here (not in the .map callback).
 */
function GridEntry({
  node,
  draggingNodeId,
  menuActions,
  onRename,
  onDelete,
  onShare,
  onMoveCopy,
  view,
  searchMode,
  onDragStartNode,
  onDragEndNode,
  onPreviewFile,
  onDropOnFolder,
  onDropOnFile,
  selected,
  selectionActive,
  onEntryClick,
  onEntryOpen,
}: GridEntryProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const isFolderTarget = node.kind === 'folder'
  const isFileTarget = node.kind === 'file'
  // Only app-internal drags count as "move"; OS file drags fall through to
  // the page-level upload handler. Never drop a folder onto itself.
  const canAccept =
    isFolderTarget && draggingNodeId != null && draggingNodeId !== node.id
  // File→file drops (different nodes, same parent) can group into a folder.
  const canGroup =
    isFileTarget && draggingNodeId != null && draggingNodeId !== node.id
  const broken = isBrokenShortcut(node)

  const handleDragStart = (event: React.DragEvent) => {
    // Required for Firefox to initiate the drag at all. 'move' is listed so
    // the OS cursor works without modifiers; browsers synthesize 'copy' when
    // Ctrl is held even though it is not in effectAllowed.
    event.dataTransfer.setData('text/plain', node.name)
    event.dataTransfer.effectAllowed = 'copyMove'
    onDragStartNode(node)
  }

  const dropBindings = isFolderTarget
    ? {
        onDragEnter: (event: React.DragEvent) => {
          if (canAccept && (event.ctrlKey || event.metaKey)) {
            event.dataTransfer.dropEffect = 'copy'
          }
          if (canAccept) setIsDragOver(true)
        },
        onDragOver: (event: React.DragEvent) => {
          if (!canAccept) return
          event.preventDefault()
          event.stopPropagation()
          // Ctrl⌘ held → copy cursor; otherwise move.
          event.dataTransfer.dropEffect =
            event.ctrlKey || event.metaKey ? 'copy' : 'move'
        },
        onDragLeave: (event: React.DragEvent) => {
          const related = event.relatedTarget as Node | null
          if (!related || !event.currentTarget.contains(related))
            setIsDragOver(false)
        },
        onDrop: (event: React.DragEvent) => {
          event.preventDefault()
          event.stopPropagation()
          setIsDragOver(false)
          if (!canAccept) return
          // Ctrl⌘ held → copy into the target instead of moving.
          onDropOnFolder?.(node.id, { copy: event.ctrlKey || event.metaKey })
        },
      }
    : isFileTarget
      ? {
          onDragEnter: () => {
            if (canGroup) setIsDragOver(true)
          },
          onDragOver: (event: React.DragEvent) => {
            if (!canGroup) return
            event.preventDefault()
            event.stopPropagation()
            event.dataTransfer.dropEffect = 'move'
          },
          onDragLeave: (event: React.DragEvent) => {
            const related = event.relatedTarget as Node | null
            if (!related || !event.currentTarget.contains(related))
              setIsDragOver(false)
          },
          onDrop: (event: React.DragEvent) => {
            event.preventDefault()
            event.stopPropagation()
            setIsDragOver(false)
            if (!canGroup) return
            onDropOnFile?.(node)
          },
        }
      : {}

  /** Badges: shortcut chain link + visibility shield. */
  const badges = (
    <>
      {node.kind === 'shortcut' && (
        <span className="inline-flex items-center" title="Shortcut">
          <ShortcutGlyph large />
        </span>
      )}
      <VisibilityBadge node={node} large />
    </>
  )

  if (view === 'table') {
    return (
      <NodeContextMenu node={node} actions={menuActions}>
        <TableRow
          data-node-id={node.id}
          draggable={!broken}
          onDragStart={handleDragStart}
          onDragEnd={onDragEndNode}
          {...dropBindings}
          onClick={(event) => onEntryClick(node, event)}
          onDoubleClick={() => onEntryOpen(node)}
          className={`cursor-grab select-none active:cursor-grabbing ${
            selected ? 'bg-primary/10' : ''
          } ${
            isDragOver
              ? 'bg-primary/10 outline outline-1 outline-primary/50'
              : ''
          } ${broken ? 'opacity-50' : ''}`}
        >
          <TableCell>
            <span className="flex min-w-0 items-center gap-2">
              <FileThumbnail node={node} />
              <span
                className={`truncate font-medium ${broken ? 'line-through' : ''}`}
              >
                {node.name}
              </span>
              {broken && (
                <span className="text-xs text-muted-foreground">(missing)</span>
              )}
            </span>
          </TableCell>
          {!searchMode && (
            <TableCell>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                {node.kind === 'folder'
                  ? 'Folder'
                  : node.kind === 'shortcut'
                    ? 'Shortcut'
                    : (node.extension ?? 'File')}
                {badges}
              </span>
            </TableCell>
          )}
          <TableCell className="text-xs text-muted-foreground">
            {node.kind === 'folder'
              ? '—'
              : node.kind === 'shortcut'
                ? '—'
                : formatBytes(node.sizeBytes)}
          </TableCell>
          <TableCell className="text-xs text-muted-foreground">
            {node.updatedAt ? formatDistanceToNow(node.updatedAt) : '—'}
          </TableCell>
          <TableCell className="text-right">
            <NodeActionsMenu
              node={node}
              onPreviewFile={onPreviewFile}
              onRename={onRename}
              onDelete={onDelete}
              onShare={onShare}
              onMoveCopy={onMoveCopy}
            />
          </TableCell>
        </TableRow>
      </NodeContextMenu>
    )
  }

  // Card view
  return (
    <NodeContextMenu node={node} actions={menuActions}>
      <div
        data-node-id={node.id}
        draggable={!broken}
        onDragStart={handleDragStart}
        onDragEnd={onDragEndNode}
        {...dropBindings}
        onClick={(event) => onEntryClick(node, event)}
        className={`group relative cursor-grab select-none rounded-lg border bg-card p-3 transition-shadow hover:shadow-sm active:cursor-grabbing ${
          selected
            ? 'border-primary/60 bg-primary/10 ring-1 ring-primary/50'
            : ''
        } ${isDragOver ? 'ring-2 ring-primary/60' : ''} ${broken ? 'opacity-50' : ''}`}
      >
        {selectionActive && selected && (
          <span className="absolute left-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            ✓
          </span>
        )}
        <span className="absolute right-1.5 top-1.5 flex items-center gap-1">
          {badges}
        </span>
        <button
          type="button"
          className="flex w-full flex-col items-start gap-2 text-left"
          onClick={(event) => {
            event.stopPropagation()
            onEntryClick(node, event)
          }}
          onDoubleClick={(event) => {
            event.stopPropagation()
            onEntryOpen(node)
          }}
        >
          <FileThumbnail node={node} large />
          <span
            className={`line-clamp-2 w-full break-all text-sm font-medium leading-snug ${broken ? 'line-through' : ''}`}
          >
            {node.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {node.kind === 'folder'
              ? 'Folder'
              : node.kind === 'shortcut'
                ? 'Shortcut'
                : `${node.extension?.toUpperCase() ?? 'File'} · ${formatBytes(node.sizeBytes)}`}
          </span>
        </button>
        <div className="absolute bottom-1.5 right-1.5">
          <NodeActionsMenu
            node={node}
            onPreviewFile={onPreviewFile}
            onRename={onRename}
            onDelete={onDelete}
            onShare={onShare}
            onMoveCopy={onMoveCopy}
          />
        </div>
      </div>
    </NodeContextMenu>
  )
}

export function DocumentGrid({
  folders,
  files,
  shortcuts = [],
  view,
  searchMode = false,
  onOpenFolder,
  onPreviewFile,
  onRename,
  onDelete,
  onShare,
  onMoveCopy,
  menuActions,
  onDragStartNode,
  onDragEndNode,
  onDropOnFolder,
  onDropOnFile,
  draggingNodeId = null,
  selectedIds,
  onSelectionChange,
  marqueeSurface,
  onOpenShortcut,
}: DocumentGridProps) {
  const entries = useMemo(
    () => [...folders, ...files, ...shortcuts],
    [folders, files, shortcuts],
  )

  const selection = selectedIds ?? new Set<number>()
  const selectionActive = selection.size > 0

  // ── Marquee (area) selection state ──
  const marqueeAnchor = useRef<Point | null>(null)
  const [marquee, setMarquee] = useState<{
    origin: Point
    current: Point
  } | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  /** Only the coordinates matter once the marquee is live. */
  interface MarqueePointer {
    clientX: number
    clientY: number
  }

  /** Everything beginMarquee reads is covered by this structural shape —
   * satisfied by both DOM MouseEvents (native listener) and React's. */
  interface MarqueeDown {
    button: number
    ctrlKey: boolean
    metaKey: boolean
    shiftKey: boolean
    target: EventTarget | null
    clientX: number
    clientY: number
  }

  const beginMarquee = (event: MarqueeDown) => {
    // Left button only, and never when starting on an entry or its action
    // buttons (their own handlers manage clicks/drags). Breadcrumb/nav and
    // interactive controls are excluded too — closest() covers descendants.
    if (event.button !== 0) return
    const target = event.target as HTMLElement | null
    if (
      target?.closest(
        '[data-node-id], button, a, input, select, textarea, [role=menuitem]',
      )
    )
      return
    marqueeAnchor.current = { x: event.clientX, y: event.clientY }
    if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
      onSelectionChange?.(new Set())
    }
  }

  // Wire the marquee starter to whichever surface hosts it — the grid
  // container itself, or the whole file panel passed by the manager. The
  // panel covers the empty space below/around the entries, so drag-select
  // works there too. Re-runs when the element mounts/changes.
  useEffect(() => {
    const surface = marqueeSurface ?? containerRef.current
    if (!surface) return
    surface.addEventListener('mousedown', beginMarquee)
    return () => surface.removeEventListener('mousedown', beginMarquee)
    // beginMarquee closes over the current entries/selection handlers.
  }, [marqueeSurface, entries])

  const updateMarquee = (event: MarqueePointer) => {
    const anchor = marqueeAnchor.current
    if (!anchor) return
    const current = { x: event.clientX, y: event.clientY }
    if (!isMarqueeFarEnough(anchor, current)) return
    setMarquee({ origin: anchor, current })
    // Hit-test every entry against the marquee rect (viewport space).
    const rect = marqueeRect(anchor, current)
    const hits = new Set<number>()
    for (const node of entries) {
      const element = containerRef.current?.querySelector(
        `[data-node-id="${node.id}"]`,
      )
      if (!element) continue
      const nodeRect = nodeRectFromElement(element)
      if (!nodeRect) continue
      if (
        rect.x < nodeRect.x + nodeRect.width &&
        rect.x + rect.width > nodeRect.x &&
        rect.y < nodeRect.y + nodeRect.height &&
        rect.y + rect.height > nodeRect.y
      ) {
        hits.add(node.id)
      }
    }
    onSelectionChange?.(hits)
  }

  const endMarquee = () => {
    marqueeAnchor.current = null
    setMarquee(null)
  }

  useEffect(() => {
    if (!marquee) return
    const onMouseMove = (event: MouseEvent) => updateMarquee(event)
    const onMouseUp = () => endMarquee()
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    // Dependencies intentionally cover only marquee + entries: updateMarquee
    // closes over the current selection handler via the manager's setState.
  }, [marquee, entries])

  /**
   * Entry click: plain click selects only that node; Ctrl/⌘ toggles it in
   * place; Shift extends a range from the last anchor. Folder/file opens are
   * handled on double-click or via the row's own buttons, so single clicks
   * stay selection-only.
   */
  const handleEntryClick = (node: DocumentNode, event: React.MouseEvent) => {
    const next = new Set(selection)
    if (event.ctrlKey || event.metaKey) {
      if (next.has(node.id)) next.delete(node.id)
      else next.add(node.id)
      onSelectionChange?.(next)
      return
    }
    if (event.shiftKey) {
      const lastId = lastSelectedId.current
      const lastIndex = entries.findIndex((entry) => entry.id === lastId)
      const thisIndex = entries.findIndex((entry) => entry.id === node.id)
      if (lastIndex >= 0 && thisIndex >= 0) {
        const [from, to] =
          lastIndex < thisIndex
            ? [lastIndex, thisIndex]
            : [thisIndex, lastIndex]
        for (let index = from; index <= to; index++) next.add(entries[index].id)
        onSelectionChange?.(next)
        return
      }
    }
    lastSelectedId.current = node.id
    onSelectionChange?.(new Set([node.id]))
  }
  const lastSelectedId = useRef<number | null>(null)

  /** Double-click: folders open in place; shortcuts follow their target. */
  const handleEntryOpen = (node: DocumentNode) => {
    if (node.kind === 'shortcut') {
      if (isBrokenShortcut(node)) {
        return
      }
      onOpenShortcut?.(node)
      return
    }
    if (node.kind === 'folder') {
      onOpenFolder(node)
      return
    }
    onPreviewFile(node)
  }

  const totalCount = entries.length

  if (totalCount === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
        <IconFile className="mb-2 h-8 w-8 text-muted-foreground/40" />
        <p>No documents here yet.</p>
        <p className="text-xs">
          Use the Upload button — or drag files straight onto this page.
        </p>
      </div>
    )
  }

  const renderEntry = (node: DocumentNode) => (
    <GridEntry
      key={node.id}
      node={node}
      draggingNodeId={draggingNodeId}
      menuActions={menuActions}
      onRename={onRename}
      onDelete={onDelete}
      onShare={onShare}
      onMoveCopy={onMoveCopy}
      view={view}
      searchMode={searchMode}
      onDragStartNode={onDragStartNode}
      onDragEndNode={onDragEndNode}
      onPreviewFile={onPreviewFile}
      onDropOnFolder={onDropOnFolder}
      onDropOnFile={onDropOnFile}
      selected={selection.has(node.id)}
      selectionActive={selectionActive}
      onEntryClick={handleEntryClick}
      onEntryOpen={handleEntryOpen}
    />
  )

  if (view === 'table') {
    return (
      <div className="space-y-3">
        <SelectionSummary
          count={selection.size}
          total={totalCount}
          onClear={() => onSelectionChange?.(new Set())}
        />
        <div
          ref={containerRef}
          className="relative rounded-md border"
          onMouseMove={updateMarquee}
          onMouseUp={endMarquee}
        >
          {marquee && <MarqueeBox marquee={marquee} />}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                {!searchMode && <TableHead className="w-28">Kind</TableHead>}
                <TableHead className="w-24">Size</TableHead>
                <TableHead className="w-32">Modified</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{entries.map(renderEntry)}</TableBody>
          </Table>
        </div>
      </div>
    )
  }

  // Card view
  return (
    <div className="space-y-3">
      <SelectionSummary
        count={selection.size}
        total={totalCount}
        onClear={() => onSelectionChange?.(new Set())}
      />
      <div
        ref={containerRef}
        className="relative"
        onMouseMove={updateMarquee}
        onMouseUp={endMarquee}
      >
        {marquee && <MarqueeBox marquee={marquee} />}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {entries.map(renderEntry)}
        </div>
      </div>
    </div>
  )
}

/** Small "n selected · clear" strip shown only while a selection is active. */
function SelectionSummary({
  count,
  total,
  onClear,
}: {
  count: number
  total: number
  onClear: () => void
}) {
  return (
    <p className="text-sm text-muted-foreground">
      {count > 0 ? (
        <>
          <span className="font-medium text-foreground">{count} selected</span>
          <button
            type="button"
            className="ml-2 underline hover:text-foreground"
            onClick={onClear}
          >
            clear
          </button>
          {' · '}
        </>
      ) : null}
      {total} item{total === 1 ? '' : 's'}
    </p>
  )
}

/** The selection rectangle drawn in viewport space — blue with a translucent fill. */
function MarqueeBox({
  marquee,
}: {
  marquee: { origin: Point; current: Point }
}) {
  const rect = marqueeRect(marquee.origin, marquee.current)
  return (
    <div
      className="pointer-events-none fixed z-40"
      style={{
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        border: '1px solid rgba(59, 130, 246, 0.9)',
        backgroundColor: 'rgba(59, 130, 246, 0.25)',
      }}
    />
  )
}

interface NodeActionsMenuProps {
  node: DocumentNode
  onPreviewFile: (file: DocumentNode) => void
  onRename: (node: DocumentNode) => void
  onDelete: (node: DocumentNode) => void
  onShare: (node: DocumentNode) => void
  onMoveCopy: (node: DocumentNode, mode: 'move' | 'copy') => void
}

function NodeActionsMenu({
  node,
  onPreviewFile,
  onRename,
  onDelete,
  onShare,
  onMoveCopy,
}: NodeActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
        >
          <IconDotsVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {node.kind === 'file' && (
          <>
            <DropdownMenuItem onSelect={() => onPreviewFile(node)}>
              <IconEye className="h-4 w-4" />
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => void downloadNodeService(node.id, node.name)}
            >
              <IconDownload className="h-4 w-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {node.kind === 'shortcut' && (
          <>
            <DropdownMenuItem
              onSelect={() => onPreviewFile(node)}
              disabled={!node.target}
            >
              <IconLink className="h-4 w-4" />
              {node.target ? 'Open target' : 'Broken link'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onSelect={() => onMoveCopy(node, 'move')}>
          <IconArrowBackUp className="h-4 w-4" />
          Move to…
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onMoveCopy(node, 'copy')}>
          <IconCopy className="h-4 w-4" />
          Copy to…
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onShare(node)}>
          <IconUsersGroup className="h-4 w-4" />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onRename(node)}>
          <IconPencil className="h-4 w-4" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={() => onDelete(node)}
        >
          <IconTrash className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

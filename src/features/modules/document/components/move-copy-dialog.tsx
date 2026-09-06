import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  IconChevronRight,
  IconCopy,
  IconFolder,
  IconFolderOpen,
  IconArrowBackUp,
  IconLoader2,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { documentFolderOptionsQueryOptions } from '@/features/modules/document/data/queryOptions'
import type { DocumentNode } from '@/features/modules/document/data/schema'

export interface FolderOption {
  id: number
  name: string
  parentId: number | null
}

export interface FolderOptionNode extends FolderOption {
  children: FolderOptionNode[]
}

/**
 * Build the destination tree from a flat folder list. `excludeIds` removes
 * the moved/copied folder itself and its descendants — dropping a folder
 * into its own subtree would create a cycle, so those options vanish
 * (a copy into a descendant is equally impossible).
 *
 * Edge cases: folders whose parent id is missing from the list (inaccessible
 * or deleted parent) are promoted to roots; children of an EXCLUDED folder
 * are dropped with it, never promoted to root.
 */
export function buildFolderTree(
  folders: FolderOption[],
  excludeIds: ReadonlySet<number> = new Set(),
): FolderOptionNode[] {
  const knownIds = new Set(folders.map((folder) => folder.id))

  const byParent = new Map<number | null, FolderOption[]>()
  for (const folder of folders) {
    if (excludeIds.has(folder.id)) continue
    // Only group under the declared parent when it exists in the list;
    // otherwise treat the folder as a root.
    const key =
      folder.parentId != null && knownIds.has(folder.parentId)
        ? folder.parentId
        : null
    const list = byParent.get(key) ?? []
    list.push(folder)
    byParent.set(key, list)
  }

  const build = (parentId: number | null): FolderOptionNode[] =>
    (byParent.get(parentId) ?? [])
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((folder) => ({ ...folder, children: build(folder.id) }))

  return build(null)
}

export type MoveCopyMode = 'move' | 'copy'

export interface MoveCopyTarget {
  node: DocumentNode
  mode: MoveCopyMode
}

/** Ids that would create a cycle: the folder itself plus all its descendants. */
export function selfAndDescendantIds(
  folders: FolderOption[],
  rootId: number,
): Set<number> {
  const childrenByParent = new Map<number, number[]>()
  for (const folder of folders) {
    if (folder.parentId == null) continue
    const list = childrenByParent.get(folder.parentId) ?? []
    list.push(folder.id)
    childrenByParent.set(folder.parentId, list)
  }

  const excluded = new Set<number>([rootId])
  const queue = [rootId]
  while (queue.length > 0) {
    const current = queue.pop() as number
    for (const child of childrenByParent.get(current) ?? []) {
      if (!excluded.has(child)) {
        excluded.add(child)
        queue.push(child)
      }
    }
  }
  return excluded
}

interface MoveCopyDialogProps {
  /** Non-null opens the dialog for that node + mode. */
  target: MoveCopyTarget | null
  onClose: () => void
  onConfirm: (
    node: DocumentNode,
    mode: MoveCopyMode,
    destinationId: number | null,
  ) => void
  isPending?: boolean
}

/**
 * Destination picker for move/copy. Shows "All documents" (root) plus the
 * accessible folder hierarchy; the current parent is preselected, and
 * options that would create a cycle are disabled with a hint.
 */
export function MoveCopyDialog({
  target,
  onClose,
  onConfirm,
  isPending,
}: MoveCopyDialogProps) {
  const folderList = useQuery({
    ...documentFolderOptionsQueryOptions(),
    enabled: target != null,
  })

  const node = target?.node ?? null
  const mode = target?.mode ?? 'move'

  const folders = useMemo<FolderOption[]>(
    () => (folderList.data?.data as FolderOption[] | undefined) ?? [],
    [folderList.data],
  )

  const excludedIds = useMemo(() => {
    if (!node || node.kind !== 'folder') return new Set<number>()
    return selfAndDescendantIds(folders, node.id)
  }, [folders, node])

  const [selectedId, setSelectedId] = useState<number | null>(null)

  const tree = useMemo(
    () => buildFolderTree(folders, excludedIds),
    [folders, excludedIds],
  )

  // Reset the selection each time a new target opens the dialog.
  const [resetKey, setResetKey] = useState<number | null>(null)
  if (node && resetKey !== node.id) {
    setResetKey(node.id)
    setSelectedId(node.parentId ?? null)
  }

  if (!node) return null

  const currentParentId = node.parentId ?? null
  const destination = selectedId
  const isUnchanged = destination === currentParentId

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[80vh] flex-col sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === 'copy' ? (
              <IconCopy className="h-4 w-4 text-primary" />
            ) : (
              <IconArrowBackUp className="h-4 w-4 text-primary" />
            )}
            {mode === 'copy' ? 'Copy' : 'Move'} “{node.name}”
          </DialogTitle>
          <DialogDescription>
            {mode === 'copy'
              ? 'Pick a destination folder. Folders are copied with all their contents.'
              : 'Pick the destination folder for this item.'}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto rounded-md border p-1">
          <DestinationRow
            label="All documents (root)"
            depth={0}
            selected={selectedId === null}
            disabled={false}
            onSelect={() => setSelectedId(null)}
          />
          {folderList.isLoading ? (
            <div className="flex items-center gap-2 p-2 text-xs text-muted-foreground">
              <IconLoader2 className="h-3.5 w-3.5 animate-spin" /> Loading
              folders…
            </div>
          ) : (
            tree.map((folder) => (
              <DestinationTreeItem
                key={folder.id}
                folder={folder}
                depth={1}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            ))
          )}
        </div>

        {excludedIds.size > 0 && (
          <p className="text-xs text-muted-foreground">
            A folder cannot be placed inside itself or its subfolders.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={isUnchanged || isPending}
            onClick={() => onConfirm(node, mode, destination)}
          >
            {isPending ? (
              <IconLoader2 className="h-4 w-4 animate-spin" />
            ) : mode === 'copy' ? (
              'Copy here'
            ) : (
              'Move here'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DestinationTreeItem({
  folder,
  depth,
  selectedId,
  onSelect,
}: {
  folder: FolderOptionNode
  depth: number
  selectedId: number | null
  onSelect: (id: number) => void
}) {
  const [open, setOpen] = useState(false)
  const hasChildren = folder.children.length > 0

  return (
    <div>
      <DestinationRow
        label={folder.name}
        depth={depth}
        selected={selectedId === folder.id}
        disabled={false}
        hasChildren={hasChildren}
        open={open}
        onToggle={() => setOpen((prev) => !prev)}
        onSelect={() => onSelect(folder.id)}
      />
      {open &&
        folder.children.map((child) => (
          <DestinationTreeItem
            key={child.id}
            folder={child}
            depth={depth + 1}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
    </div>
  )
}

function DestinationRow({
  label,
  depth,
  selected,
  disabled,
  hasChildren = false,
  open = false,
  onToggle,
  onSelect,
}: {
  label: string
  depth: number
  selected: boolean
  disabled?: boolean
  hasChildren?: boolean
  open?: boolean
  onToggle?: () => void
  onSelect: () => void
}) {
  return (
    <div
      className={`group flex items-center rounded-md pr-1 ${disabled ? 'opacity-40' : ''}`}
      style={{ paddingLeft: `${depth * 14}px` }}
    >
      {hasChildren ? (
        <button
          type="button"
          className="flex h-6 w-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground"
          onClick={(event) => {
            event.stopPropagation()
            onToggle?.()
          }}
        >
          <IconChevronRight
            className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-90' : ''}`}
          />
        </button>
      ) : (
        <span className="inline-block w-5 shrink-0" />
      )}
      <button
        type="button"
        disabled={disabled}
        className={`flex min-w-0 flex-1 items-center gap-2 rounded-md py-1.5 text-left text-sm transition-colors ${
          selected
            ? 'font-medium text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        } ${disabled ? 'cursor-not-allowed' : ''}`}
        onClick={onSelect}
      >
        {selected ? (
          <IconFolderOpen className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
        ) : (
          <IconFolder className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
        )}
        <span className="truncate">{label}</span>
      </button>
    </div>
  )
}

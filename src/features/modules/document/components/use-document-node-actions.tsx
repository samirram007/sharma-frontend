import { useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useCreateShortcut,
  useCopyNode,
  useDeleteNode,
  useMoveNode,
  useRenameNode,
  useUpdateNodeColor,
} from '@/features/modules/document/data/queryOptions'
import { conflictsService, type NodeConflict } from '../data/api'
import { ConflictDialog, type ConflictBatch } from './conflict-dialog'
import {
  MoveCopyDialog,
  type MoveCopyMode,
  type MoveCopyTarget,
} from './move-copy-dialog'
import { DocumentShareDialog } from './document-share-dialog'
import { PropertiesDialog } from './properties-dialog'
import type { NodeMenuActions } from './node-context-menu'
import {
  documentClipboard,
  useDocumentClipboard,
} from './document-clipboard-store'
import { documentUrl } from '../data/api'
import type { ConflictDecision } from './selection-utils'
import type { DocumentNode } from '../data/schema'

export interface DocumentNodeActions {
  /** Full right-click/menu action set, as used by the documents manager. */
  menuActions: NodeMenuActions
  /** Paste the clipboard entry into a destination folder (null = root). */
  pasteClipboard: (destinationId: number | null) => void
  /** Whether a clipboard entry is waiting for paste. */
  canPaste: boolean
  /** Open the rename dialog programmatically. */
  openRename: (node: DocumentNode) => void
  /** All dialogs the actions can open — render next to your tree. */
  dialogs: ReactNode
}

/**
 * The documents-manager's complete node action set, extracted so any picker
 * or panel can offer the same right-click experience: preview, download,
 * copy/cut + paste, move/copy (with Skip/Replace/Keep-both conflict flow),
 * share, rename, create shortcut, properties and delete.
 *
 * `onPreview` lets a host plug in its own viewer; the default opens the
 * node's preview endpoint in a new tab.
 */
export function useDocumentNodeActions(options?: {
  onPreview?: (node: DocumentNode) => void
}): DocumentNodeActions {
  const [renameTarget, setRenameTarget] = useState<DocumentNode | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<DocumentNode | null>(null)
  const [shareTarget, setShareTarget] = useState<DocumentNode | null>(null)
  const [moveCopyTarget, setMoveCopyTarget] = useState<MoveCopyTarget | null>(
    null,
  )
  const [propertiesTarget, setPropertiesTarget] = useState<DocumentNode | null>(
    null,
  )
  /** Copy/cut clipboard for paste — module-level store, survives remounts. */
  const clipboard = useDocumentClipboard()
  const [conflictBatch, setConflictBatch] = useState<ConflictBatch | null>(null)
  const pendingConflictBatch = useRef<
    ((decisions: ConflictDecision[]) => void) | null
  >(null)

  const renameNode = useRenameNode()
  const deleteNode = useDeleteNode()
  const moveNode = useMoveNode()
  const copyNode = useCopyNode()
  const createShortcutNode = useCreateShortcut()
  const updateNodeColor = useUpdateNodeColor()

  // ── Move/copy with a conflict pre-check (Skip / Replace / Keep both) ──
  const applyNodeAction = (
    node: Pick<DocumentNode, 'id' | 'name'>,
    mode: 'move' | 'copy',
    targetFolderId: number | null,
    conflict?: 'replace' | 'rename',
    onDone?: () => void,
  ) => {
    const onSuccess = (label: string) => {
      toast.success(`${mode === 'copy' ? 'Copied' : 'Moved'} "${label}".`)
      onDone?.()
    }
    const onError = (label: string) => {
      toast.error(`Could not ${mode} "${label}".`)
      onDone?.()
    }
    if (mode === 'copy') {
      copyNode.mutate(
        { id: node.id, parentId: targetFolderId, conflict },
        {
          onSuccess: () => onSuccess(node.name),
          onError: () => onError(node.name),
        },
      )
      return
    }
    moveNode.mutate(
      { id: node.id, parentId: targetFolderId, conflict },
      {
        onSuccess: () => onSuccess(node.name),
        onError: () => onError(node.name),
      },
    )
  }

  const runBatchWithConflictCheck = (
    nodes: Array<Pick<DocumentNode, 'id' | 'name'>>,
    mode: 'move' | 'copy',
    targetFolderId: number | null,
    onDone?: () => void,
  ) => {
    const executeBatch = (decisions?: ConflictDecision[]) => {
      const skipped = new Set(
        (decisions ?? [])
          .filter((d) => d.choice === 'skip')
          .map((d) => d.movedId),
      )
      const byChoice = (choice: 'replace' | 'rename') =>
        new Set(
          (decisions ?? [])
            .filter((d) => d.choice === choice)
            .map((d) => d.movedId),
        )
      const replaceIds = byChoice('replace')
      const renameIds = byChoice('rename')
      let executed = 0
      const finish = () => {
        executed += 1
        if (executed >= nodes.length) onDone?.()
      }
      for (const node of nodes) {
        if (skipped.has(node.id)) {
          finish()
          continue
        }
        const conflict = !decisions
          ? undefined
          : replaceIds.has(node.id)
            ? 'replace'
            : renameIds.has(node.id)
              ? 'rename'
              : undefined
        applyNodeAction(node, mode, targetFolderId, conflict, finish)
      }
    }

    // Root accepts same-name nodes — nothing to ask.
    if (targetFolderId === null) {
      executeBatch()
      return
    }
    void conflictsService(
      nodes.map((node) => node.id),
      targetFolderId,
    )
      .then((response) => {
        const conflicts = (response?.data ?? []) as NodeConflict[]
        if (conflicts.length === 0) {
          executeBatch()
          return
        }
        pendingConflictBatch.current = (batchDecisions) => {
          pendingConflictBatch.current = null
          setConflictBatch(null)
          executeBatch(batchDecisions)
        }
        setConflictBatch({ mode, parentId: targetFolderId, conflicts })
      })
      .catch(() =>
        toast.error('Could not check the destination for conflicts.'),
      )
  }

  const pasteClipboard = (destinationId: number | null) => {
    if (clipboard.entries.length === 0) return
    const mode = clipboard.mode
    // A cut is one-shot; a copy stays so the items can be pasted repeatedly.
    if (mode === 'cut') {
      documentClipboard.removePasted(
        clipboard.entries.map((entry) => entry.nodeId),
      )
    }
    runBatchWithConflictCheck(
      clipboard.entries.map((entry) => ({
        id: entry.nodeId,
        name: entry.name,
      })),
      mode === 'copy' ? 'copy' : 'move',
      destinationId,
    )
  }

  const confirmMoveCopy = (
    node: DocumentNode,
    mode: MoveCopyMode,
    destinationId: number | null,
  ) => {
    runBatchWithConflictCheck([node], mode, destinationId, () =>
      setMoveCopyTarget(null),
    )
  }

  const openRename = (node: DocumentNode) => {
    setRenameTarget(node)
    setRenameValue(node.name)
  }

  const submitRename = () => {
    if (!renameTarget || !renameValue.trim()) return
    renameNode.mutate(
      { id: renameTarget.id, name: renameValue.trim() },
      {
        onSuccess: () => {
          toast.success('Renamed.')
          setRenameTarget(null)
        },
        // Backend refuses duplicate sibling names (422) — surface its message.
        onError: (error) => {
          const message =
            (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ?? 'Could not rename.'
          toast.error(message)
        },
      },
    )
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    const isFolder = deleteTarget.kind === 'folder'
    deleteNode.mutate(deleteTarget.id, {
      onSuccess: () => {
        toast.success(
          isFolder
            ? `Folder "${deleteTarget.name}" and its contents deleted.`
            : `File "${deleteTarget.name}" deleted.`,
        )
        setDeleteTarget(null)
      },
      onError: () => toast.error(`Could not delete "${deleteTarget.name}".`),
    })
  }

  const menuActions: NodeMenuActions = {
    onPreview:
      options?.onPreview ??
      ((node) =>
        window.open(documentUrl(node.id, 'preview', 'fetch'), '_blank')),
    onRename: openRename,
    onDelete: setDeleteTarget,
    onShare: setShareTarget,
    onMoveCopy: (node, mode) => setMoveCopyTarget({ node, mode }),
    onProperties: setPropertiesTarget,
    onChangeColor: (node, color) => {
      updateNodeColor.mutate(
        { id: node.id, color },
        {
          onSuccess: () =>
            toast.success(
              color
                ? `Folder colour updated.`
                : 'Folder colour reset to default.',
            ),
          onError: () => toast.error('Could not update the folder colour.'),
        },
      )
    },
    onCreateShortcut: (node) => {
      createShortcutNode.mutate(
        { targetId: node.id, parentId: node.parentId },
        {
          onSuccess: () => toast.success(`Shortcut to "${node.name}" created.`),
          onError: () =>
            toast.error(`Could not create a shortcut to "${node.name}".`),
        },
      )
    },
    onClipboard: (node, mode) => {
      documentClipboard.set(
        [{ nodeId: node.id, name: node.name, kind: node.kind }],
        mode,
      )
      toast.success(
        mode === 'cut'
          ? `Cut "${node.name}" — open a folder and paste.`
          : `Copied "${node.name}" — paste anywhere, as often as you like.`,
      )
    },
  }

  const dialogs = (
    <>
      {/* Rename */}
      <Dialog
        open={renameTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename</DialogTitle>
            <DialogDescription>
              {renameTarget?.kind === 'folder'
                ? 'Renaming a folder keeps all of its contents.'
                : 'Choose a new name for this file.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="rename-input">Name</Label>
            <Input
              id="rename-input"
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              autoFocus
              onKeyDown={(event) => event.key === 'Enter' && submitRename()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>
              Cancel
            </Button>
            <Button
              disabled={!renameValue.trim() || renameNode.isPending}
              onClick={submitRename}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Delete {deleteTarget?.kind === 'folder' ? 'folder' : 'file'}?
            </DialogTitle>
            <DialogDescription>
              {deleteTarget?.kind === 'folder'
                ? `“${deleteTarget?.name}” and everything inside it will be permanently removed.`
                : `“${deleteTarget?.name}” will be permanently removed.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move/copy name collisions — Skip / Replace / Keep both (batch) */}
      <ConflictDialog
        batch={conflictBatch}
        onClose={() => {
          setConflictBatch(null)
          pendingConflictBatch.current = null
        }}
        onResolve={(decisions) => pendingConflictBatch.current?.(decisions)}
        isPending={moveNode.isPending || copyNode.isPending}
      />

      {/* Move / copy destination picker */}
      <MoveCopyDialog
        target={moveCopyTarget}
        onClose={() => setMoveCopyTarget(null)}
        onConfirm={confirmMoveCopy}
        isPending={moveNode.isPending || copyNode.isPending}
      />

      {/* Sharing */}
      <DocumentShareDialog
        node={shareTarget}
        onClose={() => setShareTarget(null)}
      />

      {/* Right-click properties */}
      <PropertiesDialog
        node={propertiesTarget}
        onClose={() => setPropertiesTarget(null)}
      />
    </>
  )

  return {
    menuActions,
    pasteClipboard,
    canPaste: clipboard.entries.length > 0,
    openRename,
    dialogs,
  }
}

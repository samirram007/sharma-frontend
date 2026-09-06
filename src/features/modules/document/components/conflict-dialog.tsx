import { useState } from 'react'
import {
  IconAlertTriangle,
  IconCopy,
  IconFile,
  IconFolder,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatBytes } from '@/utils/format-num'
import { formatDistanceToNow } from '@/utils/date'
import type { NodeConflict } from '@/features/modules/document/data/api'
import type { ConflictDecision } from './selection-utils'

export type ConflictChoice = 'skip' | 'replace' | 'rename'

/** A move/copy batch awaiting a user decision on its name collisions. */
export interface ConflictBatch {
  mode: 'move' | 'copy'
  parentId: number | null
  conflicts: NodeConflict[]
}

interface ConflictDialogProps {
  batch: ConflictBatch | null
  onClose: () => void
  /** Resolves with one decision per conflicted node. */
  onResolve: (decisions: ConflictDecision[]) => void
  isPending?: boolean
}

function KindIcon({ kind }: { kind?: 'folder' | 'file' | null }) {
  return kind === 'folder' ? (
    <IconFolder className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
  ) : (
    <IconFile className="h-4 w-4 shrink-0 text-muted-foreground" />
  )
}

function Meta({
  kind,
  size,
  date,
}: {
  kind?: string | null
  size?: number | null
  date?: string | null
}) {
  const parts = [
    kind === 'folder' ? 'Folder' : 'File',
    size != null ? formatBytes(size) : null,
    date ? formatDistanceToNow(date) : null,
  ].filter(Boolean)
  return (
    <span className="text-xs text-muted-foreground">{parts.join(' · ')}</span>
  )
}

/**
 * Shown after a move/copy pre-check finds name collisions. The user picks
 * Skip (do nothing), Replace (delete the destination item, keep the name),
 * or Keep both (the item lands as "name (2)"). With several collisions the
 * choice can apply to all of them or only to the first.
 */
export function ConflictDialog({
  batch,
  onClose,
  onResolve,
  isPending,
}: ConflictDialogProps) {
  const [applyToAll, setApplyToAll] = useState(true)

  if (!batch) return null
  const { conflicts, mode, parentId } = batch
  const verb = mode === 'copy' ? 'copy' : 'move'
  const destination = parentId === null ? 'the root' : 'the destination folder'

  const resolve = (choice: ConflictChoice) => {
    onResolve(
      conflicts.map((conflict, index) => ({
        movedId: conflict.movedId,
        // "Apply to all" mirrors the choice across the batch; otherwise the
        // choice covers only the collision being inspected and the rest are
        // skipped (nothing is mutated without an explicit decision).
        choice: applyToAll || index === 0 ? choice : 'skip',
      })),
    )
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconAlertTriangle className="h-4 w-4 text-amber-500" />
            {conflicts.length === 1 ? (
              <>An item named “{conflicts[0].movedName}” already exists</>
            ) : (
              <>{conflicts.length} items already exist in the destination</>
            )}
          </DialogTitle>
          <DialogDescription>
            You are about to {verb} {conflicts.length === 1 ? 'it' : 'them'}{' '}
            into {destination}. Choose what to do with the existing item
            {conflicts.length === 1 ? '' : 's'}.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-72 space-y-2 overflow-y-auto rounded-md border p-3">
          {(conflicts.length > 1 ? [conflicts[0]] : conflicts).map(
            (conflict) => (
              <div key={conflict.movedId} className="space-y-2">
                <div className="flex items-center gap-2">
                  <KindIcon kind={conflict.existingKind} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      Existing — “{conflict.movedName}”
                    </p>
                    <Meta
                      kind={conflict.existingKind}
                      size={conflict.existingSizeBytes}
                      date={conflict.existingUpdatedAt}
                    />
                    {conflict.existingOwnerName ? (
                      <p className="text-xs text-muted-foreground">
                        Shared by {conflict.existingOwnerName}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center gap-2 border-t pt-2">
                  <KindIcon kind={conflict.movedKind} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {mode === 'copy' ? 'Your copy' : 'This item'}
                    </p>
                    <Meta
                      kind={conflict.movedKind}
                      size={conflict.movedSizeBytes}
                      date={conflict.movedUpdatedAt}
                    />
                  </div>
                  <IconCopy className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              </div>
            ),
          )}
          {conflicts.length > 1 && (
            <p className="text-xs text-muted-foreground">
              Showing “{conflicts[0].movedName}” — {conflicts.length - 1} more{' '}
              {conflicts.length - 1 === 1 ? 'item' : 'items'} of the same kind.
            </p>
          )}
        </div>

        {conflicts.length > 1 && (
          <div className="flex items-center gap-2">
            <Checkbox
              id="conflict-apply-all"
              checked={applyToAll}
              onCheckedChange={(checked) => setApplyToAll(checked === true)}
            />
            <Label htmlFor="conflict-apply-all" className="text-sm font-normal">
              Apply this choice to all {conflicts.length} items
            </Label>
          </div>
        )}

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Skip
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() => resolve('rename')}
            >
              Keep both
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => resolve('replace')}
            >
              Replace
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

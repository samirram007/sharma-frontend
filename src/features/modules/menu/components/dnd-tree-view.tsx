import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Input } from '@/components/ui/input'

import { resolveIcon } from '@/features/modules/menu/data/menu-icon-map'
import { cn } from '@/lib/utils'
import { ActiveInactiveStatusTypes } from '@/types/active-inactive-status'
import {
  IconChevronDown,
  IconCopy,
  IconEdit,
  IconEye,
  IconEyeOff,
  IconGripVertical,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { reorderMenuService } from '../data/api'
import type { MenuTreeNode } from '../data/schema'
import {
  useMenuBatchDeleteMutation,
  useMenuBatchUpdateMutation,
  useMenuQuickUpdateMutation,
} from '../data/queryOptions'

// ── Types ───────────────────────────────────────────────────────────────────

interface ContainerGroup {
  containerId: string
  parentId: number | null
  depth: number
  items: MenuTreeNode[]
}

interface DndTreeViewProps {
  data: MenuTreeNode[]
  initialExpanded?: boolean
  onEdit: (item: MenuTreeNode) => void
  onDelete: (item: MenuTreeNode) => void
  onAddChild: (parent: MenuTreeNode) => void
  onDuplicate: (id: number) => void
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Flatten the tree into container groups for DnD state management. */
function buildContainers(
  nodes: MenuTreeNode[],
  depth = 0,
  parentId: number | null = null,
): ContainerGroup[] {
  const groups: ContainerGroup[] = []
  groups.push({
    containerId: parentId === null ? 'root' : `parent-${parentId}`,
    parentId,
    depth,
    items: nodes,
  })
  for (const node of nodes) {
    if (node.children?.length) {
      groups.push(...buildContainers(node.children, depth + 1, node.id))
    }
  }
  return groups
}

/** Rebuild a nested tree from the container groups for render. */
function rebuildTree(containers: ContainerGroup[]): MenuTreeNode[] {
  const containerMap = new Map(containers.map((c) => [c.containerId, c]))

  function buildChildren(containerId: string): MenuTreeNode[] {
    const container = containerMap.get(containerId)
    if (!container) return []

    return container.items.map((item) => {
      const childContainerId = `parent-${item.id}`
      const childContainer = containerMap.get(childContainerId)
      return {
        ...item,
        children: childContainer
          ? buildChildren(childContainerId)
          : (item.children ?? []),
      } as MenuTreeNode
    })
  }

  return buildChildren('root')
}

/** Find the deepest ancestor path of a node by ID. */
function findPath(id: number, nodes: MenuTreeNode[]): number[] {
  for (const node of nodes) {
    if (node.id === id) return [node.id]
    if (node.children?.length) {
      const found = findPath(id, node.children)
      if (found.length) return [node.id, ...found]
    }
  }
  return []
}

/** Check if `targetId` is a descendant of `ancestorId`. */
function isDescendantOf(
  ancestorId: number,
  targetId: number,
  nodes: MenuTreeNode[],
): boolean {
  const path = findPath(targetId, nodes)
  return path.includes(ancestorId)
}

// ── Main Component ──────────────────────────────────────────────────────────

function DndTreeView({
  data,
  initialExpanded = false,
  onEdit,
  onDelete,
  onAddChild,
  onDuplicate,
}: DndTreeViewProps) {
  const [activeId, setActiveId] = useState<number | null>(null)
  const queryClient = useQueryClient()
  const { mutate: quickUpdate } = useMenuQuickUpdateMutation()
  const { mutate: batchUpdate } = useMenuBatchUpdateMutation()
  const { mutate: batchDelete } = useMenuBatchDeleteMutation()

  // Container state — mutated during drag-over for live cross-level reorder
  const [containers, setContainers] = useState<ContainerGroup[]>(() =>
    buildContainers(data),
  )

  // Sync with external data changes (API refetch)
  useEffect(() => {
    setContainers(buildContainers(data))
  }, [data])

  // Track expandAll state — passed down to all nodes
  const [expandedAll, setExpandedAll] = useState(initialExpanded)

  useEffect(() => {
    setExpandedAll(initialExpanded)
  }, [initialExpanded])

  // Rebuild the renderable tree from containers
  const renderTree = useMemo(() => rebuildTree(containers), [containers])

  // ── Bulk selection state ──────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const lastClickedRef = useRef<number | null>(null)

  // Flatten the current render tree into a lookup array for shift-click
  const flatNodes = useMemo(() => {
    const result: { id: number; depth: number }[] = []
    const walk = (items: MenuTreeNode[], depth: number) => {
      for (const n of items) {
        result.push({ id: n.id, depth })
        if (n.children?.length) walk(n.children, depth + 1)
      }
    }
    walk(renderTree, 0)
    return result
  }, [renderTree])

  const allIds = useMemo(() => flatNodes.map((n) => n.id), [flatNodes])

  const toggleSelect = useCallback(
    (id: number, shiftKey: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        if (shiftKey && lastClickedRef.current !== null) {
          // Range selection: find indices and toggle all in range
          const lastIdx = flatNodes.findIndex(
            (n) => n.id === lastClickedRef.current,
          )
          const currentIdx = flatNodes.findIndex((n) => n.id === id)
          if (lastIdx !== -1 && currentIdx !== -1) {
            const [start, end] =
              lastIdx < currentIdx
                ? [lastIdx, currentIdx]
                : [currentIdx, lastIdx]
            for (let i = start; i <= end; i++) {
              const nid = flatNodes[i].id
              if (next.has(nid)) next.delete(nid)
              else next.add(nid)
            }
            return next
          }
        }
        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }
        return next
      })
      lastClickedRef.current = id
    },
    [flatNodes],
  )

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(allIds))
  }, [allIds])

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  // Clear selection when data changes
  useEffect(() => {
    setSelectedIds(new Set())
  }, [data])

  const selectedCount = selectedIds.size

  // ── Batch action handlers ─────────────────────────────────────────
  const handleBatchToggleVisibility = useCallback(() => {
    if (selectedCount === 0) return
    // Determine target state: if ALL selected are currently visible → hide, otherwise show
    const ids = Array.from(selectedIds)
    const allVisible = ids.every((id) => {
      for (const c of containers) {
        const found = c.items.find((n) => n.id === id)
        if (found) return found.isVisible
      }
      return true
    })
    batchUpdate(
      { ids, data: { isVisible: !allVisible } },
      { onSuccess: () => deselectAll() },
    )
  }, [selectedCount, selectedIds, containers, batchUpdate, deselectAll])

  const handleBatchToggleStatus = useCallback(() => {
    if (selectedCount === 0) return
    // Determine target state: if ALL selected are active → deactivate, otherwise activate
    const ids = Array.from(selectedIds)
    const allActive = ids.every((id) => {
      for (const c of containers) {
        const found = c.items.find((n) => n.id === id)
        if (found) return found.status === 'active'
      }
      return false
    })
    batchUpdate(
      { ids, data: { status: allActive ? 'inactive' : 'active' } },
      { onSuccess: () => deselectAll() },
    )
  }, [selectedCount, selectedIds, containers, batchUpdate, deselectAll])

  const handleBatchDelete = useCallback(() => {
    if (selectedCount === 0) return
    batchDelete(Array.from(selectedIds), { onSuccess: () => deselectAll() })
  }, [selectedCount, selectedIds, batchDelete, deselectAll])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  )

  // ── Lookup helpers ─────────────────────────────────────────────

  const findNode = useCallback(
    (id: number): MenuTreeNode | null => {
      for (const c of containers) {
        const found = c.items.find((n) => n.id === id)
        if (found) return found
      }
      return null
    },
    [containers],
  )

  const findContainer = useCallback(
    (id: number): ContainerGroup | null => {
      return containers.find((c) => c.items.some((n) => n.id === id)) ?? null
    },
    [containers],
  )

  const activeItem = useMemo(() => {
    if (activeId === null) return null
    return findNode(activeId)
  }, [activeId, findNode])

  const activeNodeDepth = useMemo(() => {
    if (activeId === null) return 0
    return findContainer(activeId)?.depth ?? 0
  }, [activeId, findContainer])

  // ── Drop indicator state ────────────────────────────────────────
  const [dropTarget, setDropTarget] = useState<{
    overId: number
    position: 'before' | 'after' | 'inside'
  } | null>(null)

  /** Compute drop position based on pointer Y relative to hovered item's DOM rect. */
  const handleDragMove = useCallback((event: DragMoveEvent) => {
    const over = event.over
    if (!over) {
      setDropTarget(null)
      return
    }

    const overId = over.id as number
    const pointerEvent = event.activatorEvent as PointerEvent

    // @dnd-kit sets data-dnd-id on each sortable's container
    const element = document.querySelector(`[data-dnd-id="${overId}"]`)
    if (!element) {
      setDropTarget({ overId, position: 'after' })
      return
    }

    const rect = element.getBoundingClientRect()
    const relativeY = (pointerEvent.clientY - rect.top) / rect.height

    // Top 25% → before, bottom 25% → after, middle 50% → inside
    let position: 'before' | 'after' | 'inside'
    if (relativeY < 0.25) {
      position = 'before'
    } else if (relativeY > 0.75) {
      position = 'after'
    } else {
      position = 'inside'
    }

    setDropTarget({ overId, position })
  }, [])

  // ── Drag handlers ────────────────────────────────────────────────

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as number)
    setDropTarget(null)
  }, [])

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const activeIdNum = active.id as number
      const overIdNum = over.id as number

      const activeContainer = findContainer(activeIdNum)
      const overContainer = findContainer(overIdNum)

      if (!activeContainer || !overContainer) return

      // Same container — let onDragEnd handle level-internal reorder
      if (activeContainer.containerId === overContainer.containerId) return

      // Prevent dropping into own descendants
      if (isDescendantOf(activeIdNum, overContainer.parentId ?? -1, data))
        return

      // Move item between containers in state
      setContainers((prev) => {
        const next = prev.map((c) => ({ ...c, items: [...c.items] }))

        const activeCont = next.find(
          (c) => c.containerId === activeContainer.containerId,
        )!
        const overCont = next.find(
          (c) => c.containerId === overContainer.containerId,
        )!

        const activeIdx = activeCont.items.findIndex(
          (n) => n.id === activeIdNum,
        )
        if (activeIdx === -1) return prev

        const [moved] = activeCont.items.splice(activeIdx, 1)

        // Insert before/after the over item
        const overIdx = overCont.items.findIndex((n) => n.id === overIdNum)
        if (overIdx >= 0) {
          overCont.items.splice(overIdx, 0, moved)
        } else {
          overCont.items.push(moved)
        }

        return next
      })
    },
    [data, findContainer],
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveId(null)
      setDropTarget(null)
      const { active, over } = event
      if (!over || active.id === over.id) return

      // Build the full reorder payload from current container state
      const payload: {
        id: number
        sort_order: number
        parent_id: number | null
      }[] = []

      for (const container of containers) {
        for (let i = 0; i < container.items.length; i++) {
          payload.push({
            id: container.items[i].id,
            sort_order: (i + 1) * 10,
            parent_id: container.parentId,
          })
        }
      }

      try {
        await reorderMenuService(payload)
        queryClient.invalidateQueries({ queryKey: ['Menus'] })
      } catch (error) {
        console.error('Reorder failed:', error)
        setContainers(buildContainers(data))
      }
    },
    [containers, data, queryClient],
  )

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-sm font-medium">No menu entries yet</p>
        <p className="text-xs">
          Create a root-level menu entry to get started.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Selection toolbar — always visible when there are items */}
      <div className="mb-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
        <button
          className="hover:text-foreground transition-colors"
          onClick={selectedCount > 0 ? deselectAll : selectAll}
        >
          {selectedCount > 0 ? 'Deselect All' : 'Select All'}
        </button>
        {selectedCount > 0 && (
          <>
            <span className="text-muted-foreground/30">·</span>
            <span className="font-medium text-foreground/70">
              {selectedCount} / {allIds.length} selected
            </span>
          </>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <TreeLevel
          items={renderTree}
          depth={0}
          expandedAll={expandedAll}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
          onDuplicate={onDuplicate}
          quickUpdate={quickUpdate}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          dropTarget={dropTarget}
        />

        <DragOverlay>
          {activeItem ? (
            <div className="flex items-center gap-2 rounded-md border bg-card px-2.5 py-1.5 shadow-lg">
              <div className="flex h-6 w-6 items-center justify-center rounded border bg-background">
                {(() => {
                  const Icon = resolveIcon(activeItem.icon ?? undefined)
                  return <Icon className="h-3 w-3 text-muted-foreground" />
                })()}
              </div>
              <span className="text-xs font-medium">{activeItem.menuName}</span>
              <Badge
                variant="outline"
                className="text-[9px] px-1 py-0 leading-none"
              >
                {activeNodeDepth > 0 ? `Level ${activeNodeDepth}` : 'Root'}
              </Badge>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* ── Batch actions toolbar ───────────────────────────────────── */}
      {selectedCount > 0 && (
        <div className="mt-2 flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span className="font-medium text-foreground/80">
            {selectedCount} selected
          </span>
          <span className="text-muted-foreground/30">|</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] text-muted-foreground"
            onClick={deselectAll}
          >
            Deselect
          </Button>
          <span className="text-muted-foreground/30">|</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] text-muted-foreground"
            onClick={handleBatchToggleVisibility}
            title="Toggle visibility for selected items"
          >
            <IconEye className="mr-1 h-3 w-3" />
            Toggle Visibility
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] text-muted-foreground"
            onClick={handleBatchToggleStatus}
            title="Toggle status for selected items"
          >
            Toggle Status
          </Button>
          <span className="text-muted-foreground/30">|</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px] text-destructive hover:text-destructive"
            onClick={handleBatchDelete}
            title="Delete selected items"
          >
            <IconTrash className="mr-1 h-3 w-3" />
            Delete
          </Button>
        </div>
      )}
    </div>
  )
}

// ── Tree Level (recursive — renders items inside a SortableContext) ─────────

interface TreeLevelProps {
  items: MenuTreeNode[]
  depth: number
  expandedAll: boolean
  onEdit: (item: MenuTreeNode) => void
  onDelete: (item: MenuTreeNode) => void
  onAddChild: (parent: MenuTreeNode) => void
  onDuplicate: (id: number) => void
  quickUpdate: (
    payload: { id: number } & Record<string, unknown>,
    options?: {
      onSuccess?: () => void
      onError?: (err: unknown) => void
      onSettled?: () => void
    },
  ) => void
  selectedIds: Set<number>
  onToggleSelect: (id: number, shiftKey: boolean) => void
  dropTarget: {
    overId: number
    position: 'before' | 'after' | 'inside'
  } | null
}

function TreeLevel({
  items,
  depth,
  expandedAll,
  onEdit,
  onDelete,
  onAddChild,
  onDuplicate,
  quickUpdate,
  selectedIds,
  onToggleSelect,
  dropTarget,
}: TreeLevelProps) {
  if (!items.length) return null

  return (
    <SortableContext
      items={items.map((n) => n.id)}
      strategy={verticalListSortingStrategy}
    >
      <div className="space-y-0.5">
        {items.map((node) => (
          <TreeNode
            key={node.id}
            node={node}
            depth={depth}
            expandedAll={expandedAll}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddChild={onAddChild}
            onDuplicate={onDuplicate}
            quickUpdate={quickUpdate}
            selectedIds={selectedIds}
            onToggleSelect={onToggleSelect}
            dropTarget={dropTarget}
          />
        ))}
      </div>
    </SortableContext>
  )
}

// ── Tree Node (sortable — renders as a leaf or parent with children) ────────

interface TreeNodeProps {
  node: MenuTreeNode
  depth: number
  expandedAll: boolean
  onEdit: (item: MenuTreeNode) => void
  onDelete: (item: MenuTreeNode) => void
  onAddChild: (parent: MenuTreeNode) => void
  onDuplicate: (id: number) => void
  quickUpdate: TreeLevelProps['quickUpdate']
  selectedIds: Set<number>
  onToggleSelect: (id: number, shiftKey: boolean) => void
  dropTarget: {
    overId: number
    position: 'before' | 'after' | 'inside'
  } | null
}

function TreeNode({
  node,
  depth,
  expandedAll,
  onEdit,
  onDelete,
  onAddChild,
  onDuplicate,
  quickUpdate,
  selectedIds,
  onToggleSelect,
  dropTarget,
}: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(depth < 1)
  const hasChildren = node.children && node.children.length > 0
  const Icon = resolveIcon(node.icon ?? undefined)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  }

  const statusBadgeColor = ActiveInactiveStatusTypes.get(node.status)
  const isSelected = selectedIds.has(node.id)

  // Drop indicator state
  const isDropOver = dropTarget?.overId === node.id
  const isDropBefore = isDropOver && dropTarget?.position === 'before'
  const isDropAfter = isDropOver && dropTarget?.position === 'after'
  const isDropInside = isDropOver && dropTarget?.position === 'inside'

  // Sync with expandAll
  useEffect(() => {
    if (hasChildren) {
      setIsOpen(expandedAll)
    }
  }, [expandedAll, hasChildren])

  // ── Inline editing state ──────────────────────────────────────────
  const [editingField, setEditingField] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [updatingVisibility, setUpdatingVisibility] = useState(false)

  const handleRename = useCallback(
    (newName: string) => {
      setEditingField(null)
      quickUpdate(
        { id: node.id, menuName: newName },
        { onError: () => console.error('Rename failed') },
      )
    },
    [node.id, quickUpdate],
  )

  const handleToggleVisibility = useCallback(() => {
    setUpdatingVisibility(true)
    quickUpdate(
      { id: node.id, isVisible: !node.isVisible },
      {
        onSettled: () => setUpdatingVisibility(false),
        onError: () => console.error('Visibility toggle failed'),
      },
    )
  }, [node.id, node.isVisible, quickUpdate])

  const handleToggleStatus = useCallback(() => {
    setUpdatingStatus(true)
    const newStatus = node.status === 'active' ? 'inactive' : 'active'
    quickUpdate(
      { id: node.id, status: newStatus },
      {
        onSettled: () => setUpdatingStatus(false),
        onError: () => console.error('Status toggle failed'),
      },
    )
  }, [node.id, node.status, quickUpdate])

  const handleCheckboxClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onToggleSelect(node.id, e.shiftKey)
    },
    [node.id, onToggleSelect],
  )

  const rowNode = (childrenContent?: React.ReactNode) => (
    <div
      className={cn(
        'relative flex items-center gap-1 rounded-md border px-1.5 py-1 text-xs transition-all',
        isSelected
          ? 'border-primary/30 bg-primary/[0.04]'
          : 'border-transparent hover:border-border hover:bg-muted/40',
        !node.isVisible && 'opacity-60',
        isDragging && 'opacity-35',
        isDropInside && 'ring-1 ring-primary/50 bg-primary/[0.06]',
      )}
      style={depth > 0 ? { marginLeft: `${depth * 1.25}rem` } : undefined}
    >
      {/* Drop indicator — before (line above) */}
      {isDropBefore && (
        <div className="pointer-events-none absolute -top-[2px] left-0 right-0 z-10 flex items-center">
          <div className="h-[2px] flex-1 rounded-full bg-primary shadow-[0_0_4px_rgba(59,130,246,0.5)]" />
          <div className="h-2 w-2 rounded-full bg-primary" />
        </div>
      )}

      {/* Drop indicator — after (line below) */}
      {isDropAfter && (
        <div className="pointer-events-none absolute -bottom-[2px] left-0 right-0 z-10 flex items-center">
          <div className="h-[2px] flex-1 rounded-full bg-primary shadow-[0_0_4px_rgba(59,130,246,0.5)]" />
          <div className="h-2 w-2 rounded-full bg-primary" />
        </div>
      )}
      {/* Checkbox */}
      <div className="flex w-4 shrink-0 items-center justify-center">
        <Checkbox
          checked={isSelected}
          onClick={handleCheckboxClick}
          className="h-3.5 w-3.5"
          aria-label={`Select ${node.menuName}`}
        />
      </div>

      {/* Drag handle */}
      <button
        className="flex h-5 w-4 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground/30 hover:text-muted-foreground hover:bg-muted active:cursor-grabbing"
        {...attributes}
        {...listeners}
        title="Drag to reorder (cross-level supported)"
        tabIndex={-1}
      >
        <IconGripVertical className="h-3 w-3" />
      </button>

      {/* Expand/collapse or spacer */}
      <div className="flex w-4 shrink-0 items-center justify-center">
        {hasChildren ? (
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
            >
              <IconChevronDown
                className={cn(
                  'h-3 w-3 transition-transform duration-200',
                  isOpen ? 'rotate-0' : '-rotate-90',
                )}
              />
            </Button>
          </CollapsibleTrigger>
        ) : (
          <span className="h-4 w-4" />
        )}
      </div>

      {/* Icon */}
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border bg-background">
        {Icon ? (
          <Icon className="h-2.5 w-2.5 text-muted-foreground" />
        ) : (
          <span className="h-2.5 w-2.5 rounded bg-muted-foreground/20" />
        )}
      </div>

      {/* Name — inline editable */}
      <div className="flex min-w-0 flex-1 items-center gap-1">
        {editingField === 'name' ? (
          <InlineNameEditor
            node={node}
            onSave={handleRename}
            onCancel={() => setEditingField(null)}
          />
        ) : (
          <span
            className={cn(
              'truncate text-xs font-medium cursor-pointer rounded px-0.5 -mx-0.5',
              'hover:bg-muted/60 hover:text-foreground',
              node.isGroup && 'font-semibold text-foreground',
            )}
            onClick={() => setEditingField('name')}
            title="Click to rename"
          >
            {node.menuName}
          </span>
        )}
        {node.isGroup && (
          <Badge
            variant="secondary"
            className="shrink-0 text-[9px] px-1 py-0 leading-none"
          >
            G
          </Badge>
        )}
        {node.route && (
          <code className="hidden shrink-0 truncate rounded bg-muted/60 px-1 py-0.5 text-[9px] font-mono text-muted-foreground/70 sm:inline-block max-w-24">
            {node.route}
          </code>
        )}
      </div>

      {node.feature && (
        <Badge
          variant="outline"
          className="hidden shrink-0 text-[9px] font-mono px-1 py-0 leading-none md:inline-flex"
        >
          {node.feature.code}
        </Badge>
      )}

      {/* Status badge — clickable to toggle */}
      <button
        className={cn(
          'shrink-0 rounded px-1 py-0 text-[9px] font-medium capitalize transition-colors',
          statusBadgeColor,
          'hover:ring-1 hover:ring-foreground/20',
          updatingStatus && 'animate-pulse',
        )}
        onClick={handleToggleStatus}
        disabled={updatingStatus}
        title={`Click to toggle (currently ${node.status})`}
      >
        {node.status}
      </button>

      {/* Sort order */}
      <span className="hidden shrink-0 text-[10px] text-muted-foreground/50 lg:inline-block">
        #{node.sortOrder}
      </span>

      {/* Visibility toggle */}
      <button
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded transition-colors',
          'hover:text-muted-foreground hover:bg-muted',
          updatingVisibility && 'animate-pulse',
          node.isVisible
            ? 'opacity-0 group-hover/tree:opacity-100'
            : 'opacity-60',
        )}
        title={node.isVisible ? 'Click to hide' : 'Click to show'}
        onClick={handleToggleVisibility}
        disabled={updatingVisibility}
      >
        {node.isVisible ? (
          <IconEye className="h-3 w-3" />
        ) : (
          <IconEyeOff className="h-3 w-3" />
        )}
      </button>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-0 opacity-0 transition-opacity group-hover/tree:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-muted-foreground hover:text-foreground"
          onClick={() => onAddChild(node)}
          title="Add child"
        >
          <IconPlus className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-muted-foreground hover:text-foreground"
          onClick={() => onDuplicate(node.id)}
          title="Duplicate (clone with children)"
        >
          <IconCopy className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-muted-foreground hover:text-foreground"
          onClick={() => onEdit(node)}
          title="Edit all fields"
        >
          <IconEdit className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 text-destructive/70 hover:text-destructive"
          onClick={() => onDelete(node)}
          title="Delete"
        >
          <IconTrash className="h-3 w-3" />
        </Button>
      </div>

      {childrenContent}
    </div>
  )

  return (
    <div ref={setNodeRef} style={style} data-dnd-id={String(node.id)}>
      {hasChildren ? (
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="group/tree"
        >
          {rowNode()}
          <CollapsibleContent>
            <div className="relative ml-2 border-l border-border/40 pl-1">
              <TreeLevel
                items={node.children}
                depth={depth + 1}
                expandedAll={expandedAll}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddChild={onAddChild}
                onDuplicate={onDuplicate}
                quickUpdate={quickUpdate}
                selectedIds={selectedIds}
                onToggleSelect={onToggleSelect}
                dropTarget={dropTarget}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <div className="group/tree">{rowNode()}</div>
      )}
    </div>
  )
}

// ── Select All / Deselect All toolbar row (used by parent) ──────────────────

export function SelectionToolbar({
  selectedIds,
  totalCount,
  onSelectAll,
  onDeselectAll,
}: {
  selectedIds: Set<number>
  totalCount: number
  onSelectAll: () => void
  onDeselectAll: () => void
}) {
  if (totalCount === 0) return null
  const allSelected = selectedIds.size === totalCount

  return (
    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
      <button
        className="hover:text-foreground transition-colors"
        onClick={allSelected ? onDeselectAll : onSelectAll}
      >
        {allSelected ? 'Deselect All' : 'Select All'}
      </button>
      {selectedIds.size > 0 && (
        <>
          <span className="text-muted-foreground/30">·</span>
          <span className="font-medium text-foreground/70">
            {selectedIds.size} selected
          </span>
        </>
      )}
    </div>
  )
}

// ── Inline Name Editor ──────────────────────────────────────────────────────

function InlineNameEditor({
  node,
  onSave,
  onCancel,
}: {
  node: MenuTreeNode
  onSave: (name: string) => void
  onCancel: () => void
}) {
  const [value, setValue] = useState(node.menuName)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmed = value.trim()
      if (trimmed && trimmed !== node.menuName) {
        onSave(trimmed)
      } else {
        onCancel()
      }
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <Input
      ref={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        const trimmed = value.trim()
        if (trimmed && trimmed !== node.menuName) {
          onSave(trimmed)
        } else {
          onCancel()
        }
      }}
      onKeyDown={handleKeyDown}
      className="h-6 min-w-0 flex-1 rounded border px-1.5 py-0 text-xs shadow-none focus-visible:ring-1"
    />
  )
}

export default DndTreeView

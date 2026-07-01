import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { resolveIcon } from '@/layouts/components/data/menu-icon-map'
import { cn } from '@/lib/utils'
import { ActiveInactiveStatusTypes } from '@/types/active-inactive-status'
import {
  IconChevronDown,
  IconEdit,
  IconGripVertical,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import { useQueryClient } from '@tanstack/react-query'
import { useState, useCallback, useMemo } from 'react'
import { reorderMenuService } from '../data/api'
import type { MenuTreeNode } from '../data/schema'

interface DndTreeViewProps {
  data: MenuTreeNode[]
  onEdit: (item: MenuTreeNode) => void
  onDelete: (item: MenuTreeNode) => void
  onAddChild: (parent: MenuTreeNode) => void
}

function DndTreeView({ data, onEdit, onDelete, onAddChild }: DndTreeViewProps) {
  const [activeId, setActiveId] = useState<number | null>(null)
  const queryClient = useQueryClient()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to activate drag
      },
    }),
  )

  // Find a node in the tree by ID, returning the node and its siblings
  const findNodeAndSiblings = useCallback(
    (id: number, nodes: MenuTreeNode[]): { node: MenuTreeNode; siblings: MenuTreeNode[] } | null => {
      for (const node of nodes) {
        if (node.id === id) return { node, siblings: nodes }
        if (node.children?.length) {
          const found = findNodeAndSiblings(id, node.children)
          if (found) return found
        }
      }
      return null
    },
    [],
  )

  const activeItem = useMemo(() => {
    if (activeId === null) return null
    const found = findNodeAndSiblings(activeId, data)
    return found?.node ?? null
  }, [activeId, data, findNodeAndSiblings])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as number)
  }, [])

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveId(null)
      const { active, over } = event
      if (!over || active.id === over.id) return

      const activeIdNum = active.id as number
      const overIdNum = over.id as number

      // Find siblings (items in the same level)
      const activeResult = findNodeAndSiblings(activeIdNum, data)
      const overResult = findNodeAndSiblings(overIdNum, data)

      // Only reorder within the same parent level
      if (!activeResult || !overResult) return
      if (activeResult.siblings !== overResult.siblings) return

      const siblings = activeResult.siblings
      const oldIndex = siblings.findIndex((n) => n.id === activeIdNum)
      const newIndex = siblings.findIndex((n) => n.id === overIdNum)

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return

      // Reorder the siblings array
      const reordered = [...siblings]
      const [moved] = reordered.splice(oldIndex, 1)
      reordered.splice(newIndex, 0, moved)

      // Compute new sort_order values
      const reorderPayload = reordered.map((item, index) => ({
        id: item.id,
        sort_order: (index + 1) * 10,
        parent_id: item.parentId ?? null,
      }))

      // Persist reorder
      try {
        await reorderMenuService(reorderPayload)
        queryClient.invalidateQueries({ queryKey: ['Menus'] })
      } catch (error) {
        console.error('Reorder failed:', error)
      }
    },
    [data, findNodeAndSiblings, queryClient],
  )

  if (!data || data.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-muted-foreground'>
        <p className='text-lg font-medium'>No menu entries yet</p>
        <p className='text-sm'>Create a root-level menu entry to get started.</p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={data.map((n) => n.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className='space-y-1'>
          {data.map((node) => (
            <SortableTreeNode
              key={node.id}
              node={node}
              depth={0}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeItem ? (
          <div className='rounded-lg border bg-card px-3 py-2 shadow-lg'>
            <div className='flex items-center gap-2'>
              <div className='flex h-7 w-7 items-center justify-center rounded-md border bg-background'>
                {(() => {
                  const Icon = resolveIcon(activeItem.icon ?? undefined)
                  return <Icon className='h-3.5 w-3.5 text-muted-foreground' />
                })()}
              </div>
              <span className='text-sm font-medium'>{activeItem.menuName}</span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

// ── Sortable Tree Node ───────────────────────────────────────────────────────

interface SortableTreeNodeProps {
  node: MenuTreeNode
  depth: number
  onEdit: (item: MenuTreeNode) => void
  onDelete: (item: MenuTreeNode) => void
  onAddChild: (parent: MenuTreeNode) => void
}

function SortableTreeNode({
  node,
  depth,
  onEdit,
  onDelete,
  onAddChild,
}: SortableTreeNodeProps) {
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
    opacity: isDragging ? 0.4 : 1,
  }

  const statusBadgeColor = ActiveInactiveStatusTypes.get(node.status)

  return (
    <div ref={setNodeRef} style={style}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className='group/tree'>
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-lg border border-transparent px-2 py-2 transition-all',
            'hover:border-border hover:bg-muted/50',
            isDragging && 'opacity-40',
          )}
          style={depth > 0 ? { marginLeft: `${depth * 1.5}rem` } : undefined}
        >
          {/* Drag handle */}
          <button
            className='flex h-6 w-5 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted active:cursor-grabbing'
            {...attributes}
            {...listeners}
            title='Drag to reorder'
            tabIndex={-1}
          >
            <IconGripVertical className='h-3.5 w-3.5' />
          </button>

          {/* Expand/collapse toggle */}
          <div className='flex w-5 shrink-0 items-center justify-center'>
            {hasChildren || node.isGroup ? (
              <CollapsibleTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-5 w-5 p-0 text-muted-foreground hover:text-foreground'
                >
                  <IconChevronDown
                    className={cn(
                      'h-3.5 w-3.5 transition-transform duration-200',
                      isOpen && 'rotate-0',
                      !isOpen && '-rotate-90',
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
            ) : (
              <span className='h-5 w-5' />
            )}
          </div>

          {/* Icon */}
          <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-background'>
            {Icon ? (
              <Icon className='h-3.5 w-3.5 text-muted-foreground' />
            ) : (
              <span className='h-3.5 w-3.5 rounded bg-muted-foreground/20' />
            )}
          </div>

          {/* Name + meta */}
          <div className='flex min-w-0 flex-1 items-center gap-2'>
            <span
              className={cn(
                'truncate text-sm font-medium',
                node.isGroup && 'font-semibold text-foreground',
              )}
            >
              {node.menuName}
            </span>
            {node.isGroup && (
              <Badge
                variant='secondary'
                className='shrink-0 text-[10px] px-1 py-0'
              >
                Group
              </Badge>
            )}
            {node.route && (
              <code className='hidden shrink-0 truncate rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground sm:inline-block max-w-36'>
                {node.route}
              </code>
            )}
          </div>

          {/* Feature badge */}
          {node.feature && (
            <Badge
              variant='outline'
              className='hidden shrink-0 text-[10px] font-mono md:inline-block'
            >
              {node.feature.code}
            </Badge>
          )}

          {/* Status badge */}
          <Badge
            variant='outline'
            className={cn('shrink-0 capitalize', statusBadgeColor)}
          >
            {node.status}
          </Badge>

          {/* Sort order */}
          <span className='hidden shrink-0 text-xs text-muted-foreground lg:inline-block'>
            #{node.sortOrder}
          </span>

          {/* Actions */}
          <div className='flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/tree:opacity-100'>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7 text-muted-foreground hover:text-foreground'
              onClick={() => onAddChild(node)}
              title='Add child menu entry'
            >
              <IconPlus className='h-3.5 w-3.5' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7 text-muted-foreground hover:text-foreground'
              onClick={() => onEdit(node)}
              title='Edit'
            >
              <IconEdit className='h-3.5 w-3.5' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-7 w-7 text-destructive hover:text-destructive'
              onClick={() => onDelete(node)}
              title='Delete'
            >
              <IconTrash className='h-3.5 w-3.5' />
            </Button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && (
          <CollapsibleContent>
            <div className='relative ml-3 border-l border-border/50 pl-1'>
              <SortableContext
                items={node.children.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {node.children.map((child) => (
                  <SortableTreeNode
                    key={child.id}
                    node={child}
                    depth={depth + 1}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAddChild={onAddChild}
                  />
                ))}
              </SortableContext>
            </div>
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  )
}

export default DndTreeView

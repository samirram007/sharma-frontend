import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { usePermissionMutation } from '@/features/modules/permission/data/queryOptions'
import { MenuTreeQueryOptions } from '@/features/modules/menu/data/queryOptions'
import { resolveIcon } from '@/features/modules/menu/data/menu-icon-map'
import {
  MenuTreeSchema,
  type MenuTreeNode,
} from '@/features/modules/menu/data/schema'
import { roleQueryOptions } from '@/features/modules/role/data/queryOptions'
import { ActiveInactiveStatusTypes } from '@/types/active-inactive-status'

import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import {
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { IconChevronDown, IconGripVertical } from '@tabler/icons-react'
import { Loader, ShieldCheck, ShieldOff } from 'lucide-react'
import { useMemo, useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'

import { roleMenuPermissionsQueryOptions } from './data/queryOptions'
import { reorderMenuService } from '@/features/modules/menu/data/api'

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Flatten tree into container groups for DnD state management. */
function buildContainers(
  nodes: MenuTreeNode[],
  depth = 0,
  parentId: number | null = null,
) {
  const groups: {
    containerId: string
    parentId: number | null
    depth: number
    items: MenuTreeNode[]
  }[] = []
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

function rebuildTree(
  containers: {
    containerId: string
    parentId: number | null
    depth: number
    items: MenuTreeNode[]
  }[],
): MenuTreeNode[] {
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

function isDescendantOf(
  ancestorId: number,
  targetId: number,
  nodes: MenuTreeNode[],
): boolean {
  const walk = (items: MenuTreeNode[]): boolean => {
    for (const n of items) {
      if (n.id === targetId) return true
      if (n.children?.length && walk(n.children)) return true
    }
    return false
  }
  for (const n of nodes) {
    if (n.id === ancestorId && walk(n.children ?? [])) return true
  }
  return false
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function MenuManager() {
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const queryClient = useQueryClient()

  // Fetch roles
  const { data: rolesData } = useSuspenseQuery(roleQueryOptions())
  const roles = rolesData?.data ?? []

  // Fetch menu tree
  const { data: treeData, isLoading: treeLoading } =
    useQuery(MenuTreeQueryOptions)

  // Fetch permissions for selected role
  const { data: permData, isLoading: permLoading } = useQuery({
    ...roleMenuPermissionsQueryOptions(selectedRoleId ?? undefined),
    enabled: !!selectedRoleId,
  })

  const features = permData?.data ?? []

  // Build permission maps from the API response
  const { featurePermissionMap, featureMetaMap } = useMemo(() => {
    const permMap = new Map<string, { id?: number; isAllowed: boolean }>()
    const metaMap = new Map<string, { id: number; appModuleId: number }>()

    features.forEach((f: any) => {
      if (!f.code) return
      if (f.rolePermission) {
        permMap.set(f.code, {
          id: f.rolePermission.id,
          isAllowed: f.rolePermission.isAllowed,
        })
      } else {
        permMap.set(f.code, { isAllowed: false })
      }
      metaMap.set(f.code, { id: f.id, appModuleId: f.appModuleId })
    })

    return { featurePermissionMap: permMap, featureMetaMap: metaMap }
  }, [features])

  const { mutate: savePermission, isPending: permSaving } =
    usePermissionMutation()

  const handleToggle = useCallback(
    (featureCode: string) => {
      if (!selectedRoleId) return
      const meta = featureMetaMap.get(featureCode)
      const current = featurePermissionMap.get(featureCode)
      if (!meta) return

      const newIsAllowed = !current?.isAllowed

      savePermission(
        {
          roleId: selectedRoleId,
          appModuleFeatureId: meta.id,
          isAllowed: newIsAllowed,
          isEdit: !!current?.id,
          id: current?.id,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: ['MenuPermissions', selectedRoleId],
            })
          },
        },
      )
    },
    [
      selectedRoleId,
      featureMetaMap,
      featurePermissionMap,
      savePermission,
      queryClient,
    ],
  )

  // ── DnD state ──────────────────────────────────────────────────────
  const menuTree = useMemo(
    () => MenuTreeSchema.parse(treeData?.data ?? []),
    [treeData],
  )
  const [containers, setContainers] = useState(() => buildContainers(menuTree))
  const [activeId, setActiveId] = useState<number | null>(null)

  useEffect(() => {
    setContainers(buildContainers(menuTree))
  }, [menuTree])

  const renderTree = useMemo(() => rebuildTree(containers), [containers])

  const findContainer = useCallback(
    (id: number) =>
      containers.find((c) => c.items.some((n) => n.id === id)) ?? null,
    [containers],
  )

  const activeItem = useMemo(() => {
    if (activeId === null) return null
    for (const c of containers) {
      const found = c.items.find((n) => n.id === activeId)
      if (found) return found
    }
    return null
  }, [activeId, containers])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as number)
  }, [])

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveId(null)
      const { active, over } = event
      if (!over || active.id === over.id) return

      // Build reorder payload from container state
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
        toast.success('Menu reordered successfully')
      } catch (error) {
        console.error('Reorder failed:', error)
        toast.error('Reorder failed')
        setContainers(buildContainers(menuTree))
      }
    },
    [containers, menuTree, queryClient],
  )

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const activeIdNum = active.id as number
      const overIdNum = over.id as number

      const activeContainer = findContainer(activeIdNum)
      const overContainer = findContainer(overIdNum)
      if (!activeContainer || !overContainer) return

      if (activeContainer.containerId === overContainer.containerId) return

      // Prevent dropping into own descendants
      if (isDescendantOf(activeIdNum, overContainer.parentId ?? -1, menuTree))
        return

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
        const overIdx = overCont.items.findIndex((n) => n.id === overIdNum)
        if (overIdx >= 0) overCont.items.splice(overIdx, 0, moved)
        else overCont.items.push(moved)
        return next
      })
    },
    [menuTree, findContainer],
  )

  // ── Bulk selection ─────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  useEffect(() => {
    setSelectedIds(new Set())
  }, [selectedRoleId])

  // ── Permissions for menu items (used in tree rendering) ───────────
  const getPermissionInfo = useCallback(
    (node: MenuTreeNode) => {
      const featureCode = node.feature?.code
      if (!featureCode) return { hasPermission: false, isAllowed: false }
      return {
        hasPermission: featureMetaMap.has(featureCode),
        isAllowed: featurePermissionMap.get(featureCode)?.isAllowed ?? false,
      }
    },
    [featureMetaMap, featurePermissionMap],
  )

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Menu Manager</h1>
        <p className="text-muted-foreground">
          Drag &amp; drop to reorder menu items. Toggle permissions to control
          role access.
        </p>
      </div>

      {/* Role Selector */}
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Role:
          </span>
          <Select
            value={selectedRoleId?.toString() ?? ''}
            onValueChange={(v) => setSelectedRoleId(Number(v))}
          >
            <SelectTrigger className="w-56 h-8 text-xs">
              <SelectValue placeholder="Choose a role to manage…" />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role: any) => (
                <SelectItem key={role.id} value={role.id.toString()}>
                  {role.name}
                  <span className="ml-2 text-[10px] text-muted-foreground font-mono">
                    ({role.code})
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        {selectedRoleId && !permLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground ml-auto">
            <span className="flex items-center gap-1 text-green-600">
              <ShieldCheck className="h-3 w-3" />
              {
                Array.from(featurePermissionMap.values()).filter(
                  (p) => p.isAllowed,
                ).length
              }{' '}
              allowed
            </span>
            <span className="text-muted-foreground/30">|</span>
            <span className="flex items-center gap-1 text-red-600">
              <ShieldOff className="h-3 w-3" />
              {
                Array.from(featurePermissionMap.values()).filter(
                  (p) => !p.isAllowed,
                ).length
              }{' '}
              denied
            </span>
          </div>
        )}
      </div>

      {/* Empty state */}
      {!selectedRoleId && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          Select a role above to manage its menu permissions.
        </div>
      )}

      {/* Loading state */}
      {selectedRoleId && (treeLoading || permLoading) && (
        <div className="flex items-center justify-center py-16">
          <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Tree View with DnD */}
      {selectedRoleId && !treeLoading && !permLoading && (
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="border-b px-3 py-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Menu Structure
            </span>
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-muted-foreground">
                  {selectedIds.size} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1.5 text-[9px]"
                  onClick={() => setSelectedIds(new Set())}
                >
                  Deselect
                </Button>
              </div>
            )}
          </div>
          <div className="p-3">
            {renderTree.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
              >
                <TreeLevel
                  items={renderTree}
                  depth={0}
                  getPermissionInfo={getPermissionInfo}
                  onToggle={handleToggle}
                  permSaving={permSaving}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                />

                <DragOverlay>
                  {activeItem ? (
                    <div className="flex items-center gap-2 rounded-md border bg-card px-2.5 py-1.5 shadow-lg">
                      <div className="flex h-6 w-6 items-center justify-center rounded border bg-background">
                        {(() => {
                          const Icon = resolveIcon(activeItem.icon ?? undefined)
                          return (
                            <Icon className="h-3 w-3 text-muted-foreground" />
                          )
                        })()}
                      </div>
                      <span className="text-xs font-medium">
                        {activeItem.menuName}
                      </span>
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                <p className="text-xs font-medium">No menu entries found</p>
                <p className="text-[10px]">
                  Create menu entries in the Menu module first.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Tree Level ─────────────────────────────────────────────────────────────

interface TreeLevelProps {
  items: MenuTreeNode[]
  depth: number
  getPermissionInfo: (node: MenuTreeNode) => {
    hasPermission: boolean
    isAllowed: boolean
  }
  onToggle: (featureCode: string) => void
  permSaving: boolean
  selectedIds: Set<number>
  onToggleSelect: (id: number) => void
}

function TreeLevel({
  items,
  depth,
  getPermissionInfo,
  onToggle,
  permSaving,
  selectedIds,
  onToggleSelect,
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
            getPermissionInfo={getPermissionInfo}
            onToggle={onToggle}
            permSaving={permSaving}
            selectedIds={selectedIds}
            onToggleSelect={onToggleSelect}
          />
        ))}
      </div>
    </SortableContext>
  )
}

// ── Tree Node ──────────────────────────────────────────────────────────────

interface TreeNodeProps {
  node: MenuTreeNode
  depth: number
  getPermissionInfo: (node: MenuTreeNode) => {
    hasPermission: boolean
    isAllowed: boolean
  }
  onToggle: (featureCode: string) => void
  permSaving: boolean
  selectedIds: Set<number>
  onToggleSelect: (id: number) => void
}

function TreeNode({
  node,
  depth,
  getPermissionInfo,
  onToggle,
  permSaving,
  selectedIds,
  onToggleSelect,
}: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(depth < 1)
  const hasChildren = node.children && node.children.length > 0
  const Icon = resolveIcon(node.icon ?? undefined)
  const statusBadgeColor = ActiveInactiveStatusTypes.get(node.status)
  const isSelected = selectedIds.has(node.id)
  const { hasPermission, isAllowed } = getPermissionInfo(node)

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

  const rowNode = () => (
    <div
      className={cn(
        'relative flex items-center gap-1.5 rounded-md border px-2 py-1 transition-all',
        isSelected
          ? 'border-primary/30 bg-primary/[0.04]'
          : 'border-transparent hover:border-border hover:bg-muted/40',
        !node.isVisible && 'opacity-60',
        isDragging && 'opacity-35',
      )}
      style={depth > 0 ? { marginLeft: `${depth * 1.25}rem` } : undefined}
    >
      {/* Checkbox */}
      <div className="flex w-4 shrink-0 items-center justify-center">
        <Checkbox
          checked={isSelected}
          onClick={(e) => {
            e.stopPropagation()
            onToggleSelect(node.id)
          }}
          className="h-3.5 w-3.5"
          aria-label={`Select ${node.menuName}`}
        />
      </div>

      {/* Drag handle */}
      <button
        className="flex h-5 w-4 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground/30 hover:text-muted-foreground hover:bg-muted active:cursor-grabbing"
        {...attributes}
        {...listeners}
        title="Drag to reorder"
        tabIndex={-1}
      >
        <IconGripVertical className="h-3 w-3" />
      </button>

      {/* Expand/collapse */}
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
        <Icon className="h-2.5 w-2.5 text-muted-foreground" />
      </div>

      {/* Name + meta */}
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <span className="truncate text-xs font-medium">{node.menuName}</span>
        {node.isGroup && (
          <Badge
            variant="secondary"
            className="shrink-0 text-[9px] px-1 py-0 leading-none"
          >
            Group
          </Badge>
        )}
        {node.route && (
          <code className="hidden shrink-0 truncate rounded bg-muted/60 px-1 py-0.5 text-[9px] font-mono text-muted-foreground/70 sm:inline-block max-w-24">
            {node.route}
          </code>
        )}
        {node.feature?.code && (
          <Badge
            variant="outline"
            className="shrink-0 text-[9px] font-mono px-1 py-0 leading-none hidden md:inline-flex"
          >
            {node.feature.code}
          </Badge>
        )}
      </div>

      {/* Status badge */}
      {statusBadgeColor && (
        <span
          className={cn(
            'shrink-0 rounded px-1 py-0 text-[9px] font-medium capitalize',
            statusBadgeColor,
          )}
        >
          {node.status}
        </span>
      )}

      {/* Permission toggle */}
      {hasPermission && (
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-6 w-6 p-0 shrink-0',
            isAllowed
              ? 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30'
              : 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30',
          )}
          onClick={(e) => {
            e.stopPropagation()
            if (node.feature?.code) onToggle(node.feature.code)
          }}
          disabled={permSaving}
          title={isAllowed ? 'Click to deny' : 'Click to allow'}
        >
          {isAllowed ? (
            <ShieldCheck className="h-3 w-3" />
          ) : (
            <ShieldOff className="h-3 w-3" />
          )}
        </Button>
      )}
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
                getPermissionInfo={getPermissionInfo}
                onToggle={onToggle}
                permSaving={permSaving}
                selectedIds={selectedIds}
                onToggleSelect={onToggleSelect}
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

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { resolveIcon } from '@/features/modules/menu/data/menu-icon-map'
import type { MenuTreeNode } from '@/features/modules/menu/data/schema'
import { MenuTreeQueryOptions } from '@/features/modules/menu/data/queryOptions'
import { ActiveInactiveStatusTypes } from '@/types/active-inactive-status'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { IconChevronDown } from '@tabler/icons-react'
import { MenuTreeSchema } from '@/features/modules/menu/data/schema'
import { Loader, ShieldCheck, ShieldOff, ShieldBan } from 'lucide-react'
import { useMemo, useState, useCallback } from 'react'
import { roleMenuPermissionsQueryOptions } from '@/features/modules/menu_manager/data/queryOptions'
import { roleQueryOptions } from '@/features/modules/role/data/queryOptions'

export default function PermissionsSection() {
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)

  // Fetch roles
  const { data: rolesData, isLoading: rolesLoading } = useQuery(roleQueryOptions())
  const roles = rolesData?.data ?? []

  // Fetch menu tree
  const { data: treeData, isLoading: treeLoading } = useQuery(MenuTreeQueryOptions)

  // Fetch permissions for selected role
  const { data: permData, isLoading: permLoading } = useQuery({
    ...roleMenuPermissionsQueryOptions(selectedRoleId ?? undefined),
    enabled: !!selectedRoleId,
  })

  const features = permData?.data ?? []
  const queryClient = useQueryClient()

  // Build permission maps from API response
  const { featurePermissionMap, featureMetaMap } = useMemo(() => {
    const permMap = new Map<string, { id?: number; isAllowed: boolean }>()
    const metaMap = new Map<string, { id: number; appModuleId: number }>()
    features.forEach((f: any) => {
      if (!f.code) return
      if (f.rolePermission) {
        permMap.set(f.code, { id: f.rolePermission.id, isAllowed: f.rolePermission.isAllowed })
      } else {
        permMap.set(f.code, { isAllowed: false })
      }
      metaMap.set(f.code, { id: f.id, appModuleId: f.appModuleId })
    })
    return { featurePermissionMap: permMap, featureMetaMap: metaMap }
  }, [features])

  // Parse menu tree
  const menuTree: MenuTreeNode[] = useMemo(() => {
    return MenuTreeSchema.parse(treeData?.data ?? [])
  }, [treeData])

  // Compute counts from the actual menu tree
  const counts = useMemo(() => {
    let granted = 0
    let denied = 0
    let unmanaged = 0
    const walk = (nodes: MenuTreeNode[]) => {
      for (const node of nodes) {
        const code = node.feature?.code
        if (code && featureMetaMap.has(code)) {
          if (featurePermissionMap.get(code)?.isAllowed) granted++
          else denied++
        } else if (code) {
          unmanaged++
        }
        if (node.children?.length) walk(node.children)
      }
    }
    walk(menuTree)
    return { granted, denied, unmanaged }
  }, [menuTree, featureMetaMap, featurePermissionMap])

  const { mutate: savePermission, isPending: permSaving } = usePermissionMutation()

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
            queryClient.invalidateQueries({ queryKey: ['MenuPermissions', selectedRoleId] })
          },
        },
      )
    },
    [selectedRoleId, featureMetaMap, featurePermissionMap, savePermission, queryClient],
  )

  const handleToggleAll = useCallback(
    (allowed: boolean) => {
      if (!selectedRoleId) return
      featureMetaMap.forEach((meta, code) => {
        const current = featurePermissionMap.get(code)
        if (current?.isAllowed !== allowed) {
          savePermission(
            {
              roleId: selectedRoleId,
              appModuleFeatureId: meta.id,
              isAllowed: allowed,
              isEdit: !!current?.id,
              id: current?.id,
            },
            {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['MenuPermissions', selectedRoleId] })
              },
            },
          )
        }
      })
    },
    [selectedRoleId, featureMetaMap, featurePermissionMap, savePermission, queryClient],
  )

  // Build permission info lookup for tree nodes
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

  if (rolesLoading || treeLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <Loader className='h-4 w-4 animate-spin text-muted-foreground' />
      </div>
    )
  }

  return (
    <div>
      {/* Role Selector + Actions */}
      <div className='mb-3 flex flex-wrap items-center gap-2'>
        <Select
          value={selectedRoleId?.toString() ?? ''}
          onValueChange={(v) => setSelectedRoleId(Number(v))}
        >
          <SelectTrigger className='w-56 h-7 text-xs'>
            <SelectValue placeholder='Choose a role...' />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role: any) => (
              <SelectItem key={role.id} value={role.id.toString()}>
                {role.name}
                <span className='ml-2 text-[10px] text-muted-foreground font-mono'>
                  ({role.code})
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedRoleId && !permLoading && (
          <div className='flex items-center gap-1 ml-auto'>
            <Button
              variant='ghost'
              size='sm'
              className='h-6 px-2 text-[10px] text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30'
              onClick={() => handleToggleAll(true)}
              disabled={permSaving}
            >
              <ShieldCheck className='h-3 w-3 mr-1' />
              Grant All
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='h-6 px-2 text-[10px] text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30'
              onClick={() => handleToggleAll(false)}
              disabled={permSaving}
            >
              <ShieldBan className='h-3 w-3 mr-1' />
              Deny All
            </Button>
          </div>
        )}

        {selectedRoleId && !permLoading && (
          <div className='flex items-center gap-1.5 text-[10px] text-muted-foreground ml-auto lg:ml-0'>
            <span className='flex items-center gap-0.5 text-green-600'>
              <ShieldCheck className='h-3 w-3' />
              {counts.granted}
            </span>
            <span className='text-muted-foreground/30'>/</span>
            <span className='flex items-center gap-0.5 text-red-600'>
              <ShieldOff className='h-3 w-3' />
              {counts.denied}
            </span>
            {counts.unmanaged > 0 && (
              <>
                <span className='text-muted-foreground/30'>/</span>
                <span className='text-amber-600'>{counts.unmanaged} unset</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Permission tree */}
      {!selectedRoleId && (
        <div className='flex items-center justify-center py-10 text-xs text-muted-foreground'>
          Select a role above to manage its menu permissions.
        </div>
      )}

      {selectedRoleId && (permLoading || treeLoading) && (
        <div className='flex items-center justify-center py-10'>
          <Loader className='h-4 w-4 animate-spin text-muted-foreground' />
        </div>
      )}

      {selectedRoleId && !permLoading && !treeLoading && (
        <div className='space-y-0.5'>
          {menuTree.length > 0 ? (
            menuTree.map((node) => (
              <PermissionsTreeNode
                key={node.id}
                node={node}
                depth={0}
                getPermissionInfo={getPermissionInfo}
                onToggle={handleToggle}
                permSaving={permSaving}
              />
            ))
          ) : (
            <div className='flex items-center justify-center py-10 text-xs text-muted-foreground'>
              No menu entries found. Create menu entries in the Menu module first.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Tree Node Component ─────────────────────────────────────────────────────

interface PermissionsTreeNodeProps {
  node: MenuTreeNode
  depth: number
  getPermissionInfo: (node: MenuTreeNode) => { hasPermission: boolean; isAllowed: boolean }
  onToggle: (featureCode: string) => void
  permSaving: boolean
}

function PermissionsTreeNode({ node, depth, getPermissionInfo, onToggle, permSaving }: PermissionsTreeNodeProps) {
  const [isOpen, setIsOpen] = useState(depth < 1)
  const hasChildren = node.children && node.children.length > 0
  const Icon = resolveIcon(node.icon ?? undefined)
  const statusBadgeColor = ActiveInactiveStatusTypes.get(node.status)
  const { hasPermission, isAllowed } = getPermissionInfo(node)

  return (
    <div>
      {hasChildren ? (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className='group/tree'>
          <div
            className={cn(
              'flex items-center justify-between rounded-md border px-2.5 py-1 transition-colors',
              hasPermission && !isAllowed ? 'opacity-60' : '',
              'border-transparent hover:border-border hover:bg-muted/40',
              !node.isVisible && 'opacity-60',
            )}
            style={depth > 0 ? { marginLeft: `${depth * 1.25}rem` } : undefined}
          >
            <div className='flex items-center gap-1.5 min-w-0'>
              {/* Expand/collapse */}
              <CollapsibleTrigger asChild>
                <Button variant='ghost' size='icon' className='h-4 w-4 p-0 text-muted-foreground hover:text-foreground'>
                  <IconChevronDown
                    className={cn('h-3 w-3 transition-transform duration-200', isOpen ? 'rotate-0' : '-rotate-90')}
                  />
                </Button>
              </CollapsibleTrigger>

              {/* Icon */}
              <div className='flex h-5 w-5 shrink-0 items-center justify-center rounded border bg-background'>
                <Icon className='h-2.5 w-2.5 text-muted-foreground' />
              </div>

              {/* Name */}
              <span className='truncate text-xs font-medium'>{node.menuName}</span>

              {node.isGroup && (
                <Badge variant='secondary' className='shrink-0 text-[9px] px-1 py-0 leading-none'>Group</Badge>
              )}

              {node.feature?.code && (
                <code className='hidden shrink-0 truncate rounded bg-muted/60 px-1 py-0.5 text-[9px] font-mono text-muted-foreground/70 sm:inline-block max-w-24'>
                  {node.feature.code}
                </code>
              )}

              {/* Permission dot */}
              {hasPermission && (
                <span
                  className={cn(
                    'inline-block h-1.5 w-1.5 rounded-full shrink-0',
                    isAllowed ? 'bg-green-500' : 'bg-red-400',
                  )}
                />
              )}
            </div>

            <div className='flex items-center gap-1 shrink-0'>
              {/* Status badge */}
              {statusBadgeColor && (
                <span className={cn('rounded px-1 py-0 text-[9px] font-medium capitalize', statusBadgeColor)}>
                  {node.status}
                </span>
              )}

              {/* Permission toggle */}
              {hasPermission && (
                <Button
                  variant='ghost'
                  size='sm'
                  className={cn(
                    'h-5 w-5 p-0',
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
                  {isAllowed ? <ShieldCheck className='h-3 w-3' /> : <ShieldOff className='h-3 w-3' />}
                </Button>
              )}
            </div>
          </div>
          <CollapsibleContent>
            <div className='relative ml-2 border-l border-border/40 pl-1'>
              {node.children.map((child) => (
                <PermissionsTreeNode
                  key={child.id}
                  node={child}
                  depth={depth + 1}
                  getPermissionInfo={getPermissionInfo}
                  onToggle={onToggle}
                  permSaving={permSaving}
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <div
          className={cn(
            'flex items-center justify-between rounded-md border px-2.5 py-1 transition-colors',
            hasPermission && !isAllowed ? 'opacity-60' : '',
            'border-transparent hover:border-border hover:bg-muted/40',
            !node.isVisible && 'opacity-60',
          )}
          style={depth > 0 ? { marginLeft: `${depth * 1.25}rem` } : undefined}
        >
          <div className='flex items-center gap-1.5 min-w-0'>
            {/* Spacer for expand icon */}
            <span className='h-4 w-4 shrink-0' />

            {/* Icon */}
            <div className='flex h-5 w-5 shrink-0 items-center justify-center rounded border bg-background'>
              <Icon className='h-2.5 w-2.5 text-muted-foreground' />
            </div>

            {/* Name */}
            <span className='truncate text-xs font-medium'>{node.menuName}</span>

            {node.feature?.code && (
              <code className='hidden shrink-0 truncate rounded bg-muted/60 px-1 py-0.5 text-[9px] font-mono text-muted-foreground/70 sm:inline-block max-w-24'>
                {node.feature.code}
              </code>
            )}

            {/* Permission dot */}
            {hasPermission && (
              <span
                className={cn(
                  'inline-block h-1.5 w-1.5 rounded-full shrink-0',
                  isAllowed ? 'bg-green-500' : 'bg-red-400',
                )}
              />
            )}
          </div>

          <div className='flex items-center gap-1 shrink-0'>
            {/* Status badge */}
            {statusBadgeColor && (
              <span className={cn('rounded px-1 py-0 text-[9px] font-medium capitalize', statusBadgeColor)}>
                {node.status}
              </span>
            )}

            {/* Permission toggle */}
            {hasPermission && (
              <Button
                variant='ghost'
                size='sm'
                className={cn(
                  'h-5 w-5 p-0',
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
                {isAllowed ? <ShieldCheck className='h-3 w-3' /> : <ShieldOff className='h-3 w-3' />}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

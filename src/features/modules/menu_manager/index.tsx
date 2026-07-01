import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { sidebarData } from '@/layouts/components/data/sidebar-data'
import type { NavCollapsible, NavItem, NavLink } from '@/layouts/components/types'
import { usePermissionMutation } from '@/features/modules/permission/data/queryOptions'
import { roleQueryOptions } from '@/features/modules/role/data/queryOptions'
import { useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Loader, ShieldCheck, ShieldOff } from 'lucide-react'
import { useState } from 'react'
import { roleMenuPermissionsQueryOptions } from './data/queryOptions'

export default function MenuManager() {
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)

  const { data: rolesData } = useSuspenseQuery(roleQueryOptions())
  const roles = rolesData?.data ?? []

  const { data: permData, isLoading: permLoading } = useQuery({
    ...roleMenuPermissionsQueryOptions(selectedRoleId ?? undefined),
    enabled: !!selectedRoleId,
  })

  const features = permData?.data ?? []
  const queryClient = useQueryClient()

  // Build a map of feature code -> permission info
  const featurePermissionMap = new Map<string, { id?: number; isAllowed: boolean }>()
  features.forEach((f: any) => {
    if (f.code && f.rolePermission) {
      featurePermissionMap.set(f.code, {
        id: f.rolePermission.id,
        isAllowed: f.rolePermission.isAllowed,
      })
    } else if (f.code) {
      // Feature exists but no permission record for this role yet
      featurePermissionMap.set(f.code, { isAllowed: false })
    }
  })

  // Build a map of feature code -> feature metadata (id, appModuleId)
  const featureMetaMap = new Map<string, { id: number; appModuleId: number }>()
  features.forEach((f: any) => {
    if (f.code) {
      featureMetaMap.set(f.code, { id: f.id, appModuleId: f.appModuleId })
    }
  })

  const { mutate: savePermission, isPending: permSaving } = usePermissionMutation()

  const handleToggle = (featureCode: string) => {
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
      }
    )
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Menu Manager</h1>
        <p className='text-muted-foreground'>
          Control which menu items each role can see in the sidebar.
        </p>
      </div>

      {/* Role Selector */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-base'>Select Role</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedRoleId?.toString() ?? ''}
            onValueChange={(v) => setSelectedRoleId(Number(v))}
          >
            <SelectTrigger className='w-full max-w-xs'>
              <SelectValue placeholder='Choose a role to manage…' />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role: any) => (
                <SelectItem key={role.id} value={role.id.toString()}>
                  {role.name} ({role.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Menu Tree */}
      {!selectedRoleId && (
        <div className='flex items-center justify-center py-16 text-muted-foreground'>
          Select a role above to manage its menu permissions.
        </div>
      )}

      {selectedRoleId && permLoading && (
        <div className='flex items-center justify-center py-16'>
          <Loader className='h-6 w-6 animate-spin text-muted-foreground' />
        </div>
      )}

      {selectedRoleId && !permLoading && (
        <div className='space-y-4'>
          {sidebarData.navGroups
            .filter((g) => g.visible && g.requiredFeature)
            .map((group) => {
              const groupPerm = featurePermissionMap.get(group.requiredFeature!)
              const groupMeta = featureMetaMap.get(group.requiredFeature!)
              return (
                <Card key={group.title}>
                  <CardHeader
                    className={`flex flex-row items-center justify-between py-3 ${
                      groupMeta && groupPerm
                        ? groupPerm.isAllowed
                          ? ''
                          : 'opacity-60'
                        : 'opacity-80'
                    }`}
                  >
                    <CardTitle className='text-lg font-semibold'>{group.title}</CardTitle>
                    {groupMeta && (
                      <ToggleButton
                        isAllowed={groupPerm?.isAllowed ?? false}
                        loading={permSaving}
                        onToggle={() => handleToggle(group.requiredFeature!)}
                      />
                    )}
                  </CardHeader>
                  <CardContent className='space-y-2 pb-4'>
                    {group.items.map((item) => (
                      <MenuItemRow
                        key={item.title}
                        item={item}
                        featurePermissionMap={featurePermissionMap}
                        featureMetaMap={featureMetaMap}
                        onToggle={handleToggle}
                        saving={permSaving}
                      />
                    ))}
                  </CardContent>
                </Card>
              )
            })}
        </div>
      )}
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function MenuItemRow({
  item,
  featurePermissionMap,
  featureMetaMap,
  onToggle,
  saving,
  depth = 0,
}: {
  item: NavItem
  featurePermissionMap: Map<string, { id?: number; isAllowed: boolean }>
  featureMetaMap: Map<string, { id: number; appModuleId: number }>
  onToggle: (code: string) => void
  saving: boolean
  depth?: number
}) {
  if (!item.visible && !item.items) return null

  // Collapsible item with children
  if (!('url' in item) && item.items) {
    const collapsible = item as NavCollapsible
    const itemPerm = collapsible.requiredFeature
      ? featurePermissionMap.get(collapsible.requiredFeature)
      : undefined
    const itemMeta = collapsible.requiredFeature
      ? featureMetaMap.get(collapsible.requiredFeature)
      : undefined
    const permissionStatus = itemMeta ? (itemPerm?.isAllowed ? 'granted' : 'denied') : 'unmanaged'

    return (
      <div className='space-y-1' style={{ paddingLeft: depth * 16 }}>
        <div className='group flex items-center justify-between rounded-md px-3 py-1.5 hover:bg-muted/50'>
          <div className='flex items-center gap-2 text-sm font-medium'>
            <span>{item.title}</span>
            {permissionStatus === 'granted' && (
              <Badge variant='outline' className='border-green-500 text-green-600 text-[10px] px-1.5 py-0'>
                Granted
              </Badge>
            )}
            {permissionStatus === 'denied' && (
              <Badge variant='outline' className='border-red-500 text-red-600 text-[10px] px-1.5 py-0'>
                Denied
              </Badge>
            )}
            {permissionStatus === 'unmanaged' && collapsible.requiredFeature && (
              <Badge variant='outline' className='border-amber-500 text-amber-600 text-[10px] px-1.5 py-0'>
                Not Set
              </Badge>
            )}
          </div>
          {itemMeta && (
            <ToggleButton
              isAllowed={itemPerm?.isAllowed ?? false}
              loading={saving}
              onToggle={() => onToggle(collapsible.requiredFeature!)}
            />
          )}
        </div>
        {collapsible.items.map((child) => (
          <MenuItemRow
            key={child.title}
            item={child}
            featurePermissionMap={featurePermissionMap}
            featureMetaMap={featureMetaMap}
            onToggle={onToggle}
            saving={saving}
            depth={depth + 1}
          />
        ))}
      </div>
    )
  }

  // Direct link item
  const link = item as NavLink
  const itemPerm = link.requiredFeature ? featurePermissionMap.get(link.requiredFeature) : undefined
  const itemMeta = link.requiredFeature ? featureMetaMap.get(link.requiredFeature) : undefined

  return (
    <div
      className='group flex items-center justify-between rounded-md px-3 py-1.5 hover:bg-muted/50'
      style={{ paddingLeft: (depth + 1) * 16 }}
    >
      <div className='flex items-center gap-2 text-sm'>
        {link.icon && <link.icon className='h-4 w-4 text-muted-foreground' />}
        <span className={itemMeta && !itemPerm?.isAllowed ? 'text-muted-foreground/60' : ''}>
          {link.title}
        </span>
        {link.url && (
          <span className='text-[10px] text-muted-foreground/40 font-mono'>{link.url}</span>
        )}
      </div>
      {itemMeta && (
        <ToggleButton
          isAllowed={itemPerm?.isAllowed ?? false}
          loading={saving}
          onToggle={() => onToggle(link.requiredFeature!)}
        />
      )}
    </div>
  )
}

function ToggleButton({
  isAllowed,
  loading,
  onToggle,
}: {
  isAllowed: boolean
  loading: boolean
  onToggle: () => void
}) {
  return (
    <Button
      variant='ghost'
      size='sm'
      className={`gap-1.5 text-xs ${
        isAllowed
          ? 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30'
          : 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30'
      }`}
      onClick={onToggle}
      disabled={loading}
    >
      {loading ? (
        <Loader className='h-3.5 w-3.5 animate-spin' />
      ) : isAllowed ? (
        <>
          <ShieldCheck className='h-3.5 w-3.5' />
          Allowed
        </>
      ) : (
        <>
          <ShieldOff className='h-3.5 w-3.5' />
          Denied
        </>
      )}
    </Button>
  )
}

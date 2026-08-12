import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { usePermissionMutation } from '../data/queryOptions'
import type { RolePermission } from '../data/schema'
import type { AppModuleFeature } from '../../app_module_feature/data/schema'
import {
  ChevronDown,
  ChevronRight,
  Search,
  Check,
  X,
  CheckCheck,
  Ban,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

type FeatureWithPermission = AppModuleFeature & {
  rolePermission?: RolePermission
  rolePermissions?: RolePermission[]
}

interface PermissionMatrixProps {
  features: FeatureWithPermission[]
  roleId: number
}

export function PermissionMatrix({ features, roleId }: PermissionMatrixProps) {
  const [search, setSearch] = useState('')
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set())
  const { mutate: savePermission, isPending } = usePermissionMutation()

  // Group features by appModule
  const moduleGroups = useMemo(() => {
    const groups = new Map<
      number,
      { module: any; features: FeatureWithPermission[] }
    >()
    for (const feature of features) {
      const moduleId = feature.appModuleId ?? 0
      if (!groups.has(moduleId)) {
        groups.set(moduleId, { module: feature.appModule, features: [] })
      }
      groups.get(moduleId)!.features.push(feature)
    }
    return Array.from(groups.entries())
  }, [features])

  // Expand all modules on first render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (moduleGroups.length > 0 && expandedModules.size === 0) {
      setExpandedModules(new Set(moduleGroups.map(([id]) => id)))
    }
  }, [moduleGroups])

  // Filter by search
  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase()
    const result: {
      moduleId: number
      module: any
      features: FeatureWithPermission[]
    }[] = []
    for (const [moduleId, group] of moduleGroups) {
      if (!q) {
        result.push({
          moduleId,
          module: group.module,
          features: group.features,
        })
      } else {
        const filtered = group.features.filter(
          (f: FeatureWithPermission) =>
            f.name?.toLowerCase().includes(q) ||
            f.code?.toLowerCase().includes(q) ||
            group.module?.name?.toLowerCase().includes(q),
        )
        if (filtered.length > 0) {
          result.push({ moduleId, module: group.module, features: filtered })
        }
      }
    }
    return result
  }, [moduleGroups, search])

  const toggleModule = useCallback((moduleId: number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) next.delete(moduleId)
      else next.add(moduleId)
      return next
    })
  }, [])

  const handleToggle = useCallback(
    (feature: FeatureWithPermission) => {
      if (isPending) return
      const rp = feature.rolePermission
      if (rp?.id) {
        // Existing permission — toggle it
        savePermission({
          ...rp,
          isAllowed: !rp.isAllowed,
          isEdit: true,
          roleId,
          appModuleFeatureId: feature.id,
        })
      } else {
        // No permission yet — create one as granted
        savePermission({
          roleId,
          appModuleFeatureId: feature.id,
          isAllowed: true,
          isEdit: false,
        } as any)
      }
    },
    [roleId, savePermission, isPending],
  )

  const handleModuleBulk = useCallback(
    (moduleFeatures: FeatureWithPermission[], allow: boolean) => {
      for (const feature of moduleFeatures) {
        const rp = feature.rolePermission
        if (rp?.id) {
          if (rp.isAllowed !== allow) {
            savePermission({
              ...rp,
              isAllowed: allow,
              isEdit: true,
              roleId,
              appModuleFeatureId: feature.id,
            })
          }
        } else if (allow) {
          savePermission({
            roleId,
            appModuleFeatureId: feature.id,
            isAllowed: true,
            isEdit: false,
          } as any)
        }
      }
    },
    [roleId, savePermission],
  )

  return (
    <div className="flex flex-col rounded-xl border bg-card shadow-sm overflow-hidden">
      {/* Search bar */}
      <div className=" flex flex-row flex-nowrap items-center gap-2 border-b bg-muted/30 px-4 py-1">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search features by name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="self-center min-h-[48px]! p-2 max-w-sm min-w-[90%] border-0 bg-transparent text-lg shadow-none focus:border-2 focus:bg-blue-50 focus-visible:ring-0"
        />
        {search && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearch('')}
            className="h-7 px-2 text-xs"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Module list */}
      <ScrollArea className="h-[calc(100vh-520px)] min-h-[300px]">
        <div className="p-3 space-y-2">
          {filteredGroups.length === 0 && (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
              No features found{search ? ` matching "${search}"` : ''}.
            </div>
          )}

          {filteredGroups.map(
            ({ moduleId, module: mod, features: groupFeatures }) => {
              const isExpanded = expandedModules.has(moduleId)
              const granted = groupFeatures.filter(
                (f) => f.rolePermission?.isAllowed,
              ).length
              const denied = groupFeatures.filter(
                (f) => f.rolePermission && !f.rolePermission.isAllowed,
              ).length
              const total = groupFeatures.length

              return (
                <Collapsible
                  key={moduleId}
                  open={isExpanded}
                  onOpenChange={() => toggleModule(moduleId)}
                >
                  <div className="rounded-lg border bg-card overflow-hidden transition-all hover:shadow-sm">
                    {/* Module header */}
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent/30 transition-colors select-none">
                        <div className="text-muted-foreground transition-transform duration-200">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {mod?.name ?? `Module ${moduleId}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {total} feature{total !== 1 ? 's' : ''}
                          </p>
                        </div>

                        {/* Mini progress bar */}
                        <div className="hidden sm:flex items-center gap-2">
                          <div className="flex h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                            <div
                              className="bg-emerald-500 transition-all duration-500"
                              style={{
                                width:
                                  total > 0
                                    ? `${(granted / total) * 100}%`
                                    : '0%',
                              }}
                            />
                            <div
                              className="bg-red-500 transition-all duration-500"
                              style={{
                                width:
                                  total > 0
                                    ? `${(denied / total) * 100}%`
                                    : '0%',
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground font-mono w-14 text-right">
                            {granted}/{total}
                          </span>
                        </div>

                        {/* Bulk actions */}
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <TooltipProvider delayDuration={300}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                  onClick={() =>
                                    handleModuleBulk(groupFeatures, true)
                                  }
                                >
                                  <CheckCheck className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Grant all in {mod?.name ?? 'module'}
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                  onClick={() =>
                                    handleModuleBulk(groupFeatures, false)
                                  }
                                >
                                  <Ban className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                Deny all in {mod?.name ?? 'module'}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    {/* Feature rows */}
                    <CollapsibleContent>
                      <div className="border-t divide-y">
                        {' '}
                        {groupFeatures.map((feature: FeatureWithPermission) => {
                          const rp = feature.rolePermission
                          const isAllowed = rp?.isAllowed ?? null
                          return (
                            <div
                              key={feature.id}
                              className={cn(
                                'flex items-center gap-4 px-4 py-2.5 transition-colors',
                                'hover:bg-accent/20',
                                isAllowed === true &&
                                  'bg-emerald-50/40 dark:bg-emerald-950/10',
                                isAllowed === false &&
                                  'bg-red-50/30 dark:bg-red-950/10',
                              )}
                            >
                              {/* Status icon */}
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors">
                                {isAllowed === true ? (
                                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-100 dark:bg-emerald-900/40">
                                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                ) : isAllowed === false ? (
                                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-red-100 dark:bg-red-900/40">
                                    <X className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                                  </div>
                                ) : (
                                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted">
                                    <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                                  </div>
                                )}
                              </div>

                              {/* Feature info */}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {feature.name}
                                </p>
                                <p className="text-xs text-muted-foreground font-mono truncate">
                                  {feature.code}
                                </p>
                              </div>

                              {/* Status badge */}
                              <Badge
                                variant="outline"
                                className={cn(
                                  'shrink-0 text-[10px] font-semibold px-2 hidden sm:inline-flex',
                                  isAllowed === true &&
                                    'border-emerald-300 text-emerald-700 bg-emerald-50 dark:border-emerald-700 dark:text-emerald-400 dark:bg-emerald-950/30',
                                  isAllowed === false &&
                                    'border-red-300 text-red-600 bg-red-50 dark:border-red-700 dark:text-red-400 dark:bg-red-950/30',
                                  isAllowed === null &&
                                    'border-muted-foreground/20 text-muted-foreground bg-muted/50',
                                )}
                              >
                                {isAllowed === true
                                  ? 'Granted'
                                  : isAllowed === false
                                    ? 'Denied'
                                    : 'Not Set'}
                              </Badge>

                              {/* Toggle switch */}
                              <Switch
                                checked={isAllowed ?? false}
                                onCheckedChange={() => handleToggle(feature)}
                                disabled={isPending}
                                className="shrink-0 data-[state=checked]:bg-emerald-500"
                              />
                            </div>
                          )
                        })}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )
            },
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

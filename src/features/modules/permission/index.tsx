import { Main } from '@/layouts/components/main'
import { PermissionStatsCards } from './components/permission-stats'
import { RoleSelector } from './components/role-selector'
import { PermissionMatrix } from './components/permission-matrix'
import { Shield, RefreshCw, Loader2 } from 'lucide-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { fetchRoleService } from '../role/data/api'
import { featuresWithRolePermissionsQueryOptions } from './data/queryOptions'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PermissionProps {
  data: any // permissionList - not used in the new design, kept for route compatibility
}

export default function Permission({ data: _data }: PermissionProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)

  return (
    <Main className='min-w-full'>
      {/* Header */}
      <div className='mb-4 flex flex-wrap items-start justify-between gap-3 rounded-lg border border-slate-200/70 bg-white/80 px-5 py-4 shadow-sm dark:border-white/[0.07] dark:bg-white/5'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10'>
              <Shield className='h-5 w-5 text-primary' />
            </div>
            <h2 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100'>
              Permission Manager
            </h2>
          </div>
          <p className='text-slate-600 dark:text-slate-400 pl-11'>
            Configure role-based access control across all modules and features.
          </p>
        </div>
      </div>

      {/* Stats + Role Selector + Permission Matrix */}
      <SuspenseWrapper selectedRoleId={selectedRoleId} onSelectRole={setSelectedRoleId} />
    </Main>
  )
}

function SuspenseWrapper({
  selectedRoleId,
  onSelectRole,
}: {
  selectedRoleId: number | null
  onSelectRole: (id: number | null) => void
}) {
  // Fetch all roles
  const { data: rolesData } = useSuspenseQuery({
    queryKey: ['roles'],
    queryFn: fetchRoleService,
  })

  const roles = useMemo(() => rolesData?.data ?? [], [rolesData])

  // Auto-select first role
  useEffect(() => {
    if (!selectedRoleId && roles.length > 0) {
      onSelectRole(roles[0].id)
    }
  }, [selectedRoleId, roles, onSelectRole])

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4'>
          {/* Left sidebar — Role selector */}
          <div className='rounded-xl border bg-card shadow-sm p-3'>
            <RoleSelector
              roles={roles}
              selectedRoleId={selectedRoleId}
              onSelect={onSelectRole}
            />
          </div>

          {/* Right panel — Stats + Matrix */}
          <div className='space-y-4 min-w-0'>
            {selectedRoleId ? (
              <Suspense fallback={<MatrixLoader />}>
                <PermissionPanel roleId={selectedRoleId} />
              </Suspense>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
    </div>
  )
}

function PermissionPanel({ roleId }: { roleId: number }) {
  const { data: featuresData, refetch, isFetching } = useSuspenseQuery(
    featuresWithRolePermissionsQueryOptions(roleId)
  )

  const features = useMemo(() => featuresData?.data ?? [], [featuresData])

  // Compute stats
  const stats = useMemo(() => {
    let granted = 0
    let denied = 0
    let notSet = 0
    for (const f of features) {
      if (f.rolePermission) {
        if (f.rolePermission.isAllowed) granted++
        else denied++
      } else {
        notSet++
      }
    }
    return { totalFeatures: features.length, granted, denied, notSet }
  }, [features])

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  return (
    <>
      {/* Stats */}
      <PermissionStatsCards
        totalFeatures={stats.totalFeatures}
        granted={stats.granted}
        denied={stats.denied}
        notSet={stats.notSet}
      />

      {/* Quick help */}
      {stats.notSet === stats.totalFeatures && stats.totalFeatures > 0 && (
        <Alert className='border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30'>
          <AlertDescription className='text-sm text-amber-700 dark:text-amber-400'>
            <strong>No permissions configured yet.</strong> Use the toggle switches below to grant or deny access to each feature for this role.
          </AlertDescription>
        </Alert>
      )}

      {/* Matrix header */}
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wider'>
          Feature Permissions
        </h3>
        <Button
          variant='ghost'
          size='sm'
          onClick={handleRefresh}
          disabled={isFetching}
          className='h-8 gap-1.5 text-xs'
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Permission Matrix */}
      <PermissionMatrix features={features} roleId={roleId} />
    </>
  )
}

function MatrixLoader() {
  return (
    <div className='flex items-center justify-center py-16 rounded-xl border bg-card shadow-sm'>
      <Loader2 className='h-6 w-6 animate-spin text-primary' />
    </div>
  )
}

function EmptyState() {
  return (
    <div className='flex flex-col items-center justify-center rounded-xl border bg-card shadow-sm py-16 text-center'>
      <div className='flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4'>
        <Shield className='h-8 w-8 text-muted-foreground/50' />
      </div>
      <h3 className='text-lg font-semibold text-foreground'>Select a Role</h3>
      <p className='mt-1 max-w-sm text-sm text-muted-foreground'>
        Choose a role from the sidebar to view and configure its feature permissions.
      </p>
    </div>
  )
}

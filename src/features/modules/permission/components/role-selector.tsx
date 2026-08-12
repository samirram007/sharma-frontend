import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Shield, Users } from 'lucide-react'
import type { Role } from '../../role/data/schema'

interface RoleSelectorProps {
  roles: Role[]
  selectedRoleId: number | null
  onSelect: (roleId: number) => void
  rolePermissionCounts?: Map<
    number,
    { granted: number; denied: number; total: number }
  >
}

export function RoleSelector({
  roles,
  selectedRoleId,
  onSelect,
  rolePermissionCounts,
}: RoleSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Roles
        </h3>
      </div>
      <ScrollArea className="h-[calc(100vh-420px)] min-h-[200px]">
        <div className="space-y-1.5 pr-2">
          {roles.map((role) => {
            const counts = rolePermissionCounts?.get(role.id)
            const isSelected = selectedRoleId === role.id
            return (
              <button
                key={role.id}
                onClick={() => onSelect(role.id)}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200',
                  'hover:bg-accent/50',
                  isSelected
                    ? 'bg-primary/10 text-primary ring-1 ring-primary/20 shadow-sm'
                    : 'text-foreground/80 hover:text-foreground',
                )}
              >
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                    isSelected
                      ? 'bg-primary/15 text-primary'
                      : 'bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground',
                  )}
                >
                  <Shield className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      'text-sm font-medium truncate',
                      isSelected && 'font-semibold',
                    )}
                  >
                    {role.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {role.code}
                  </p>
                </div>
                {counts && (
                  <div className="flex items-center gap-1">
                    <Badge
                      variant="outline"
                      className={cn(
                        'h-5 text-[10px] px-1.5 font-mono',
                        isSelected
                          ? 'border-primary/30 text-primary'
                          : 'border-muted-foreground/20',
                      )}
                    >
                      {counts.granted}/{counts.total}
                    </Badge>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

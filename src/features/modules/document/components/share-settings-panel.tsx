import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  IconSearch,
  IconUser,
  IconUsersGroup,
  IconLoader2,
  IconX,
  IconEye,
  IconPencil,
  IconCopy,
  IconArrowBackUp,
  IconTrash,
  IconLink,
  IconChevronDown,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useShareTargets,
  useSyncShares,
} from '@/features/modules/document/data/queryOptions'
import type { DocumentNode } from '@/features/modules/document/data/schema'

/**
 * Actions grantable per share target. 'view' is always on (a share grants
 * at least visibility) — the rest default to denied so sharing stays
 * read-only until the owner opts in per action.
 */
export const SHARE_ACTIONS: ReadonlyArray<{
  key: ShareActionKey
  label: string
  icon: typeof IconEye
  /** 'view' is implicit — shown checked and disabled. */
  always?: boolean
}> = [
  { key: 'view', label: 'Read (view)', icon: IconEye, always: true },
  { key: 'write', label: 'Write (edit, rename, move into)', icon: IconPencil },
  { key: 'copy', label: 'Copy', icon: IconCopy },
  { key: 'move', label: 'Move (re-parent)', icon: IconArrowBackUp },
  { key: 'delete', label: 'Delete', icon: IconTrash },
  { key: 'share', label: 'Re-share', icon: IconLink },
]

export type ShareActionKey =
  'view' | 'write' | 'copy' | 'move' | 'delete' | 'share'

interface ShareSettingsPanelProps {
  node: DocumentNode
  /** Called after sharing is saved (parent closes its dialog). */
  onSaved?: () => void
  /** Hide the dialog chrome — for embedding (properties Sharing tab). */
  embedded?: boolean
  onClose?: () => void
}

/** Short label — "Write (edit, rename, move into)" → "Write". */
const shortLabel = (label: string) => label.split(' (')[0]

/**
 * Flat sharing panel: pick people, then set one shared set of permissions
 * for everyone selected. Single column, no nested tabs — the Users/Roles
 * switch is a small segmented toggle, roles appear in the same list frame.
 *
 * Shared by the standalone Share dialog and the Properties dialog's
 * Sharing tab.
 */
export function ShareSettingsPanel({
  node,
  onSaved,
  embedded = false,
  onClose,
}: ShareSettingsPanelProps) {
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set())
  const [selectedRoles, setSelectedRoles] = useState<Set<number>>(new Set())
  /** Action grants per target, keyed "user:3" / "role:5". */
  const [permissions, setPermissions] = useState<
    Record<string, Set<ShareActionKey>>
  >({})
  const [userFilter, setUserFilter] = useState('')
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users')
  /** Target keys ("user:3" / "role:5") whose inline permission editor is open. */
  const [expandedTargets, setExpandedTargets] = useState<Set<string>>(new Set())

  const targets = useShareTargets(true)
  const syncShares = useSyncShares()

  // Prefill from the node's existing shares each time it opens/changes.
  useEffect(() => {
    setSelectedUsers(
      new Set(
        node.sharedWith
          .filter((share) => share.targetType === 'user')
          .map((share) => share.targetId),
      ),
    )
    setSelectedRoles(
      new Set(
        node.sharedWith
          .filter((share) => share.targetType === 'role')
          .map((share) => share.targetId),
      ),
    )
    const grants: Record<string, Set<ShareActionKey>> = {}
    for (const share of node.sharedWith) {
      grants[`${share.targetType}:${share.targetId}`] = new Set(
        share.permissions as ShareActionKey[],
      )
    }
    setPermissions(grants)
    setUserFilter('')
    setExpandedTargets(new Set())
  }, [node])

  const users = useMemo(
    () =>
      (targets.data?.data?.users ?? []) as Array<{
        id: number
        name: string
        email: string
      }>,
    [targets.data],
  )
  const roles = useMemo(
    () =>
      (targets.data?.data?.roles ?? []) as Array<{ id: number; name: string }>,
    [targets.data],
  )

  const filteredUsers = useMemo(() => {
    const term = userFilter.trim().toLowerCase()
    if (!term) return users
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        (user.email ?? '').toLowerCase().includes(term),
    )
  }, [users, userFilter])

  const selectedKeys = useMemo(
    () => [
      ...Array.from(selectedUsers).map((id) => `user:${id}`),
      ...Array.from(selectedRoles).map((id) => `role:${id}`),
    ],
    [selectedUsers, selectedRoles],
  )
  const selectedCount = selectedKeys.length

  /** 'all' | 'some' | 'none' — how many selected targets hold the action. */
  const bulkState = (action: ShareActionKey): 'all' | 'some' | 'none' => {
    if (selectedCount === 0) return 'none'
    let withAction = 0
    for (const key of selectedKeys) {
      if (permissions[key]?.has(action)) withAction++
    }
    if (withAction === 0) return 'none'
    return withAction === selectedCount ? 'all' : 'some'
  }

  const toggleTargetExpanded = (targetKey: string) => {
    setExpandedTargets((prev) => {
      const next = new Set(prev)
      if (next.has(targetKey)) next.delete(targetKey)
      else next.add(targetKey)
      return next
    })
  }

  /** Grant/revoke a single action on one target ('view' is implicit). */
  const toggleTargetAction = (targetKey: string, action: ShareActionKey) => {
    if (action === 'view') return
    setPermissions((p) => {
      const next = { ...p }
      const current = new Set(next[targetKey] ?? ['view'])
      if (current.has(action)) current.delete(action)
      else current.add(action)
      next[targetKey] = current
      return next
    })
  }

  const toggleUser = (id: number) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        setExpandedTargets((prevExpanded) => {
          const nextExpanded = new Set(prevExpanded)
          nextExpanded.delete(`user:${id}`)
          return nextExpanded
        })
        setPermissions((p) => {
          const nextPerms = { ...p }
          delete nextPerms[`user:${id}`]
          return nextPerms
        })
      } else {
        next.add(id)
        setPermissions((p) => ({
          ...p,
          [`user:${id}`]: p[`user:${id}`] ?? new Set<ShareActionKey>(['view']),
        }))
      }
      return next
    })
  }

  const toggleRole = (id: number) => {
    setSelectedRoles((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        setExpandedTargets((prevExpanded) => {
          const nextExpanded = new Set(prevExpanded)
          nextExpanded.delete(`role:${id}`)
          return nextExpanded
        })
        setPermissions((p) => {
          const nextPerms = { ...p }
          delete nextPerms[`role:${id}`]
          return nextPerms
        })
      } else {
        next.add(id)
        setPermissions((p) => ({
          ...p,
          [`role:${id}`]: p[`role:${id}`] ?? new Set<ShareActionKey>(['view']),
        }))
      }
      return next
    })
  }

  /**
   * Apply an action to every selected target: none/partial → grant for all,
   * all → revoke for all. 'view' is the floor of any share, never toggled.
   */
  const toggleBulkAction = (action: ShareActionKey) => {
    if (action === 'view' || selectedCount === 0) return
    const shouldGrant = bulkState(action) !== 'all'
    setPermissions((p) => {
      const next = { ...p }
      for (const key of selectedKeys) {
        const current = new Set(next[key] ?? ['view'])
        if (shouldGrant) current.add(action)
        else current.delete(action)
        next[key] = current
      }
      return next
    })
  }

  const buildPayload = () => ({
    id: node.id,
    userIds: Array.from(selectedUsers),
    roleIds: Array.from(selectedRoles),
    permissions: Object.fromEntries(
      Object.entries(permissions).map(([key, actions]) => [
        key,
        Array.from(actions),
      ]),
    ),
  })

  const save = () => {
    syncShares.mutate(buildPayload(), {
      onSuccess: () => {
        const total = selectedUsers.size + selectedRoles.size
        toast.success(
          total > 0
            ? `Sharing updated — ${total} target${total === 1 ? '' : 's'}.`
            : 'Sharing removed — document is private again.',
        )
        onSaved?.()
        onClose?.()
      },
    })
  }

  /** Granted extras as tiny badges on a selected row. */
  const renderBadges = (targetKey: string) => {
    const extras = SHARE_ACTIONS.filter(
      (action) => !action.always && permissions[targetKey]?.has(action.key),
    )
    if (extras.length === 0) return null
    return (
      <span className="flex shrink-0 gap-1">
        {extras.map((action) => {
          const Icon = action.icon
          return (
            <Badge
              key={action.key}
              variant="secondary"
              className="gap-0.5 px-1 py-0 text-[10px] font-normal"
              title={action.label}
            >
              <Icon className="h-2.5 w-2.5" />
              {shortLabel(action.label)}
            </Badge>
          )
        })}
      </span>
    )
  }

  /** Select/deselect every visible item of the active tab. */
  const toggleSelectAll = () => {
    if (activeTab === 'users') {
      const shouldSelect = !filteredUsers.every((u) => selectedUsers.has(u.id))
      setSelectedUsers((prev) => {
        const next = new Set(prev)
        for (const user of filteredUsers) {
          if (shouldSelect) next.add(user.id)
          else next.delete(user.id)
        }
        return next
      })
      setPermissions((p) => {
        const next = { ...p }
        for (const user of filteredUsers) {
          const key = `user:${user.id}`
          if (shouldSelect) next[key] = next[key] ?? new Set(['view'])
          else delete next[key]
        }
        return next
      })
    } else {
      const shouldSelect = !roles.every((r) => selectedRoles.has(r.id))
      setSelectedRoles((prev) => {
        const next = new Set(prev)
        for (const role of roles) {
          if (shouldSelect) next.add(role.id)
          else next.delete(role.id)
        }
        return next
      })
      setPermissions((p) => {
        const next = { ...p }
        for (const role of roles) {
          const key = `role:${role.id}`
          if (shouldSelect) next[key] = next[key] ?? new Set(['view'])
          else delete next[key]
        }
        return next
      })
    }
  }

  const allSelected =
    activeTab === 'users'
      ? filteredUsers.length > 0 &&
        filteredUsers.every((u) => selectedUsers.has(u.id))
      : roles.length > 0 && roles.every((r) => selectedRoles.has(r.id))
  const someSelected =
    activeTab === 'users'
      ? filteredUsers.some((u) => selectedUsers.has(u.id))
      : roles.some((r) => selectedRoles.has(r.id))
  const visibleCount =
    activeTab === 'users' ? filteredUsers.length : roles.length

  const clearSelection = () => {
    setSelectedUsers(new Set())
    setSelectedRoles(new Set())
    setPermissions({})
    setExpandedTargets(new Set())
  }

  /**
   * Inline per-target permission editor — the row's own grant set, shown
   * under an expanded row. 'view' is implicit and locked.
   */
  const renderPermissionEditor = (targetKey: string) => (
    <div className="mb-1 ml-8 grid grid-cols-2 gap-x-3 gap-y-1 rounded-md border bg-muted/20 px-2 py-1.5">
      {SHARE_ACTIONS.map((action) => {
        const checked =
          action.always || permissions[targetKey]?.has(action.key) || false
        const Icon = action.icon
        return (
          <label
            key={action.key}
            title={action.label}
            className={`flex items-center gap-1.5 text-xs ${
              action.always ? 'cursor-default opacity-60' : 'cursor-pointer'
            }`}
          >
            <Checkbox
              checked={checked}
              disabled={action.always}
              onCheckedChange={() => toggleTargetAction(targetKey, action.key)}
            />
            <Icon className="h-3 w-3 shrink-0 text-muted-foreground" />
            <span className="truncate">{shortLabel(action.label)}</span>
          </label>
        )
      })}
    </div>
  )

  /** Row expand/collapse chevron for a selected target's permission editor. */
  const renderExpandToggle = (targetKey: string) => {
    const expanded = expandedTargets.has(targetKey)
    return (
      <button
        type="button"
        aria-expanded={expanded}
        title={expanded ? 'Hide permissions' : 'Edit permissions'}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          toggleTargetExpanded(targetKey)
        }}
      >
        <IconChevronDown
          className={`h-3.5 w-3.5 transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>
    )
  }

  if (targets.isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <IconLoader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const panel = (
    <div className="flex flex-col gap-2">
      {/* Row 1 — segmented Users/Roles toggle + select-all + clear. */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 rounded-md border p-0.5">
          <button
            type="button"
            className={`flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('users')}
          >
            <IconUser className="h-3.5 w-3.5" />
            Users
            {selectedUsers.size > 0 && ` (${selectedUsers.size})`}
          </button>
          <button
            type="button"
            className={`flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium transition-colors ${
              activeTab === 'roles'
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('roles')}
          >
            <IconUsersGroup className="h-3.5 w-3.5" />
            Roles
            {selectedRoles.size > 0 && ` (${selectedRoles.size})`}
          </button>
        </div>

        {selectedCount > 0 ? (
          <button
            type="button"
            className="text-xs text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline"
            onClick={clearSelection}
          >
            Clear selection ({selectedCount})
          </button>
        ) : (
          <span className="text-xs text-muted-foreground">No one selected</span>
        )}
      </div>

      {/* Row 2 — filter (users only) — sits on the same grid line. */}
      {activeTab === 'users' && (
        <div className="relative">
          <IconSearch className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={userFilter}
            onChange={(event) => setUserFilter(event.target.value)}
            placeholder="Filter by name or email…"
            className="h-8 pl-8"
          />
          {userFilter && (
            <button
              type="button"
              aria-label="Clear filter"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setUserFilter('')}
            >
              <IconX className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Row 3 — select-all strip. */}
      <label
        className={`flex items-center gap-1.5 text-xs text-muted-foreground ${
          visibleCount > 0 ? 'cursor-pointer' : 'cursor-default opacity-60'
        }`}
      >
        <Checkbox
          checked={allSelected ? true : someSelected ? 'indeterminate' : false}
          disabled={visibleCount === 0}
          onCheckedChange={toggleSelectAll}
        />
        {allSelected
          ? 'Deselect all'
          : someSelected
            ? 'Select all remaining'
            : 'Select all'}
      </label>

      {/* Row 4 — the list, hard height cap so it never pushes below. */}
      <div className="max-h-52 overflow-y-auto rounded-md border">
        <div className="p-1">
          {activeTab === 'users' ? (
            filteredUsers.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                No users match.
              </p>
            ) : (
              filteredUsers.map((user) => {
                const key = `user:${user.id}`
                const selected = selectedUsers.has(user.id)
                return (
                  <div key={user.id}>
                    <label
                      className={`flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1 text-sm ${
                        selected ? 'bg-primary/5' : 'hover:bg-muted/60'
                      }`}
                    >
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() => toggleUser(user.id)}
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {user.name}
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </span>
                      {selected && renderBadges(key)}
                      {selected && renderExpandToggle(key)}
                    </label>
                    {selected &&
                      expandedTargets.has(key) &&
                      renderPermissionEditor(key)}
                  </div>
                )
              })
            )
          ) : roles.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No roles found.
            </p>
          ) : (
            roles.map((role) => {
              const key = `role:${role.id}`
              const selected = selectedRoles.has(role.id)
              return (
                <div key={role.id}>
                  <label
                    className={`flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1 text-sm ${
                      selected ? 'bg-primary/5' : 'hover:bg-muted/60'
                    }`}
                  >
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => toggleRole(role.id)}
                    />
                    <span className="min-w-0 flex-1 truncate">{role.name}</span>
                    {selected && renderBadges(key)}
                    {selected && renderExpandToggle(key)}
                  </label>
                  {selected &&
                    expandedTargets.has(key) &&
                    renderPermissionEditor(key)}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Row 5 — context-aware permission bar. Editing always applies to the
          current selection: one target → its name (per-target editing),
          several → "N selected" with a mixed badge when their grants
          disagree. Rows can also be tuned individually via their chevron. */}
      {(() => {
        const singleUser =
          selectedCount === 1 && selectedUsers.size === 1
            ? users.find((u) => selectedUsers.has(u.id))
            : undefined
        const singleRole =
          selectedCount === 1 && selectedRoles.size === 1
            ? roles.find((r) => selectedRoles.has(r.id))
            : undefined
        const singleName = singleUser?.name ?? singleRole?.name
        const hasMixed =
          selectedCount > 1 &&
          SHARE_ACTIONS.some(
            (action) => !action.always && bulkState(action.key) === 'some',
          )
        return (
          <div
            className={`rounded-md border px-2 py-1.5 ${
              selectedCount > 0 ? 'bg-muted/30' : 'opacity-70'
            }`}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-xs font-medium">
                {selectedCount === 0
                  ? 'Permissions:'
                  : singleName
                    ? `Permissions for ${singleName}:`
                    : `For ${selectedCount} selected:`}
              </span>
              {hasMixed && (
                <Badge
                  variant="secondary"
                  className="px-1 py-0 text-[10px] font-normal"
                  title="Selected targets have different permissions — editing grants or revokes for everyone"
                >
                  mixed
                </Badge>
              )}
              {SHARE_ACTIONS.map((action) => {
                const state = bulkState(action.key)
                const checked = action.always
                  ? true
                  : state === 'all'
                    ? true
                    : state === 'some'
                      ? 'indeterminate'
                      : false
                const Icon = action.icon
                return (
                  <label
                    key={action.key}
                    className={`flex items-center gap-1 text-xs ${
                      action.always || selectedCount === 0
                        ? 'cursor-default opacity-60'
                        : 'cursor-pointer'
                    }`}
                    title={
                      action.always
                        ? 'Every share can view'
                        : state === 'some'
                          ? 'Granted to only some selected — click to grant everyone'
                          : action.label
                    }
                  >
                    <Checkbox
                      checked={checked}
                      disabled={action.always || selectedCount === 0}
                      onCheckedChange={() => toggleBulkAction(action.key)}
                    />
                    <Icon className="h-3 w-3 text-muted-foreground" />
                    {shortLabel(action.label)}
                  </label>
                )
              })}
            </div>
          </div>
        )
      })()}
    </div>
  )

  if (embedded) {
    // Embedded mode (Properties → Sharing tab) — the host dialog supplies the
    // chrome, but the panel still owns its own save action and busy state.
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <div className="min-h-0 flex-1 overflow-y-auto">{panel}</div>
        <div className="flex shrink-0 items-center justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={syncShares.isPending}>
            {syncShares.isPending ? 'Saving…' : 'Save sharing'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-3 overflow-hidden sm:max-w-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle className="truncate pr-8">
            Share “{node.name}”
          </DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto">{panel}</div>
        <DialogFooter className="shrink-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={syncShares.isPending}>
            {syncShares.isPending ? 'Saving…' : 'Save sharing'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

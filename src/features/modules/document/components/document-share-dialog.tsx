import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  IconSearch,
  IconUser,
  IconUsersGroup,
  IconLoader2,
  IconX,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useShareTargets, useSyncShares } from '@/features/modules/document/data/queryOptions'
import type { DocumentNode } from '@/features/modules/document/data/schema'

interface DocumentShareDialogProps {
  node: DocumentNode | null
  onClose: () => void
}

/** Share a node with users and/or roles via the DocumentManager share endpoints. */
export function DocumentShareDialog({ node, onClose }: DocumentShareDialogProps) {
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set())
  const [selectedRoles, setSelectedRoles] = useState<Set<number>>(new Set())
  const [userFilter, setUserFilter] = useState('')

  const targets = useShareTargets(node != null)
  const syncShares = useSyncShares()

  // Prefill from the node's existing shares each time it opens.
  useEffect(() => {
    if (!node) return
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
    setUserFilter('')
  }, [node])

  const users = useMemo(
    () => (targets.data?.data?.users ?? []) as Array<{ id: number; name: string; email: string }>,
    [targets.data],
  )
  const roles = useMemo(
    () => (targets.data?.data?.roles ?? []) as Array<{ id: number; name: string }>,
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

  const toggleUser = (id: number) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleRole = (id: number) => {
    setSelectedRoles((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const save = () => {
    if (!node) return
    syncShares.mutate(
      {
        id: node.id,
        userIds: Array.from(selectedUsers),
        roleIds: Array.from(selectedRoles),
      },
      {
        onSuccess: () => {
          const total = selectedUsers.size + selectedRoles.size
          toast.success(
            total > 0
              ? `Sharing updated — ${total} target${total === 1 ? '' : 's'}.`
              : 'Sharing removed — document is private again.',
          )
          onClose()
        },
      },
    )
  }

  if (!node) return null

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="truncate pr-8">Share “{node.name}”</DialogTitle>
          <DialogDescription>
            {selectedUsers.size + selectedRoles.size > 0
              ? 'Shared targets can view (and download) this document.'
              : 'No shares yet — the document stays private to you.'}
          </DialogDescription>
        </DialogHeader>

        {targets.isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <IconLoader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="users" className="flex min-h-0 flex-1 flex-col gap-3">
            <TabsList>
              <TabsTrigger value="users" className="gap-1.5">
                <IconUser className="h-3.5 w-3.5" />
                Users
                {selectedUsers.size > 0 && (
                  <span className="text-xs text-muted-foreground">({selectedUsers.size})</span>
                )}
              </TabsTrigger>
              <TabsTrigger value="roles" className="gap-1.5">
                <IconUsersGroup className="h-3.5 w-3.5" />
                Roles
                {selectedRoles.size > 0 && (
                  <span className="text-xs text-muted-foreground">({selectedRoles.size})</span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="flex min-h-0 flex-1 flex-col gap-2">
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
              <ScrollArea className="min-h-0 flex-1 rounded-md border">
                <div className="p-1.5">
                  {filteredUsers.length === 0 ? (
                    <p className="p-4 text-center text-sm text-muted-foreground">
                      No users match.
                    </p>
                  ) : (
                    filteredUsers.map((user) => (
                      <label
                        key={user.id}
                        className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60"
                      >
                        <Checkbox
                          checked={selectedUsers.has(user.id)}
                          onCheckedChange={() => toggleUser(user.id)}
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {user.name}
                          <span className="ml-1.5 text-xs text-muted-foreground">{user.email}</span>
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="roles" className="flex min-h-0 flex-1 flex-col gap-2">
              <ScrollArea className="min-h-0 flex-1 rounded-md border">
                <div className="p-1.5">
                  {roles.length === 0 ? (
                    <p className="p-4 text-center text-sm text-muted-foreground">No roles found.</p>
                  ) : (
                    roles.map((role) => (
                      <label
                        key={role.id}
                        className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted/60"
                      >
                        <Checkbox
                          checked={selectedRoles.has(role.id)}
                          onCheckedChange={() => toggleRole(role.id)}
                        />
                        <span className="min-w-0 flex-1 truncate">{role.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter className="items-center">
          {(selectedUsers.size > 0 || selectedRoles.size > 0) && (
            <div className="mr-auto flex max-w-[60%] flex-wrap gap-1">
              <Badge variant="secondary" className="gap-1">
                <IconUser className="h-3 w-3" />
                {selectedUsers.size}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <IconUsersGroup className="h-3 w-3" />
                {selectedRoles.size}
              </Badge>
            </div>
          )}
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

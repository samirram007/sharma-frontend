// src/features/modules/user/components/assign-role.tsx

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Row } from '@tanstack/react-table'
import type { User } from '../data/schema'
import { CheckCircle, Loader, UserCog } from 'lucide-react'
import type { RoleList } from '../../role/data/schema'
import { Separator } from '@/components/ui/separator'
import { useUserRoleMutation } from '../data/queryOptions'
import React from 'react'
import { cn } from '@/lib/utils'

type Props = {
  row: Row<User>
  roles: RoleList
}

export default function AssignRole({ row, roles }: Props) {
  const user = row.original

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" className="whitespace-nowrap">
          <UserCog className="mr-2 h-4 w-4" />
          Assign Role
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        {roles.map((role) => (
          <React.Fragment key={role.id}>
            <HandleItemClick
              roleId={role.id}
              userId={user.id}
              roleName={role.name}
              isAssigned={!!user.roleIds?.includes(role.id)}
            />
            <Separator />
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type RoleClickProps = {
  roleId: number
  userId: number
  roleName: string
  isAssigned: boolean
}
export function HandleItemClick({
  roleId,
  userId,
  roleName,
  isAssigned,
}: RoleClickProps) {
  const { mutate: userRoleMutate, isPending } = useUserRoleMutation()

  const handleAssignRole = () => {
    const data = { userId, roleId }
    // console.log(data)

    userRoleMutate(data, {
      onSuccess: () => {
        // console.log("Mutation call response -",res?.data)
      },
      onError: () => {
        // console.log(error)
      },
    })
  }

  return (
    <DropdownMenuItem onClick={handleAssignRole}>
      {isPending ? <Loader className="animate-spin h-4 w-4" /> : ''}
      {!isPending && (
        <CheckCircle className={cn("h-4 w-4 text-green-600", isAssigned ? "opacity-100" : "opacity-0")} />
      )}
      {roleName}
    </DropdownMenuItem>
  )
}
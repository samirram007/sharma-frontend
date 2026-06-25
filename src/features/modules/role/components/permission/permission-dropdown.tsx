"use client"

import { MoreHorizontalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePermissionMutation } from "@/features/modules/permission/data/queryOptions";
import type { RolePermission } from "@/features/modules/permission/data/schema";
import { useQueryClient } from "@tanstack/react-query";

type PermissionDropDownProps = {
    rolePermission?: RolePermission;
    appModuleId?: number;
};

export function PermissionDropDown(props: PermissionDropDownProps) {
    const { rolePermission, appModuleId } = props;
    const queryClient = useQueryClient()
    const { mutate: permissionMutate } = usePermissionMutation();
    const handleSelect = (action: boolean) => {
        // console.log(`${action} permission`, rolePermission)
        if (!rolePermission) return;

        permissionMutate({
            ...rolePermission,
            isAllowed: action,
            isEdit: !!rolePermission.id
        }, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['AppModuleFeatures', rolePermission?.roleId, appModuleId] });
                //   console.log("Permission updated successfully");
            }
        })
        // Implement the logic to grant or revoke permission here
    }
    return (
        <>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" aria-label="Open menu" size="icon">
                        <MoreHorizontalIcon />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40" align="end">
                    <DropdownMenuLabel className="text-muted-foreground font-normal">Permission Status</DropdownMenuLabel>
                    <DropdownMenuGroup>
                        <DropdownMenuItem {...(rolePermission?.isAllowed && { disabled: true })} onSelect={() => handleSelect(true)}>
                            Grant
                        </DropdownMenuItem>
                        <DropdownMenuItem {...(!rolePermission?.isAllowed && { disabled: true })} onSelect={() => handleSelect(false)}>
                            Revoke
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>

        </>
    )
}

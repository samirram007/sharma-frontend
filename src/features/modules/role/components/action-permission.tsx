import { Button } from "@/components/ui/button"
import type { Row } from "@tanstack/react-table"
import type { Role } from "../data/schema"

import { Route as RolePermissionRoute } from '@/routes/_protected/administration/_layout/role/_layout/$id/_module/index'

import { useNavigate } from '@tanstack/react-router'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { upperCase } from "lodash"

import { appModuleQueryOptions } from "../../app_module/data/queryOptions"
import { useSuspenseQuery } from "@tanstack/react-query"
import React, { useMemo } from "react"
import RolePermissionProvider from "./permission/contexts/role_permission-context"

import { type AppModule } from '../../app_module/data/schema';
import RolePermissionDialog from "./permission/dialog_index"


interface DataTableRowActionsProps {
    row: Row<Role>
    isModal?: boolean
}

const ActionPermission = (props: DataTableRowActionsProps) => {
    const navigate = useNavigate()
    const { row, isModal } = props
    if (isModal) {
        return <>
            <ModalButton role={row.original} />

        </>
    }

    return (
        // <>Permission</>
        <Button onClick={() => navigate({
            to: RolePermissionRoute.to,
            params: { id: row.original.id! },
        })}>
            Permission
        </Button>
    )
}

export default ActionPermission

const ModalButton = ({ role }: { role: Role }) => {
    const [open, setOpen] = React.useState(false);
    //console.log(role)
    return (
        <>
            <Button onClick={() => { setOpen(true) }} className="space-x-1" size={'sm'} variant={'outline'} title='Role Permission'>
                Permission
            </Button>
            <ModalAction open={open} onOpenChange={setOpen} role={role} />
        </>
    )

}

const ModalAction = ({ open, onOpenChange, role }: { open: boolean, onOpenChange: (open: boolean) => void, role: Role }) => {
    const { data: modulesData } = useSuspenseQuery(appModuleQueryOptions())
    const keyName = 'permissions'
    const modules = useMemo(() => {
        return modulesData.data?.filter((module: AppModule
        ) => module.status === 'active');
    }, [modulesData]);
    console.log("   modules", modules)




    return (
        <Dialog open={open} onOpenChange={onOpenChange}            >
            <DialogContent className='  sm:max-w-lg md:max-w-2xl lg:max-w-5xl xl:max-w-7xl'>
                <DialogHeader className='text-left'>
                    <DialogTitle>Role Permission</DialogTitle>
                    <DialogDescription>
                        Update the role permission here.
                        Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>

                <div className='min-w-[99%] '>
                    <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
                        <div>
                            <h2 className='text-2xl font-bold tracking-tight'>
                                Role: {role?.name}
                            </h2>
                            <p className='text-muted-foreground'>
                                Code: {role ? upperCase(role?.code || '') : 'New Role'}
                            </p>
                        </div>

                    </div>
                    <div className='-mx-4  flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>

                        <RolePermissionProvider>

                            <RolePermissionDialog role={role} modules={modules}
                                key={`${keyName}-role-${role?.id}`} />
                        </RolePermissionProvider>

                    </div>
                </div>
                <DialogFooter className="flex justify-between items-center">
                    {/* //instruction */}
                    <div className='w-full text-muted-foreground text-left'>Select Module here..</div>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )

}


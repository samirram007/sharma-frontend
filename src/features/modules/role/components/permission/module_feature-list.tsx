import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"
import type { AppModule } from "@/features/modules/app_module/data/schema"

import { Link } from "@tanstack/react-router"
import { useMemo } from "react"
import type { Role } from "../../data/schema"
import { useRolePermission } from "./contexts/role_permission-context"

import { Route as RoleModuleFeatureRoute } from '@/routes/_protected/administration/_layout/role/_layout/$id/_module/$moduleid'
interface ModuleProps {
    modules?: AppModule[]
    role?: Role
    isDialog?: boolean
}
const ModuleFeatureList = (props: ModuleProps) => {
    const { setCurrentRow } = useRolePermission()
    const { modules, role, isDialog = false } = props
    const moduleOptions = useMemo(() => {
        return (
            modules?.map((m: { id: number; name: string }) => ({
                label: m.name,
                value: m.id.toString(),
            })) ?? []
        )
    }, [modules])

    const handleOnSelect = (value: string) => {

        const selectedModule = modules?.find((module: any) => module.id.toString() === value)
        if (selectedModule) {
            //   console.log('selectedModule', selectedModule)
            setCurrentRow(selectedModule)
        }
    }


    return (
        <Command className="rounded-md border max-h-[70vh] w-full overflow-hidden shadow-md">
            <CommandInput placeholder="Type a command or search..." />
            <CommandList className=" max-h-full"  >
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Modules">
                    {moduleOptions?.map((module: any) => (
                        <CommandItem key={module.value} className="cursor-pointer" asChild
                            onSelect={() => handleOnSelect(module.value)}
                        >
                            {isDialog ? (
                                <ModuleComponent module={module} handleSelect={handleOnSelect} />
                            ) : (
                                <Link to={RoleModuleFeatureRoute.to} params={{ id: role?.id!, moduleid: module.value }}>{module.label}</Link>
                            )}
                        </CommandItem>
                    ))}

                </CommandGroup>
                <CommandSeparator />

            </CommandList>
        </Command>


    )
}
export default ModuleFeatureList

const ModuleComponent = ({ module, handleSelect }: { module: any, handleSelect: (value: string) => void }) => {
    return (
        <div className="mb-1 cursor-pointer rounded-md p-2 hover:bg-gray-200">
            <div className="text-sm font-semibold" onClick={() => handleSelect(module.value)}>{module.label}</div>

        </div>
    )
}

export { ModuleComponent }

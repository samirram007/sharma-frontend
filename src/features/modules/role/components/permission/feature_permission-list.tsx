import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandItem, CommandList } from "@/components/ui/command"
import type { AppModuleFeature } from "@/features/modules/app_module_feature/data/schema"
import type { RolePermission } from "@/features/modules/permission/data/schema"

import { PermissionDropDown } from "./permission-dropdown"
interface RolePermissionProps {
    data?: AppModuleFeature[],
    roleId?: number,
    moduleId?: number,
}
const FeaturePermissionList = (props: RolePermissionProps) => {

    const { data, roleId } = props

    return (

        <Command className=" max-h-[70vh] w-full overflow-hidden ">
            {/* <CommandInput placeholder="Type a command or search..." /> */}
            <div className="text-xl ">Feature Permissions</div>
            <CommandEmpty>No features found.</CommandEmpty>
            <CommandList className="max-h-full grid grid-cols-[1fr_1fr] gap-4 p-4">
                <CommandEmpty>No results found.</CommandEmpty>
                {data?.map((feature: any) => (
                    <CommandItem key={feature.id}
                        className="cursor-pointer grid grid-cols-[2fr_1fr] gap-4 
                            shadow-md p-2 rounded-md hover:bg-gray-100 mb-6">
                        <div className="text-md font-bold">
                            {feature.code}
                        </div>
                        <div className="flex items-center justify-end gap-4 pr-4">
                            {
                                feature.rolePermission ?
                                    <>

                                        {feature.rolePermission.isAllowed ?
                                            <Badge variant={"outline"}
                                                className=" animate-fade-in duration-500 border-2 border-green-600 text-green-600">Granted</Badge>
                                            :
                                            <Badge variant={"outline"} className=" animate-fade-in duration-500 border-2 border-red-600 text-red-600">Denied</Badge>
                                        }
                                        <PermissionDropDown rolePermission={feature.rolePermission} appModuleId={feature.appModuleId} />
                                    </>
                                    :
                                    <>
                                        <Badge variant={"outline"} className="animate-in-out duration-100 border-2 border-red-600 text-red-600">Not Opted</Badge>
                                        <PermissionDropDown rolePermission={
                                            {
                                                roleId: roleId!,
                                                appModuleFeatureId: feature.id,
                                                isAllowed: false,
                                            } as RolePermission
                                        } appModuleId={feature.appModuleId} />
                                    </>
                            }
                        </div>
                    </CommandItem>
                ))}


            </CommandList>
        </Command>


    )
}
export default FeaturePermissionList

const Feature = ({ module }: { module: any }) => {
    return (
        <div className="mb-1 cursor-pointer rounded-md p-2 hover:bg-gray-200">
            <div className="text-md font-semibold">{module.label}</div>

        </div>
    )
}

export { Feature }

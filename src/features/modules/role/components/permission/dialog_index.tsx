
import ModuleFeatureList from "./module_feature-list"
import FeaturePermissionList from "./feature_permission-list"
import { Suspense } from "react"
import { useRolePermission } from "./contexts/role_permission-context"
import { useSuspenseQuery } from "@tanstack/react-query"
import { appModuleFeatureRoleQueryOptions } from "@/features/modules/app_module_feature/data/queryOptions"
import { Loader } from "lucide-react"

type RolePermissionProps = {
    role: any
    modules: any
}

const RolePermissionDialog = (props: RolePermissionProps) => {


    return (

        <div className="grid grid-cols-[300px_1fr] max-h-[80vh] overflow-hidden gap-4 ">
            <ModuleFeatureList modules={props.modules} role={props.role} isDialog={true} />
            <FeatureSection role={props.role} modules={props.modules} />


        </div>

    )
}

export default RolePermissionDialog

const FeatureSection = ({ role }: RolePermissionProps) => {
    const { currentRow } = useRolePermission()

    return (
        <div className="overflow-y-auto px-4">
            {currentRow ? (
                <Suspense fallback={<Loader className="animate-spin text-green-600" />}>
                    <FeatureListPopulate roleId={role.id} moduleId={currentRow.id!} />
                </Suspense>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500">Select a module to view features</div>
                </div>
            )}
        </div>
    )

}

const FeatureListPopulate = ({ roleId, moduleId }: { roleId: number, moduleId: number }) => {
    const { data: feature } = useSuspenseQuery(appModuleFeatureRoleQueryOptions(roleId, moduleId))
    if (!moduleId) return (
        <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Select a module to view features</div>
        </div>
    )
    if (!feature) return (
        <div className="flex items-center justify-center h-full">
            <Loader className="animate-spin text-green-600" />
        </div>
    )

    if (feature.data.length === 0) return (
        <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">No features available for this module</div>
        </div>
    )

    return (
        <Suspense fallback={<Loader className="animate-spin text-green-600" />}>
            <FeaturePermissionList data={feature?.data} roleId={roleId} moduleId={moduleId} />
        </Suspense>
    )
}

export { FeatureListPopulate }
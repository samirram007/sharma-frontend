import { Outlet } from "@tanstack/react-router"
import ModuleFeatureList from "./module_feature-list"

type RolePermissionProps = {
    role: any
    modules: any
}

const RolePermission = (props: RolePermissionProps) => {


    return (

        <div className="grid grid-cols-[300px_1fr] max-h-[80vh] overflow-hidden gap-4 ">
            <ModuleFeatureList modules={props.modules} role={props.role} />
            <Outlet />
            {/* <FeaturePermissionList /> */}

        </div>

    )
}

export default RolePermission
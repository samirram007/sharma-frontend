
import { Main } from '@/layouts/components/main'





import { useAdministration } from '@/features/masters/administration/context/administration-context'
import { upperCase } from '@/utils/removeEmptyStrings'
import { useEffect } from 'react'
import type { AppModuleFeatureList } from '../app_module_feature/data/schema'
import RolePermission from './components/permission'
import type { Role } from './data/schema'


// Import the correct type for companyListSchema



interface PermissionProps {
    modules?: AppModuleFeatureList
    role?: Role

}

export default function RolePermissionLayout(props: PermissionProps) {
    const { setSideBarOpen, setHeaderVisible } = useAdministration()
    const { modules, role } = props
    const keyName = 'permissions'
    useEffect(() => {
        setSideBarOpen?.(false)
        setHeaderVisible?.(false)
    }, [setSideBarOpen, setHeaderVisible])
    return (

        <>
            <Main className='min-w-[99%]'>
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
                    <RolePermission role={role} modules={modules}
                        key={`${keyName}-role-${role?.id}`} />
                </div>
            </Main>

            {/* <Pages /> */}
        </>
    )
}

import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { useQuery } from "@tanstack/react-query"

import { fetchAppModuleService } from "@/features/modules/app_module/data/api"
import type { UseFormReturn } from "react-hook-form"
import type { AppModuleFeatureForm } from "../../types/types"
import { AppModuleCombobox } from "./app_module-combo-box"




type FormProps = {
    form: UseFormReturn<AppModuleFeatureForm>;
};
const AppModuleForm = (props: FormProps) => {
    const { form } = props as FormProps;
    const { data: appModules, isLoading } = useQuery({
        queryKey: ["appModule"],
        queryFn: () => fetchAppModuleService(),
    })


    // const handleValueChange = (value: string) => {
    //     form.setValue('party.id', Number(value))

    // }
    if (isLoading) {
        return <div>Loading...</div>
    }
    return (
        <>
            <FormField
                control={form.control}
                name={'appModuleId'}
                render={() => (
                    <FormItem className='grid grid-cols-[110px_1fr] gap-1 '>

                        <FormLabel className=' text-right'>
                            Module
                        </FormLabel>
                        <AppModuleCombobox form={form} appModules={appModules?.data} />

                        <FormMessage className=' col-start-3' />


                    </FormItem>
                )}
            />
        </>

    )
}

export default AppModuleForm
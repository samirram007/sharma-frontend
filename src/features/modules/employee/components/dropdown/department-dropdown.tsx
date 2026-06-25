import { SelectDropdown } from "@/components/select-dropdown";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import { useQuery } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";

import { cn } from "@/lib/utils";
import { fetchDepartmentService } from "../../../department/data/api";
import type { Department } from "../../../department/data/schema";
import type { EmployeeForm } from "../../data/schema";

type Props = {
    form: UseFormReturn<EmployeeForm>;
    gapClass?: string;
    rtl?: boolean;
}

const DepartmentDropdown = (props: Props) => {
    const { form, gapClass, rtl } = props

    const { data: departmentList, isLoading } = useQuery({
        queryKey: ["departments"],
        queryFn: fetchDepartmentService,
    });

    //const departmentId = form.watch('departmentId') as string | number | undefined;; // Watch form value for reactivity
    const handleValueChange = (value: string) => {
        form.setValue('departmentId', Number(value));

    };
    if (isLoading) {
        return <div>Loading...</div>;
    }
    return (
        <FormField
            control={form.control}
            name='departmentId'
            render={({ field }) => (
                <FormItem
                    className={cn(
                        'grid grid-cols-[100px_1fr] items-center space-y-0 gap-x-4 gap-y-1',
                        gapClass
                    )}   >
                    <FormLabel className={rtl ? 'order-last' : ''}>
                        Department
                    </FormLabel>
                    <SelectDropdown
                        defaultValue={field.value ? field.value.toString() : ''}
                        onValueChange={(value) => handleValueChange(value)}
                        placeholder='Select a department'
                        className='w-full  '
                        items={departmentList?.data.map((department: Department) => ({
                            label: capitalizeAllWords(department.name),
                            value: String(department.id),
                        }))}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
            )}
        />
    )
}

export default DepartmentDropdown
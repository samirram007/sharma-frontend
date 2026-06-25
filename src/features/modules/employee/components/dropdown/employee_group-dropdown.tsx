import { SelectDropdown } from "@/components/select-dropdown";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import { useQuery } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";

import { cn } from "@/lib/utils";
import { fetchEmployeeGroupService } from "../../../employee_group/data/api";
import type { EmployeeGroup } from "../../../employee_group/data/schema";
import type { EmployeeForm } from "../../data/schema";

type Props = {
    form: UseFormReturn<EmployeeForm>;
    gapClass?: string;
    rtl?: boolean;
}

const EmployeeGroupDropdown = (props: Props) => {
    const { form, gapClass, rtl } = props

    const { data: employeegroupList, isLoading } = useQuery({
        queryKey: ["employeegroups"],
        queryFn: fetchEmployeeGroupService,
    });

    //const employeegroupId = form.watch('employeegroupId') as string | number | undefined;; // Watch form value for reactivity
    const handleValueChange = (value: string) => {
        form.setValue('employeeGroupId', Number(value));

    };
    if (isLoading) {
        return <div>Loading...</div>;
    }
    return (
        <FormField
            control={form.control}
            name='employeeGroupId'
            render={({ field }) => (
                <FormItem
                    className={cn(
                        'grid grid-cols-[100px_1fr] items-center space-y-0 gap-x-4 gap-y-1',
                        gapClass
                    )}   >
                    <FormLabel className={rtl ? 'order-last' : ''}>
                        Employee Group
                    </FormLabel>
                    <SelectDropdown
                        defaultValue={field.value ? field.value.toString() : ''}
                        onValueChange={(value) => handleValueChange(value)}
                        placeholder='Select a employee group'
                        className='w-full  '
                        items={employeegroupList?.data.map((employeegroup: EmployeeGroup) => ({
                            label: capitalizeAllWords(employeegroup.name),
                            value: String(employeegroup.id),
                        }))}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
            )}
        />
    )
}

export default EmployeeGroupDropdown
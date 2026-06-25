import { SelectDropdown } from "@/components/select-dropdown";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import { useQuery } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";

import { cn } from "@/lib/utils";
import { fetchDesignationService } from "../../../designation/data/api";
import type { Designation } from "../../../designation/data/schema";
import type { EmployeeForm } from "../../data/schema";

type Props = {
    form: UseFormReturn<EmployeeForm>;
    gapClass?: string;
    rtl?: boolean;
}

const DesignationDropdown = (props: Props) => {
    const { form, gapClass, rtl } = props

    const { data: designationList, isLoading } = useQuery({
        queryKey: ["designations"],
        queryFn: fetchDesignationService,
    });

    //const designationId = form.watch('designationId') as string | number | undefined;; // Watch form value for reactivity
    const handleValueChange = (value: string) => {
        form.setValue('designationId', Number(value));

    };
    if (isLoading) {
        return <div>Loading...</div>;
    }
    return (
        <FormField
            control={form.control}
            name='designationId'
            render={({ field }) => (
                <FormItem
                    className={cn(
                        'grid grid-cols-[100px_1fr] items-center space-y-0 gap-x-4 gap-y-1',
                        gapClass
                    )}   >
                    <FormLabel className={rtl ? 'order-last' : ''}>
                        Designation
                    </FormLabel>
                    <SelectDropdown
                        defaultValue={field.value ? field.value.toString() : ''}
                        onValueChange={(value) => handleValueChange(value)}
                        placeholder='Select a designation'
                        className='w-full  '
                        items={designationList?.data.map((designation: Designation) => ({
                            label: capitalizeAllWords(designation.name),
                            value: String(designation.id),
                        }))}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
            )}
        />
    )
}

export default DesignationDropdown
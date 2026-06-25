import { SelectDropdown } from "@/components/select-dropdown";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import { useQuery } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";

import { cn } from "@/lib/utils";

import { fetchShiftService } from "@/features/modules/shift/data/api";
import type { Shift } from "@/features/modules/shift/data/schema";
import type { EmployeeForm } from "../../data/schema";

type Props = {
    form: UseFormReturn<EmployeeForm>;
    gapClass?: string;
    rtl?: boolean;
}

const ShiftDropdown = (props: Props) => {
    const { form, gapClass, rtl } = props

    const { data: shiftList, isLoading } = useQuery({
        queryKey: ["shifts"],
        queryFn: fetchShiftService,
    });

    //const shiftId = form.watch('shiftId') as string | number | undefined;; // Watch form value for reactivity
    const handleValueChange = (value: string) => {
        form.setValue('shiftId', Number(value));

    };
    if (isLoading) {
        return <div>Loading...</div>;
    }
    return (
        <FormField
            control={form.control}
            name='shiftId'
            render={({ field }) => (
                <FormItem
                    className={cn(
                        'grid grid-cols-[100px_1fr] items-center space-y-0 gap-x-4 gap-y-1',
                        gapClass
                    )}   >
                    <FormLabel className={rtl ? 'order-last' : ''}>
                        Shift
                    </FormLabel>
                    <SelectDropdown
                        defaultValue={field.value ? field.value.toString() : ''}
                        onValueChange={(value) => handleValueChange(value)}
                        placeholder='Select a shift'
                        className='w-full  '
                        items={shiftList?.data.map((shift: Shift) => ({
                            label: capitalizeAllWords(shift.name),
                            value: String(shift.id),
                        }))}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
            )}
        />
    )
}

export default ShiftDropdown
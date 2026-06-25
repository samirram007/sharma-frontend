import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEnum } from "@/features/enums/api";

import { SelectDropdown } from "@/components/select-dropdown";
import type { UnitType } from "@/features/enums/schema";
import { cn } from "@/lib/utils";
import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import type { UseFormReturn } from "react-hook-form";
import type { StockUnitForm } from "../../data/schema";



type Props = {
    form: UseFormReturn<StockUnitForm>;
    gapClass?: string;
}


const UnitTypeSelect = (props: Props) => {
    const { form, gapClass } = props as Props;
    const { data: unitTypes } = useEnum("unit_type");
    const isEdit = form.getValues('isEdit')
    const handleValueChange = (value: string) => {
        form.setValue('unitType', value as UnitType);

    };
    return (
        <>
            <FormField
                control={form.control}
                name='unitType'
                render={({ field }) => (
                    <FormItem
                        className={cn(
                            'grid grid-cols-[100px_1fr] items-center space-y-0 gap-x-4 gap-y-1',
                            gapClass
                        )} >
                        <FormLabel className='pt-1  '>
                            Unit Type
                        </FormLabel>
                        <div className="w-full flex gap-2 flex-row items-center justify-start  space-y-1">

                            <SelectDropdown
                                defaultValue={field.value ? field.value.toString() : ''}
                                onValueChange={(value) => handleValueChange(value)}
                                placeholder='Select a unit type'
                                className={cn("w-full", isEdit && " cursor-not-allowed")}
                                items={(unitTypes ?? []).map((unitType: string) => ({
                                    label: capitalizeAllWords(unitType),
                                    value: unitType as UnitType,
                                }))}
                                disabled={isEdit}
                            />


                        </div>
                        <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                )}
            />
        </>

    )
}
export default UnitTypeSelect

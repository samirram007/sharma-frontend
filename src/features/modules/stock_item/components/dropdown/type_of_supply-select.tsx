import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEnum } from "@/features/enums/api";

import { SelectDropdown } from "@/components/select-dropdown";
import type { TypeOfSupply, UnitType } from "@/features/enums/schema";
import { cn } from "@/lib/utils";
import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import type { UseFormReturn } from "react-hook-form";
import type { StockItemForm } from "../../data/schema";



type Props = {
    form: UseFormReturn<StockItemForm>;
    gapClass?: string;
}


const TypeOfSupplySelect = (props: Props) => {
    const { form, gapClass } = props as Props;
    const isEdit = form.getValues('isEdit')
    const { data: unitTypes } = useEnum("type_of_supply");
    const handleValueChange = (value: string) => {
        form.setValue('typeOfSupply', value as TypeOfSupply);

    };
    return (
        <>
            <FormField
                control={form.control}
                name='typeOfSupply'
                render={({ field }) => (
                    <FormItem
                        className={cn(
                            'grid grid-cols-[100px_1fr] items-center space-y-0 gap-x-4 gap-y-1',
                            gapClass
                        )} >
                        <FormLabel className='pt-1  '>
                            Supply Type
                        </FormLabel>
                        <div className="w-full flex gap-2 flex-row items-center justify-start  space-y-1">

                            <SelectDropdown
                                defaultValue={field.value ? field.value.toString() : ''}
                                onValueChange={(value) => handleValueChange(value)}
                                placeholder='Select a type of supply'
                                className={cn("w-full", isEdit && " cursor-not-allowed")}
                                items={(unitTypes ?? []).map((unitType: string) => ({
                                    label: capitalizeAllWords(unitType),
                                    value: unitType as UnitType,
                                }))}

                            />


                        </div>
                        <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                )}
            />
        </>

    )
}
export default TypeOfSupplySelect

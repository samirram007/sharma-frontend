import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEnum } from "@/features/enums/api";

import { SelectDropdown } from "@/components/select-dropdown";
import type { QuantityType } from "@/features/enums/schema";
import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import type { UseFormReturn } from "react-hook-form";
import type { UniqueQuantityCodeForm } from "../types/types";


type Props = {
    form: UseFormReturn<UniqueQuantityCodeForm>;
}


const QuantityTypeSelect = (props: Props) => {
    const { form } = props as Props;
    const { data: quantityTypes } = useEnum("quantity_type");
    const handleValueChange = (value: string) => {
        form.setValue('quantityType', value as QuantityType);

    };
    return (
        <>
            <FormField
                control={form.control}
                name='quantityType'
                render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1 '>
                        <FormLabel className='col-span-2 text-right mt-3'>
                            Quantity Type
                        </FormLabel>
                        <div className="w-full flex gap-2 flex-row items-center justify-start col-span-4 space-y-1">

                            <SelectDropdown
                                defaultValue={field.value ? field.value.toString() : ''}
                                onValueChange={(value) => handleValueChange(value)}
                                placeholder='Select a quantity type'
                                className='w-11/12 col-span-6 md:col-span-4'
                                items={(quantityTypes ?? []).map((quantityType: string) => ({
                                    label: capitalizeAllWords(quantityType),
                                    value: quantityType as QuantityType,
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
export default QuantityTypeSelect

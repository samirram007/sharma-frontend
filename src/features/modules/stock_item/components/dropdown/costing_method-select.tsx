import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useEnum } from "@/features/enums/api";

import { SelectDropdown } from "@/components/select-dropdown";
import type { CostingMethod } from "@/features/enums/costing_method";
import { CostingMethodLabelSchema } from "@/features/enums/costing_method";
import { cn } from "@/lib/utils";
import type { UseFormReturn } from "react-hook-form";
import type { StockItemForm } from "../../data/schema";




type Props = {
    form: UseFormReturn<StockItemForm>;
    gapClass?: string;
}


const CostingMethodSelect = (props: Props) => {
    const { form, gapClass } = props as Props;
    const { data: costingMethods } = useEnum("costing_method");
    const isEdit = form.getValues('isEdit')
    const handleValueChange = (value: string) => {
        form.setValue('costingMethod', value as CostingMethod);

    };
    return (
        <>
            <FormField
                control={form.control}
                name='costingMethod'
                render={({ field }) => (
                    <FormItem
                        className={cn(
                            'grid grid-cols-[100px_1fr] items-center space-y-0 gap-x-4 gap-y-1',
                            gapClass
                        )} >
                        <FormLabel className='pt-1  '>
                            Costing Method
                        </FormLabel>
                        <div className="w-full flex gap-2 flex-row items-center justify-start  space-y-1">

                            <SelectDropdown
                                defaultValue={field.value ? field.value.toString() : ''}
                                onValueChange={(value) => handleValueChange(value)}
                                placeholder='Select a costing method'
                                className={cn("w-full", isEdit && " cursor-not-allowed")}
                                items={((costingMethods ?? []) as CostingMethod[])
                                    .map((costingMethod: CostingMethod) => ({
                                        label: CostingMethodLabelSchema.get(costingMethod) ?? costingMethod,
                                        value: costingMethod,
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
export default CostingMethodSelect


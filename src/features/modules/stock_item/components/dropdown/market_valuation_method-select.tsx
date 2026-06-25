
import { useEnum } from "@/features/enums/api";

import { SelectDropdown } from "@/components/select-dropdown";

import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MarketValuationMethodLabelSchema, type MarketValuationMethod, } from "@/features/enums/market_valuation_method";
import { cn } from "@/lib/utils";
import type { UseFormReturn } from "react-hook-form";
import type { StockItemForm } from "../../data/schema";




type Props = {
    form: UseFormReturn<StockItemForm>;
    gapClass?: string;
}


const MarketValuationMethodSelect = (props: Props) => {
    const { form, gapClass } = props as Props;
    const { data: marketValuationMethods } = useEnum("market_valuation_method");
    const isEdit = form.getValues('isEdit')
    const handleValueChange = (value: string) => {
        form.setValue('marketValuationMethod', value as MarketValuationMethod);

    };
    return (
        <>
            <FormField
                control={form.control}
                name='marketValuationMethod'
                render={({ field }) => (
                    <FormItem
                        className={cn(
                            'grid grid-cols-[100px_1fr] items-center space-y-0 gap-x-4 gap-y-1',
                            gapClass
                        )} >
                        <FormLabel className='pt-1  '>
                            Market Valuation Method
                        </FormLabel>
                        <div className="w-full flex gap-2 flex-row items-center justify-start  space-y-1">

                            <SelectDropdown
                                defaultValue={field.value ? field.value.toString() : ''}
                                onValueChange={(value) => handleValueChange(value)}
                                placeholder='Select a valuation method'
                                className={cn("w-full", isEdit && " cursor-not-allowed")}
                                items={((marketValuationMethods ?? []) as MarketValuationMethod[])
                                    .map((marketValuationMethod: MarketValuationMethod) => ({
                                        label: MarketValuationMethodLabelSchema.get(marketValuationMethod) ?? marketValuationMethod,
                                        value: marketValuationMethod,
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
export default MarketValuationMethodSelect


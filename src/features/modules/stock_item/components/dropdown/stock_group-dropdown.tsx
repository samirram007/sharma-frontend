import { SelectDropdown } from "@/components/select-dropdown";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import { useQuery } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";

import { fetchStockGroupService } from "@/features/modules/stock_group/data/api";
import { cn } from "@/lib/utils";
import type { Country } from "../../../country/data/schema";
import type { StockItemForm } from "../../data/schema";

type Props = {
    form: UseFormReturn<StockItemForm>;
    gapClass?: string;
}

const StockGroupDropdown = (props: Props) => {
    const { form, gapClass } = props
    const isEdit = form.getValues('isEdit')
    const { data: stockGroupList, isLoading } = useQuery({
        queryKey: ["stock_groups"],
        queryFn: fetchStockGroupService,
    });

    //const stockGroupId = form.watch('stockGroupId') as string | number | undefined;; // Watch form value for reactivity
    const handleValueChange = (value: string) => {
        form.setValue('stockGroupId', Number(value));

    };
    if (isLoading) {
        return <div>Loading...</div>;
    }
    return (
        <FormField
            control={form.control}
            name='stockGroupId'
            render={({ field }) => (
                <FormItem
                    className={cn(
                        'grid grid-cols-[100px_1fr] items-center space-y-0 gap-x-4 gap-y-1',
                        gapClass
                    )} >
                    <FormLabel className='pt-1  '>
                        Under
                    </FormLabel>
                    <SelectDropdown
                        defaultValue={field.value ? field.value.toString() : ''}
                        onValueChange={(value) => handleValueChange(value)}
                        placeholder='Select a stock group'
                        className={cn("w-full", isEdit && " cursor-not-allowed")}
                        items={stockGroupList?.data.map((stockGroup: Country) => ({
                            label: capitalizeAllWords(stockGroup.name),
                            value: String(stockGroup.id),
                        }))}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
            )}
        />
    )
}

export default StockGroupDropdown
import { SelectDropdown } from "@/components/select-dropdown";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import { useQuery } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";

import { fetchStockCategoryService } from "@/features/modules/stock_category/data/api";
import { cn } from "@/lib/utils";
import type { Currency } from "../../../currency/data/schema";
import type { StockItemForm } from "../../data/schema";

type Props = {
    form: UseFormReturn<StockItemForm>;
    gapClass?: string;
}

const StockCategoryDropdown = (props: Props) => {
    const { form, gapClass } = props
    const isEdit = form.getValues('isEdit')
    const { data: stockCategoryList, isLoading } = useQuery({
        queryKey: ["stock_categories"],
        queryFn: fetchStockCategoryService,
    });

    //const currencyId = form.watch('currencyId') as string | number | undefined;; // Watch form value for reactivity
    const handleValueChange = (value: string) => {
        form.setValue('stockCategoryId', Number(value));

    };
    if (isLoading) {
        return <div>Loading...</div>;
    }
    return (
        <FormField
            control={form.control}
            name='stockCategoryId'
            render={({ field }) => (
                <FormItem
                    className={cn(
                        'grid grid-cols-[100px_1fr] items-center space-y-0 gap-x-4 gap-y-1',
                        gapClass
                    )} >
                    <FormLabel className='pt-1  '>
                        Category
                    </FormLabel>
                    <SelectDropdown
                        defaultValue={field.value ? field.value.toString() : ''}
                        onValueChange={(value) => handleValueChange(value)}
                        placeholder='Select a stock category'
                        className={cn("w-full", isEdit && " cursor-not-allowed")}
                        items={stockCategoryList?.data.map((stockCategory: Currency) => ({
                            label: capitalizeAllWords(stockCategory.name),
                            value: String(stockCategory.id),
                        }))}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
            )}
        />
    )
}

export default StockCategoryDropdown
import { SelectDropdown } from "@/components/select-dropdown";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import { useQuery } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";

import { fetchStockCategoryService } from "../data/api";
import type { StockCategory } from "../data/schema";
import type { StockCategoryForm } from "../types/types";



type Props = {
    form: UseFormReturn<StockCategoryForm>;
};
const StockCategoryDropdown = (props: Props) => {
    const { form } = props as Props;
    const { data: StockCategoryList, isLoading } = useQuery({
        queryKey: ["StockCategories"],
        queryFn: fetchStockCategoryService,
    });

    //  const parentId = form.watch('parentId') as string | number | undefined;; // Watch form value for reactivity
    // const stockCategory: StockCategory | null = useMemo(() => {
    //     if (!StockCategoryList?.data) return null;
    //     return StockCategoryList.data.find((group: StockCategory) => group.id === Number(parentId)) || null;
    // }, [parentId, StockCategoryList?.data]);

    const handleValueChange = (value: string) => {
        form.setValue('parentId', Number(value));

    };
    if (isLoading) {
        return <div>Loading...</div>;
    }
    return (
        <>
            <FormField
                control={form.control}
                name='parentId'
                render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1 '>
                        <FormLabel className='col-span-2 text-right mt-3'>
                            Parent Category
                        </FormLabel>
                        <div className="w-full flex gap-2 flex-row items-center justify-start col-span-4 space-y-1">

                            <SelectDropdown
                                defaultValue={field.value ? field.value.toString() : ''}
                                onValueChange={(value) => handleValueChange(value)}
                                placeholder='Select a voucher category'
                                className='w-11/12 col-span-6 md:col-span-4'
                                items={StockCategoryList?.data.map((stockCategory: StockCategory) => ({
                                    label: capitalizeAllWords(stockCategory.name),
                                    value: String(stockCategory.id),
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

export default StockCategoryDropdown
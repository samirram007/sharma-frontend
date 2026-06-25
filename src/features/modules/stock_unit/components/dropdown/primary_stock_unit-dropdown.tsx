import { SelectDropdown } from "@/components/select-dropdown";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";

import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import { useQuery } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";

import { cn } from "@/lib/utils";
import { fetchStockUnitService } from "../../data/api";
import type { StockUnit, StockUnitForm } from "../../data/schema";




type Props = {
    form: UseFormReturn<StockUnitForm>;
    gapClass?: string
};
const PrimaryStockUnitDropdown = (props: Props) => {
    const { form, gapClass } = props as Props;
    const { data: StockUnitList, isLoading } = useQuery({
        queryKey: ["stockUnits"],
        queryFn: fetchStockUnitService,
    });

    //  const parentId = form.watch('parentId') as string | number | undefined;; // Watch form value for reactivity
    // const stockUnit: StockUnit | null = useMemo(() => {
    //     if (!StockUnitList?.data) return null;
    //     return StockUnitList.data.find((group: StockUnit) => group.id === Number(parentId)) || null;
    // }, [parentId, StockUnitList?.data]);

    const handleValueChange = (value: string) => {
        form.setValue('primaryStockUnitId', Number(value));
        const primaryStockUnit = StockUnitList?.data.find((item: StockUnit) => item.id === Number(value))
        form.setValue('primaryStockUnit', primaryStockUnit || null)
    };
    if (isLoading) {
        return <div>Loading...</div>;
    }
    return (
        <>
            <FormField
                control={form.control}
                name='primaryStockUnitId'
                render={({ field }) => (

                    <FormItem
                        className={cn(
                            'lex items-start space-y-0 gap-x-4 gap-y-1 ',
                            gapClass
                        )} >
                        <div className="w-full flex gap-2 flex-row items-center justify-start  space-y-1 pr-2">

                            <SelectDropdown
                                defaultValue={field.value ? field.value.toString() : ''}
                                onValueChange={(value) => handleValueChange(value)}
                                placeholder='Select a first unit'
                                className='w-full  '
                                items={StockUnitList?.data.map((stockUnit: StockUnit) => ({
                                    label: capitalizeAllWords(stockUnit.name),
                                    value: String(stockUnit.id),
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

export default PrimaryStockUnitDropdown
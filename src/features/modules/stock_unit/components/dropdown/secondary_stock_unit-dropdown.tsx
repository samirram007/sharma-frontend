import { SelectDropdown } from "@/components/select-dropdown";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";

import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import { useQuery } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";

import { fetchStockUnitService } from "../../data/api";
import type { StockUnit, StockUnitForm } from "../../data/schema";




type Props = {
    form: UseFormReturn<StockUnitForm>;
};
const SecondaryStockUnitDropdown = (props: Props) => {
    const { form } = props as Props;
    const { data: StockUnitList, isLoading } = useQuery({
        queryKey: ["stockUnits"],
        queryFn: fetchStockUnitService,
    });


    const handleValueChange = (value: string) => {
        form.setValue('secondaryStockUnitId', Number(value));
        const secondaryStockUnit = StockUnitList?.data.find((item: StockUnit) => item.id === Number(value))
        form.setValue('secondaryStockUnit', secondaryStockUnit || null)

    };
    if (isLoading) {
        return <div>Loading...</div>;
    }
    return (
        <>
            <FormField
                control={form.control}
                name='secondaryStockUnitId'
                render={({ field }) => (
                    <FormItem className='flex items-start space-y-0 gap-x-4 gap-y-1 '>

                        <div className="w-full flex flex-row items-center justify-start  space-y-1">

                            <SelectDropdown
                                defaultValue={field.value ? field.value.toString() : ''}
                                onValueChange={(value) => handleValueChange(value)}
                                placeholder='Select a second unit'
                                className='w-full '
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

export default SecondaryStockUnitDropdown
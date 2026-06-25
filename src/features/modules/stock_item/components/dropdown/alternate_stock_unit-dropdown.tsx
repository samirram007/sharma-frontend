import { SelectDropdown } from "@/components/select-dropdown";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import { useQuery } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";

import { fetchStockUnitService } from "@/features/modules/stock_unit/data/api";
import type { StockUnit } from "@/features/modules/stock_unit/data/schema";
import { cn } from "@/lib/utils";
import type { State } from "../../../state/data/schema";
import type { StockItemForm } from "../../data/schema";

type Props = {
    form: UseFormReturn<StockItemForm>;
    gapClass?: string;
    config: { key: string; value: boolean }[];
}

const AlternateStockUnitDropdown = (props: Props) => {
    const { form, gapClass } = props

    const isEdit = form.getValues('isEdit')

    const { data: StockUnitList, isLoading } = useQuery({
        queryKey: ["stockUnits"],
        queryFn: fetchStockUnitService,
    });

    //const stateId = form.watch('stateId') as string | number | undefined;; // Watch form value for reactivity

    const handleValueChange = (value: string) => {
        if (value === "null") {
            form.setValue("alternateStockUnitId", null);
            form.setValue("alternateStockUnit", null)
        } else {
            form.setValue("alternateStockUnitId", Number(value));
            const alternateStockUnit = StockUnitList?.data.find((item: StockUnit) => item.id === Number(value))
            form.setValue("alternateStockUnit", alternateStockUnit)
        }
    };
    if (isLoading) {
        return <div>Loading...</div>;
    }
    return (
        <FormField
            control={form.control}
            name='alternateStockUnitId'
            render={({ field }) => (
                <FormItem
                    className={cn(
                        'grid grid-cols-[100px_1fr] items-center space-y-0 gap-x-4 gap-y-1',
                        gapClass
                    )} >
                    <FormLabel className='pt-1  '>
                        Alternate Units
                    </FormLabel>
                    <SelectDropdown
                        defaultValue={field.value ? field.value.toString() : ''}
                        onValueChange={(value) => handleValueChange(value)}
                        placeholder='Select an alternate unit'
                        className={cn("w-full", isEdit && " cursor-not-allowed")}
                        items={[
                            ...(StockUnitList?.data.map((stockUnit: State) => ({
                                label: capitalizeAllWords(stockUnit.name),
                                value: String(stockUnit.id),
                            })) ?? []),
                            {
                                label: "— None —",
                                value: "null", // or "null"
                            },
                        ]}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
            )}
        />
    )
}

export default AlternateStockUnitDropdown
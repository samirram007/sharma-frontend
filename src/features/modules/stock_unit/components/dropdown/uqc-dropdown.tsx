import { SelectDropdown } from "@/components/select-dropdown";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { upperCase } from "@/utils/removeEmptyStrings";
import { useQuery } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";

import { fetchUniqueQuantityCodeService } from "@/features/modules/unique_quantity_code/data/api";
import type { UniqueQuantityCode } from "@/features/modules/unique_quantity_code/data/schema";
import { cn } from "@/lib/utils";
import type { StockUnitForm } from "../../data/schema";


type Props = {
    form: UseFormReturn<StockUnitForm>;
    gapClass?: string;
}

const UqcDropdown = (props: Props) => {
    const { form, gapClass } = props

    const { data: uqcList, isLoading } = useQuery({
        queryKey: ["UniqueQuantityCodes"],
        queryFn: fetchUniqueQuantityCodeService,
    });

    //const stateId = form.watch('stateId') as string | number | undefined;; // Watch form value for reactivity
    const handleValueChange = (value: string) => {
        form.setValue('uniqueQuantityCodeId', Number(value));

    };
    if (isLoading) {
        return <div>Loading...</div>;
    }
    return (
        <FormField
            control={form.control}
            name='uniqueQuantityCodeId'
            render={({ field }) => (

                <FormItem
                    className={cn(
                        'grid grid-cols-[100px_1fr] items-center space-y-0 gap-x-4 gap-y-1',
                        gapClass
                    )} >
                    <FormLabel className=' text-right'>
                        UQC
                    </FormLabel>
                    <SelectDropdown
                        defaultValue={field.value ? field.value.toString() : ''}
                        onValueChange={(value) => handleValueChange(value)}
                        placeholder='Select a UQC'
                        className='w-full '
                        items={uqcList?.data.map((uqc: UniqueQuantityCode) => ({
                            label: (upperCase(uqc.code) + ' - ' + upperCase(uqc.name)),
                            value: String(uqc.id),
                        }))}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
            )}
        />
    )
}

export default UqcDropdown
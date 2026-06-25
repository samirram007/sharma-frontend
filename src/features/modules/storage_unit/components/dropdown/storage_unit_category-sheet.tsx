
import { capitalizeAllWords } from "@/utils/removeEmptyStrings";

import type { UseFormReturn } from "react-hook-form";


import type { StorageUnitForm } from "../../data/schema";

import { InputSheet } from "./input-sheet";

import { useEnum } from "@/features/enums/api";


import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { cn } from "@/lib/utils";


type Props = {
    form: UseFormReturn<StorageUnitForm>;
    gapClass?: string;
    rtl?: boolean;
}

const StorageUnitCategorySheet = (props: Props) => {
    const { form, gapClass, rtl } = props
    const name = "storageUnitCategory"

    const { data: storageUnitCategories } = useEnum("storage_unit_category");
    //const storageunitCategoryId = form.watch('storageunitCategoryId') as string | number | undefined;; // Watch form value for reactivity
    const handleValueChange = (value: string) => {
        form.setValue(name, value);

    };
    const frameworks = storageUnitCategories?.map((storageUnitCategory: string) => ({
        label: capitalizeAllWords(storageUnitCategory),
        value: storageUnitCategory,
    })) ?? [];

    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className={cn('grid grid-cols-[100px_1fr] items-center space-y-0 gap-x-4 gap-y-1', gapClass)}>
                    <FormLabel className='   '>
                        {'Storage Category'}
                    </FormLabel>
                    <FormControl>

                        <InputSheet form={form}
                            name={name}
                            defaultValue={field.value ? field.value.toString() : ''}
                            gapClass={gapClass} rtl={rtl} frameworks={frameworks}
                            handleValueChange={(value) => handleValueChange(value)} />
                    </FormControl>
                </FormItem>
            )}
        />

    )
}

export default StorageUnitCategorySheet
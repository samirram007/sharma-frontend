import { SelectDropdown } from "@/components/select-dropdown";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import type { UseFormReturn } from "react-hook-form";
import type { DeliveryPlaceForm, PlaceType } from "../data/schema";
import { cn } from "@/lib/utils";
import { placeTypes } from "../data/data";


type Props = {
    form: UseFormReturn<DeliveryPlaceForm>;
    gapClass?: string;
}


const PlaceTypeDropdown = (props: Props) => {
    const { form, gapClass } = props
    const placeTypeOptions: PlaceType[] = placeTypes;
    return (
        <FormField
            control={form.control}
            name='placeType'
            render={({ field }) => (
                <FormItem className={cn(gapClass ? gapClass : 'grid grid-cols-2 items-center space-y-0 gap-x-4 gap-y-1')}>
                    <FormLabel className='text-right'>
                        Place Type
                    </FormLabel>
                    <SelectDropdown
                        defaultValue={field.value ? field.value.toString() : ''}
                        onValueChange={(val) => field.onChange(val)}
                        placeholder='Select a place type'
                        className='w-full'
                        items={placeTypeOptions.map((value) => ({
                            label: capitalizeAllWords(value),
                            value,
                        }))}
                    />
                    <FormMessage className='w-full' />
                </FormItem>
            )}
        />
    )
}

export default PlaceTypeDropdown
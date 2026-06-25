import { SelectDropdown } from "@/components/select-dropdown";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import { useQuery } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";

import type { DeliveryRouteForm } from "../data/schema";
import { capitalizeWords } from '../../../../utils/removeEmptyStrings';
import { fetchGodownService } from "../../godown/data/api";
import type { Godown } from "../../godown/data/schema";



type Props = {
    form: UseFormReturn<DeliveryRouteForm>;
    name: keyof DeliveryRouteForm;
    gapClass?: string;

};
const SourcePlaceDropdown = (props: Props) => {
    const { form, name } = props as Props;
    const { data: godownList, isLoading } = useQuery({
        queryKey: ["godowns"],
        queryFn: fetchGodownService,
    });

    // const placeId = form.watch(name) as string | number | undefined; // Watch  
    const handleValueChange = (value: string) => {
        form.setValue(name, Number(value));

    };
    if (isLoading) {
        return <div>Loading...</div>;
    }
    return (
        <>
            <FormField
                control={form.control}
                name={name}
                render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1 '>
                        <FormLabel className='col-span-2 text-right mt-3'>
                            {capitalizeWords(name === 'sourcePlaceId' ? 'Source Place' : 'Destination Place')}
                        </FormLabel>
                        <div className="w-full col-span-4 space-y-1">

                            <SelectDropdown
                                defaultValue={field.value ? field.value.toString() : ''}
                                onValueChange={(value) => handleValueChange(value)}
                                placeholder={`Select a ${capitalizeWords(name === 'sourcePlaceId' ? 'Source Place' : 'Destination Place')}`}
                                className='w-full col-span-6 md:col-span-4'
                                items={godownList?.data?.map((godown: Godown) => ({
                                    label: capitalizeAllWords(godown.name),
                                    value: String(godown.id),
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

export default SourcePlaceDropdown;
import { SelectDropdown } from "@/components/select-dropdown";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import { useQuery } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";

import type { DeliveryRouteForm } from "../data/schema";
import { fetchDeliveryPlaceService } from "../../delivery_place/data/api";
import type { DeliveryPlace } from "../../delivery_place/data/schema";
import { capitalizeWords } from '../../../../utils/removeEmptyStrings';



type Props = {
    form: UseFormReturn<DeliveryRouteForm>;
    name: keyof DeliveryRouteForm;
    gapClass?: string;

};
const DestinationPlaceDropdown = (props: Props) => {
    const { form, name } = props as Props;
    const { data: deliveryPlaceList, isLoading } = useQuery({
        queryKey: ["deliveryPlaces"],
        queryFn: fetchDeliveryPlaceService,
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
                                items={deliveryPlaceList?.data?.map((deliveryPlace: DeliveryPlace) => ({
                                    label: capitalizeAllWords(deliveryPlace.name),
                                    value: String(deliveryPlace.id),
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

export default DestinationPlaceDropdown;
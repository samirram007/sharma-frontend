import { SelectDropdown } from "@/components/select-dropdown";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import { useQuery } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";

import type { DeliveryRouteForm } from "../data/schema";
import { capitalizeWords } from '../../../../utils/removeEmptyStrings';

import { fetchTransporterService } from "../../transporter/data/api";
import type { Transporter } from "../../transporter/data/schema";



type Props = {
    form: UseFormReturn<DeliveryRouteForm>;
    name: keyof DeliveryRouteForm;
    label: string;
    gapClass?: string;

};
const TransporterDropdown = (props: Props) => {
    const { form, name, label, gapClass } = props as Props;
    const { data: transporters, isLoading } = useQuery({
        queryKey: ["transporters"],
        queryFn: fetchTransporterService,
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
                    <FormItem className={` items-center space-y-0 gap-x-4 gap-y-1 ${gapClass ?? ''}`}>
                        <FormLabel className=' text-right '>
                            {label}
                        </FormLabel>
                        <div className={`w-full   ${gapClass ?? ''}`}>

                            <SelectDropdown
                                defaultValue={field.value ? field.value.toString() : ''}
                                onValueChange={(value) => handleValueChange(value)}
                                placeholder={`Select a ${capitalizeWords(label)}`}
                                className='w-full col-span-6 md:col-span-4'
                                items={transporters?.data?.map((transporter: Transporter) => ({
                                    label: capitalizeAllWords(transporter.name),
                                    value: String(transporter.id),
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

export default TransporterDropdown;
import { SelectDropdown } from "@/components/select-dropdown";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import type { UseFormReturn } from "react-hook-form";
import { DeliveryVehicleTypes, type DeliveryVehicleForm, type DeliveryVehicleType } from "../data/schema";
import { cn } from "@/lib/utils";



type Props = {
    form: UseFormReturn<DeliveryVehicleForm>;
    gapClass?: string;
}


const DeliveryVehicleTypeDropdown = (props: Props) => {
    const { form, gapClass } = props
    const deliveryVehicleTypeOptions: readonly DeliveryVehicleType[] = DeliveryVehicleTypes;
    return (
        <FormField
            control={form.control}
            name='vehicleType'
            render={({ field }) => (
                <FormItem className={cn(gapClass ? gapClass : 'grid grid-cols-2 items-center space-y-0 gap-x-4 gap-y-1')}>
                    <FormLabel className='text-right'>
                        Delivery Vehicle Type
                    </FormLabel>
                    <SelectDropdown
                        defaultValue={field.value ? field.value.toString() : ''}
                        onValueChange={(val) => field.onChange(val)}
                        placeholder='Select a delivery vehicle type'
                        className='w-full'
                        items={deliveryVehicleTypeOptions.map((value) => ({
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

export default DeliveryVehicleTypeDropdown
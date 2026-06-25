import { SelectDropdown } from "@/components/select-dropdown";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import { useQuery } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";

import { cn } from "@/lib/utils";
import { fetchCountryService } from "../../../country/data/api";
import type { Country } from "../../../country/data/schema";
import type { DistributorForm } from "../../data/schema";

type Props = {
    form: UseFormReturn<DistributorForm>;
    gapClass?: string;
    rtl?: boolean;

}

const CountryDropdown = (props: Props) => {
    const { form, gapClass, rtl } = props

    const { data: countryList, isLoading } = useQuery({
        queryKey: ["countries"],
        queryFn: fetchCountryService,
    });

    //const countryId = form.watch('countryId') as string | number | undefined;; // Watch form value for reactivity
    const handleValueChange = (value: string) => {
        form.setValue('address.countryId', Number(value));

    };
    if (isLoading) {
        return <div>Loading...</div>;
    }
    return (
        <FormField
            control={form.control}
            name='address.countryId'
            render={({ field }) => (
                <FormItem
                    className={cn(
                        'grid grid-cols-[100px_1fr] items-center space-y-0 gap-x-4 gap-y-1',
                        gapClass
                    )}   >
                    <FormLabel className={rtl ? 'order-last' : ''}>
                        Country
                    </FormLabel>
                    <SelectDropdown
                        defaultValue={field.value ? field.value.toString() : ''}
                        onValueChange={(value) => handleValueChange(value)}
                        placeholder='Select a country'
                        className='w-full placeholder'
                        items={countryList?.data.map((country: Country) => ({
                            label: capitalizeAllWords(country.name),
                            value: String(country.id),
                        }))}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
            )}
        />
    )
}

export default CountryDropdown
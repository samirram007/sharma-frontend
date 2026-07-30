import { SelectDropdown } from "@/components/select-dropdown";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import { useQuery } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";

import { fetchCountryService } from "../../country/data/api";
import type { Country } from "../../country/data/schema";
import type { StateForm } from "../data/schema";

type Props = {
    form: UseFormReturn<StateForm>;
    gapClass?: string;
}

const CountryDropdown = (props: Props) => {
    const { form, gapClass } = props

    const { data: countryList, isLoading } = useQuery({
        queryKey: ["countries"],
        queryFn: fetchCountryService,
    });

    // const countryId = form.watch('countryId') as string | number | undefined;; // Watch form value for reactivity
    const handleValueChange = (value: string) => {
        form.setValue('countryId', Number(value));

    };
    if (isLoading) {
        return <div>Loading...</div>;
    }
    return (
        <FormField
            control={form.control}
            name='countryId'
            render={({ field }) => (
                <FormItem className={gapClass ?? 'grid grid-cols-1 items-start space-y-0 gap-x-4 gap-y-2 sm:grid-cols-[160px_1fr] sm:items-center sm:gap-y-1'}>
                    <FormLabel>
                        Country
                    </FormLabel>
                    <SelectDropdown
                        defaultValue={field.value ? field.value.toString() : ''}
                        onValueChange={(value) => handleValueChange(value)}
                        placeholder='Select a country'
                        className='w-full'
                        useSheet
                        sheetTitle='Select Country'
                        items={countryList?.data.map((country: Country) => ({
                            label: capitalizeAllWords(country.name),
                            value: String(country.id),
                        }))}
                    />
                    <FormMessage className='sm:col-start-2' />
                </FormItem>
            )}
        />
    )
}

export default CountryDropdown
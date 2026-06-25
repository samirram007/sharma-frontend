
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";

import { cn } from "@/lib/utils";

import type { Country } from "../../../country/data/schema";
import { countryQueryOptions } from "@/features/modules/country/data/queryOptions";

import { InputSheet } from "./input-sheet";
import type { AddressForm } from "@/features/modules/address/data/schema";
import { useEffect } from "react";

type Props = {
    form: UseFormReturn<AddressForm>;
    gapClass?: string;
    rtl?: boolean;

}

const CountrySheet = (props: Props) => {
    const { form, gapClass, rtl } = props

    const { data: countryList } = useSuspenseQuery(countryQueryOptions())

    //const countryId = form.watch('countryId') as string | number | undefined;; // Watch form value for reactivity
    const stateId = form.watch('stateId')
    const handleValueChange = (value: string) => {
        form.setValue('countryId', Number(value));

    };
    const frameworks = countryList?.data.map((country: Country) => ({
        label: capitalizeAllWords(country.name),
        value: String(country.id),
    })) ?? []

    useEffect(() => {
        if (stateId === undefined) {
            form.setValue('countryId', undefined);
        }
    }, [stateId])


    return (
        <FormField
            control={form.control}
            name='countryId'
            render={({ field }) => (
                <FormItem
                    className={cn(
                        'grid grid-cols-[100px_1fr] items-center space-y-0 gap-x-4 gap-y-1',
                        gapClass
                    )}   >
                    <FormLabel className={rtl ? 'order-last' : ''}>
                        Country
                    </FormLabel>
                    <InputSheet form={form}
                        name='countryId'
                        defaultValue={field.value ? field.value.toString() : ''}
                        gapClass={gapClass} rtl={rtl} frameworks={frameworks}
                        handleValueChange={(value) => handleValueChange(value)}
                        placeHolder="-- Country --"
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
            )}
        />
    )
}

export default CountrySheet
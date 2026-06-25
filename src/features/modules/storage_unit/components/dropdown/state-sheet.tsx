import {
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { capitalizeAllWords } from '@/utils/removeEmptyStrings'
import { useSuspenseQuery } from '@tanstack/react-query'
import type { UseFormReturn } from 'react-hook-form'

import { cn } from '@/lib/utils'

import type { State } from '@/features/modules/state/data/schema'
import { stateQueryOptions } from '@/features/modules/state/data/queryOptions'
import { InputSheet } from './input-sheet'
import type { AddressForm } from '@/features/modules/address/data/schema'

type Props = {
    form: UseFormReturn<AddressForm>
    gapClass?: string
    rtl?: boolean
}

const StateSheet = (props: Props) => {
    const { form, gapClass, rtl } = props

    const { data: stateList } = useSuspenseQuery(stateQueryOptions())

    //const stateId = form.watch('stateId') as string | number | undefined;; // Watch form value for reactivity
    const handleValueChange = (value: string) => {
        form.setValue('stateId', Number(value))
        const selectedState = stateList?.data.find((state: State) => state.id === Number(value))
        if (selectedState?.countryId) {
            //   console.log(selectedState)
            form.setValue('countryId', selectedState.countryId)
        }
    }

    const frameworks = stateList?.data.map((state: State) => ({
        label: capitalizeAllWords(state.name),
        value: String(state.id),
    })) ?? []

    return (
        <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
                <FormItem
                    className={cn(
                        'grid grid-cols-[100px_1fr] items-center space-y-0 gap-x-4 gap-y-1',
                        gapClass,
                    )}
                >
                    <FormLabel className={rtl ? 'order-last' : ''}>State</FormLabel>
                    <InputSheet
                        form={form}
                        name={`stateId`}
                        defaultValue={field.value ? field.value.toString() : ''}
                        gapClass={gapClass}
                        rtl={rtl}
                        frameworks={frameworks}
                        handleValueChange={(value) => handleValueChange(value)}
                        placeHolder='-- State --'
                    />
                    <FormMessage className="col-span-4 col-start-3" />
                </FormItem>
            )}
        />
    )
}

export default StateSheet
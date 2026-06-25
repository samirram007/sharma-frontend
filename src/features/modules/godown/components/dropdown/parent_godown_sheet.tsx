
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from '@/components/ui/form'
import { capitalizeAllWords } from '@/utils/removeEmptyStrings'
import { useSuspenseQuery } from '@tanstack/react-query'
import type { UseFormReturn } from 'react-hook-form'





import { cn } from '@/lib/utils'
import type { Godown, GodownForm } from '../../data/schema'
import { godownQueryOptions } from '../../data/queryOptions'
import { InputSheet } from './input-sheet'



type Props = {
    form: UseFormReturn<GodownForm>
    gapClass?: string
    rtl?: boolean
}

const ParentStorageUnitSheet = (props: Props) => {
    const { form, gapClass, rtl } = props
    const name = "parentId"
    const { data: godowns } = useSuspenseQuery(godownQueryOptions())

    // console.log(storageUnits)
    //const countryId = form.watch('countryId') as string | number | undefined;; // Watch form value for reactivity
    const handleValueChange = (value: string) => {
        form.setValue(name, Number(value))
    }


    const frameworks = [
        { label: '-- Parent --', value: '' },
        ...(godowns.data?.map((godown: Godown) => ({
            label: capitalizeAllWords(godown.name),
            value: String(godown.id),
        })) ?? []),
    ];


    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className={cn('grid grid-cols-[100px_1fr] items-center space-y-0 gap-x-4 gap-y-1', gapClass)}>
                    <FormLabel className='   '>
                        {'Under'}
                    </FormLabel>
                    <FormControl>

                        <InputSheet form={form}
                            name={name}
                            placeHolder="-- Parent --"
                            defaultValue={field.value ? field.value.toString() : ''}
                            gapClass={gapClass} rtl={rtl} frameworks={frameworks}
                            handleValueChange={(value) => handleValueChange(value)} />
                    </FormControl>
                </FormItem>
            )}
        />
    )
}

export default ParentStorageUnitSheet
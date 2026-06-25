
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from '@/components/ui/form'
import { capitalizeAllWords } from '@/utils/removeEmptyStrings'
import { useSuspenseQuery } from '@tanstack/react-query'
import type { UseFormReturn } from 'react-hook-form'


import type { StorageUnit, StorageUnitForm } from '../../data/schema'


import { InputSheet } from './input-sheet'
import { storageUnitQueryOptions } from '../../data/queryOptions'
import { cn } from '@/lib/utils'



type Props = {
    form: UseFormReturn<StorageUnitForm>
    gapClass?: string
    rtl?: boolean
}

const ParentStorageUnitSheet = (props: Props) => {
    const { form, gapClass, rtl } = props
    const name = "parentId"
    const { data: storageUnits } = useSuspenseQuery(storageUnitQueryOptions())

    // console.log(storageUnits)
    //const countryId = form.watch('countryId') as string | number | undefined;; // Watch form value for reactivity
    const handleValueChange = (value: string) => {
        form.setValue(name, Number(value))
    }


    const frameworks = [
        { label: '-- Parent --', value: '' },
        ...(storageUnits.data?.map((storageUnit: StorageUnit) => ({
            label: capitalizeAllWords(storageUnit.name),
            value: String(storageUnit.id),
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
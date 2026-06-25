import { SelectDropdown } from "@/components/select-dropdown"
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

import { capitalizeAllWords } from "@/utils/removeEmptyStrings"
import { useQuery } from "@tanstack/react-query"

import { fetchStockItemService } from "@/features/modules/stock_item/data/api"
import type { StockItem } from "@/features/modules/stock_item/data/schema"



type Props = {
    control: any
    name: string
}

const StockItemDropdown = (props: Props) => {
    const { control, name } = props as Props
    const { data: stockItemList, isLoading } = useQuery({
        queryKey: ["stockItems"],
        queryFn: fetchStockItemService,
    })


    const handleValueChange = (value: string) => {
        control.setValue(name, Number(value))

    }
    if (isLoading) {
        return <div>Loading...</div>
    }
    return (
        <>
            <FormField
                control={control}
                name={name}
                render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1 '>
                        <FormLabel className='col-span-2 text-right mt-3'>
                            Item
                        </FormLabel>
                        <div className="w-full flex gap-2 flex-row items-center justify-start col-span-4 space-y-1">

                            <SelectDropdown
                                defaultValue={field.value ? field.value.toString() : ''}
                                onValueChange={(value) => handleValueChange(value)}
                                placeholder='Select a voucher category'
                                className='w-11/12 col-span-6 md:col-span-4'
                                items={stockItemList?.data.map((stockItem: StockItem) => ({
                                    label: capitalizeAllWords(stockItem.name),
                                    value: String(stockItem.id),
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

export default StockItemDropdown
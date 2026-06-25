import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { fetchGodownService } from "@/features/modules/godown/data/api";
import { fetchStockItemService } from "@/features/modules/stock_item/data/api";
import type { StockItem } from "@/features/modules/stock_item/data/schema";
import { fetchStockUnitService } from "@/features/modules/stock_unit/data/api";
import type { StockUnit } from "@/features/modules/stock_unit/data/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueries } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Form, useForm, type Resolver } from "react-hook-form";
import { GodownCombobox } from "./godown-combo-box";
import { stockJournalEntrySchema, type StockJournalEntryForm } from "../../../data-schema/voucher-schema";

export function ItemDialog() {

    const results = useQueries({
        queries: [
            {
                queryKey: ["stockItems"],
                queryFn: fetchStockItemService,
            },
            {
                queryKey: ["godowns"],
                queryFn: fetchGodownService,
            },
            {
                queryKey: ["stockUnits"],
                queryFn: fetchStockUnitService,
            },
        ],
    })
    const [stockItem] = useState<StockItem>()
    const [stockItemUnits, setStockItemUnits] = useState<StockUnit[]>([])
    const [stockItems, godowns,] = results


    const form = useForm<StockJournalEntryForm>({
        resolver: zodResolver(stockJournalEntrySchema) as Resolver<StockJournalEntryForm>,
        defaultValues: {
            stockJournalId: undefined,
            stockItemId: undefined,
            stockItem: undefined,
            stockUnitId: undefined,
            alternateStockUnitId: undefined,
            unitRatio: 0,
            itemCost: 0,
            // quantity: 0,
            rate: 0,
            movementType: 'in',

        },
    })
    const stockItemId = form.watch('stockItemId')
    // const onSubmit = (values: StockJournalEntryForm) => {
    //     console.log("here: ", values)
    //     form.reset()


    // }
    useEffect(() => {
        if (!stockItemId) return

        const stockItem = stockItems?.data?.data.find(
            (item: StockItem) => item.id === stockItemId
        )
        const units: StockUnit[] = []
        if (stockItem) {
            // console.log("Stock Item: ", stockItem)
            form.setValue('stockItem', stockItem)
            form.setValue('stockUnitId', stockItem?.stockUnitId)
            if (stockItem.stockUnit) units.push(stockItem.stockUnit)
        }
        if (stockItem.alternateStockUnitId) {
            form.setValue('alternateStockUnitId', stockItem?.alternateStockUnitId)
            if (stockItem.alternateStockUnit) units.push(stockItem.alternateStockUnit)
        }
        setStockItemUnits(units)
    }, [stockItemId])
    console.log("SS", stockItemUnits)
    if (results.some((r) => r.isLoading)) return <div>Loading...</div>
    return (
        <Dialog>

            <DialogTrigger asChild >
                <Button variant="outline" className="w-full m-2 bg-blue-600 text-white">+ Add Item</Button>
            </DialogTrigger>
            <DialogContent className=" !max-w-10/12 h-8/12 grid grid-rows-[70px_1fr_50px]" onInteractOutside={(e) => {
                e.preventDefault();
            }}>
                <Form {...form}>
                    <form
                        id='inner-form'
                        // onSubmit={form.handleSubmit(onSubmit)}
                        className='space-y-4 p-0.5'
                    >


                <DialogHeader>
                            <DialogTitle>
                                <div className="grid grid-cols-3  justify-center items-center gap-2">
                                    <div></div>
                                    <div className="  flex flex-col w-full justify-center items-center gap-2">
                                        <div className="w-full">

                                            <FormLabel >Item</FormLabel>

                                            {/* <StockItemCombobox form={form} stockItems={stockItems?.data?.data} /> */}
                                        </div>
                                        <div className="w-full">
                                            {JSON.stringify(stockItemUnits)}
                                            Unit: {stockItem?.stockUnit?.code}
                                        </div>
                                    </div>
                                    <div>
                                    </div>
                                </div>
                            </DialogTitle>


                </DialogHeader>
                        <div>

                            <div className="bg-amber-100 grid grid-cols-6 gap-6 justify-center items-start">
                                <GodownCombobox godowns={godowns?.data?.data} />
                                <Input name={'batchNo'} placeholder={'BatchNo'} />
                                <Input name={'quantity'} placeholder={'Quantity'} />

                                {/* <StockUnitCombobox stockUnits={stockUnits?.data?.data} form={form} /> */}
                                <Input name="rate" placeholder="Rate" />
                            </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Save changes</Button>
                </DialogFooter>
                    </form>
                </Form>
            </DialogContent>

        </Dialog>
    )
}

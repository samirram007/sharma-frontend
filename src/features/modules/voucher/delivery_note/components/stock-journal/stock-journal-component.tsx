import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fetchGodownService } from "@/features/modules/godown/data/api"
import { fetchStockItemService } from "@/features/modules/stock_item/data/api"
import { useQueries } from "@tanstack/react-query"
import { useFieldArray, useFormContext } from "react-hook-form"
import type { DeliveryNoteForm } from "../../data/schema"
import { RHFSelect } from "./RHFSelect"
import { ItemDialog } from "./item-dialog"


export function StockJournalComponent() {
    return (
        <>
            <div className="items">
                <div className="items-header font-semibold text-sm border-y-2 border-slate-800 grid grid-cols-[70%_1fr]">
                    <div className="px-2">Name of Item..</div>
                    <div className="grid grid-cols-[100px_70px_50px_1fr] ">
                        <div className=" grid items-center justify-center">Quantity</div>
                        <div className="  grid  justify-end">Rate</div>
                        <div className="  pl-1">per</div>
                        <div className=" grid  justify-end px-1">Amount</div>
                    </div>
                </div>
                <StockJournalEntries />
            </div>
        </>
    )
}


// const stockItems = [
//     { label: "Item A", value: 1 },
//     { label: "Item B", value: 2 },
// ]
const stockUnits = [
    { name: "KG", id: 1 },
    { name: "PCS", id: 2 },
]
// const godowns = [
//     { name: "Main Godown", id: 1 },
//     { name: "Secondary", id: 2 },
// ]
const StockJournalEntries = () => {

    const { control, register } = useFormContext<DeliveryNoteForm>()


    const results = useQueries(
        {
            queries: [
                {
                    queryKey: ["stockItems"],
                    queryFn: fetchStockItemService,
                },
                {
                    queryKey: ["godowns"],
                    queryFn: fetchGodownService,
                },
            ]
        }
    )
    const stockItems = results[0].data || []
    const godowns = results[1].data || []
    const isLoading = results.some((r) => r.isLoading)

    const { fields, remove } = useFieldArray({
        control,
        name: "stockJournal.stockJournalEntries", // 👈 path inside schema
    })

    if (isLoading) return <div>Loading...</div>

    return (
        <div className="space-y-4">
            {fields.map((field, index) => (

                <div key={field.id} className=" grid grid-cols-[70%_1fr] items-center">
                    <RHFSelect
                        name={`stockJournal.stockJournalEntries.${index}.stockItemId`}
                        options={stockItems?.data}
                        placeholder="Item"
                    />
                    <div className="grid grid-cols-[100px_70px_50px_1fr] ">
                        <RHFSelect
                            name={`stockJournal.stockJournalEntries.${index}.godownId`}
                            options={godowns?.data}
                            placeholder="Godown"
                        />
                        {/* <Input
                            type="number"
                            {...register(`stockJournal.stockJournalEntries.${index}.quantity`)}
                            placeholder="Quantity"
                        /> */}
                        <Input
                            type="number"
                            {...register(`stockJournal.stockJournalEntries.${index}.rate`)}
                            placeholder="Rate"
                        />
                    </div>
                    <RHFSelect
                        name={`stockJournal.stockJournalEntries.${index}.stockUnitId`}
                        options={stockUnits}
                        placeholder="Unit"
                    />

                    <Button type="button" variant="destructive" onClick={() => remove(index)}>
                        Remove
                    </Button>
                </div>
            ))}

            {/* <Button
                type="button"
                onClick={() =>
                    append({
                        stockItemId: 0,
                        stockUnitId: 0,
                        quantity: 0,
                        rate: 0,
                        movementType: "IN",
                        godownId: 0,
                    })
                }
            >
                + Add Entry
            </Button> */}
            <ItemAdd />
        </div>
    )
}

const ItemAdd = () => {
    return (
        <div className="space-y-4 grid grid-rows-1 justify-center items-center w-full bg-amber-400">
            <ItemDialog />
        </div>)

}


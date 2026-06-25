import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { StockItem } from "@/features/modules/stock_item/data/schema";
import { cn } from "@/lib/utils";
import { getData } from "@/utils/dataClient";
import { capitalizeAllWords } from "@/utils/removeEmptyStrings";
import { useQuery } from "@tanstack/react-query";

import { CheckIcon, ChevronsUpDownIcon, Loader2 } from "lucide-react";
import React from "react";
import type { UseFormReturn } from "react-hook-form";

import { lowerCase } from "lodash";
import type { StockJournalGodownEntryForm } from "../../data-schema/voucher-schema";

interface BatchData {
    batchNo?: string;
    mfgDate?: Date;
    expiryDate?: Date;
    stockInHand?: number;
    className?: string;
}

type BatchSelectionProps = {
    form: UseFormReturn<StockJournalGodownEntryForm>;
    stockItem: StockItem | null;
    godownId: number | null;
}
const BatchSelection = (props: BatchSelectionProps) => {
    const { form, stockItem, godownId } = props;
    const [open, setOpen] = React.useState(true)
    const selectedId = form.watch('batchNo')?.toString()
    const batches = useQuery({
        queryKey: ['batches', stockItem?.id, godownId],
        queryFn: async () => {
            if (!stockItem?.id || !godownId) {
                return []
            }
            const response = await getData(`/godown_item_batches/${stockItem.id}/${godownId}`);

            return response.data;
        },
        enabled: !!stockItem?.id && !!godownId
    });
    const noOfDecimalPlaces = stockItem?.stockUnit?.noOfDecimalPlaces ?? 0

    const frameworks = batches.data?.map((batch: BatchData) => ({
        label: batch.batchNo!,
        value: batch.batchNo!,
        stockInHand: batch.stockInHand,
        stockUnitLabel: stockItem?.stockUnit ? capitalizeAllWords(stockItem.stockUnit.code!) : '',
        className: "min-w-full hover:bg-blue-300",
        stockInHandFormatted: batch.stockInHand?.toFixed(noOfDecimalPlaces)
    })) || [];


    const handleSelect = (value: string) => {
        form.setValue(`batchNo`, String(value))
        console.log("VALUE:", form.getValues("batchNo"))
        setOpen(false);
        console.log("Batch Entry REFLECTION", form)

    };
    const handleBlur = () => {
        //if framework count is 1 set that value
        if (form.watch(`batchNo`) === undefined || form.watch(`batchNo`) === '') {
            form.setValue(`batchNo`, frameworks[0].value)
            // return;
        }
        // setOpen(false);
    };



    if (batches.isPending) {
        return <div className="flex flex-row justify-between items-center border-2 rounded-l-lg rounded-2xl mr-2 pl-2 text-sm mt-0.5">Batch loading
            <Loader2 className="animate-spin mr-2 h-4 w-4 text-blue-500" /></div>
    }


    const selected = frameworks.find((o: { label: string; value: string; stockInHand: number; stockUnitLabel: string; className: string }) => lowerCase(o.value) === lowerCase(selectedId!))

    const selectedLabel = (
        <div className="flex flex-row justify-between w-full">
            {selected ? (<><div>{selected?.label}</div> <div>{selected?.stockInHandFormatted} {selected?.stockUnitLabel}</div></>) : (
                frameworks?.length > 0 ? (<><div>{frameworks[0].label}</div> <div>{frameworks[0].stockInHandFormatted} {frameworks[0].stockUnitLabel}</div></>) : 'Select batch...')}
        </div>
    );

    return (
        <div>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn("w-full justify-between")}
                        autoFocus={true}
                        onBlur={handleBlur}
                    >
                        {selectedLabel}
                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="popover-content-width-same-as-trigger p-0">
                    <Command className="rounded-lg border shadow-md min-w-full">
                        <CommandInput placeholder="Search batch..." />
                        <CommandList className=" max-h-full">
                            <CommandEmpty>No batch found.</CommandEmpty>
                            <CommandGroup>

                                {frameworks.map((framework: { label: string; value: string; stockInHand: number; stockUnitLabel: string; className: string; stockInHandFormatted: string }) => (
                                    <CommandItem
                                        className={cn("justify-start", framework.className)}
                                        key={framework.value}
                                        value={framework.value}
                                        onSelect={() => handleSelect(framework.value)}
                                    >
                                        <CheckIcon
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedId === framework.value ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <div className="flex flex-row justify-between w-full">
                                            <div>
                                                {framework.label}
                                            </div>
                                            <div>
                                                {framework.stockInHandFormatted} {framework.stockUnitLabel}
                                            </div>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}

export default BatchSelection
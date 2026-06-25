"use client"

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { capitalizeAllWords } from "@/utils/removeEmptyStrings"
import { type UseFormReturn } from "react-hook-form"

import type { StockUnit } from "@/features/modules/stock_unit/data/schema"
import type { StockJournalEntryForm } from "../../data-schema/voucher-schema"




interface Props {
    stockUnits: StockUnit[];
    form: UseFormReturn<StockJournalEntryForm>;
}
export const StockUnitCombobox = ({ stockUnits, form }: Props) => {
    const [open, setOpen] = React.useState(false)
    const selectedId = form.watch('stockUnitId')?.toString()

    const handleSelect = (value: string) => {
        form.setValue(`stockUnitId`, Number(value) ?? null, { shouldValidate: true, shouldDirty: true });
        setOpen(false);
    };
    const frameworks = stockUnits?.map((stockUnit: StockUnit) => ({
        label: capitalizeAllWords(stockUnit.name!),
        value: String(stockUnit.id),
    }))
    const selected = frameworks.find((o) => o.value === selectedId)
    const selectedLabel = selected ? (selected?.label + ` - ` + selected?.value) : 'Select Unit'



    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selectedLabel}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </SheetTrigger>
            <SheetContent className="sheet-content-width-same-as-trigger p-0">
                <Command className="rounded-lg border shadow-md min-w-full">
                    <CommandInput placeholder="Search item..." />
                    <CommandList className=" max-h-full">
                        <CommandEmpty>No Unit found.</CommandEmpty>
                        <CommandGroup>
                            {frameworks.map((framework) => (
                                <CommandItem
                                    className="min-w-full"
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
                                    {framework.label}- {framework.value}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </SheetContent>
        </Sheet>
    )
}
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
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

import type { StockItem } from "@/features/modules/stock_item/data/schema"
import { cn } from "@/lib/utils"
import { capitalizeAllWords } from "@/utils/removeEmptyStrings"

import { FaSignOutAlt } from "react-icons/fa"

import type { UseFormReturn } from "react-hook-form"
import type { StockJournalEntryForm } from "../../data-schema/voucher-schema"




interface StockItemComboboxProps {
    stockJournalEntryForm: UseFormReturn<StockJournalEntryForm>;
    stockItems: StockItem[];
    handleRemove?: () => void;
    rowIndex?: number;
}
export const StockItemCombobox = ({ stockJournalEntryForm: form, stockItems, handleRemove, rowIndex }: StockItemComboboxProps) => {
    const lastKeyRef = React.useRef<string | null>(null);
    const selectedId = form.watch('stockItemId')?.toString()
    const autoFocusable = rowIndex! > 0 ? true : false;
    const [open, setOpen] = React.useState(false)
    // const index = currentIndex
    // const [value, setValue] = React.useState(form.getValues(`stockItemId`)?.toString())
    const handleSelect = (value: string) => {
        if (value === '-1') {
            handleRemove?.();

            return
        }
        const selected = stockItems.find((i) => i.id === Number(value));
        const quantity = 0
        form.setValue(`stockItemId`, Number(value))
        form.setValue(`actualQuantity`, quantity)
        form.setValue(`billingQuantity`, quantity)
        form.setValue(`stockUnitId`, selected?.stockUnitId)
        form.setValue(`rate`, selected?.standardCost)
        form.setValue(`rateUnitId`, selected?.stockUnitId)
        form.setValue(`discountPercentage`, 0)
        form.setValue(`discount`, (form.getValues(`rate`)! * form.getValues(`discountPercentage`)! / 100 * selected?.standardCost! * quantity))
        form.setValue(`amount`, Number((selected?.standardCost! * quantity - form.getValues(`discount`)!).toFixed(2)))

        // ✅ Safely update nested field value by index
        // console.log(form.getValues('stockJournal'), index, "index")
        form.setValue(`stockItem`, selected ?? null, { shouldValidate: true, shouldDirty: true } // optional but recommended
        );

        // setValue(value);
        setOpen(false);
        requestAnimationFrame(() => {
            const focusable = Array.from(
                document.querySelectorAll<
                    HTMLElement
                >('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
            ).filter(el => !el.hasAttribute("disabled"));

            const current = document.activeElement;
            const index = focusable.indexOf(current as HTMLElement);

            if (index >= 0 && index < focusable.length - 1) {
                focusable[index + 1].focus();
            }
        });

    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        lastKeyRef.current = e.key;
    };

    const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
        // ✅ Only Tab-triggered blur
        if (lastKeyRef.current !== 'Tab') return;
        if (selectedId !== null && selectedId !== undefined && selectedId !== '') return;

        const next = e.relatedTarget as HTMLElement | null;

        // ✅ Outside click → relatedTarget is null
        if (!next) return;

        // ✅ Focus moved into Sheet → ignore
        if (next.closest('[data-slot="sheet-content"]')) return;

    // ✅ Outside click → relatedTarget is null
        if (!form.getValues('stockItemId') && rowIndex !== 0) {
            setOpen(true);
        }

    }

    const frameworks = [
        {
            label: (
                <div className="flex items-center justify-end gap-2 text-red-600 hover:text-red-800 font-medium">
                    <FaSignOutAlt className="  hover:text-red-800 h-4 w-4" />Finish Item Entries
                </div>
            ), value: "-1",
            stockInHand: '',
            noOfDecimalPlaces: 2,
            stockUnitLabel: <div className="font-semibold underline">Quantity</div>,
            className: "min-w-full bg-red-200 active:bg-red-300 data-[selected=true]:bg-red-400  "
        },
        ...(stockItems?.map((stockItem: StockItem) => ({
            label: capitalizeAllWords(stockItem.name!),
            value: String(stockItem.id),
            stockInHand: stockItem.stockInHand,
            stockUnitLabel: stockItem.stockUnit?.code || stockItem.stockUnit?.name || '',
            noOfDecimalPlaces: stockItem.stockUnit?.noOfDecimalPlaces ?? 2,
            className: "min-w-full hover:bg-blue-300",
        })) ?? []),
    ];

    const selected = frameworks.find((o) => o.value === selectedId)
    const selectedLabel = selected ? (selected?.label.toString()) : 'Select item'



    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between")}
                    autoFocus={autoFocusable}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}

                >
                    {selectedLabel}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </SheetTrigger>
            <SheetContent className="min-w-[450px]! p-0">
                <SheetHeader>
                    <SheetTitle>Search Item</SheetTitle>
                    <SheetDescription>
                        Select the stock item for this entry.
                    </SheetDescription>
                </SheetHeader>
                <Command className="rounded-lg border shadow-md min-w-full">
                    <CommandInput placeholder="Search item..." />
                    <CommandList className=" max-h-full">
                        <CommandEmpty>No pary found.</CommandEmpty>
                        <CommandGroup>
                            {frameworks.map((framework) => (
                                <CommandItem
                                    className="min-w-full"
                                    key={framework.value}
                                    value={framework.label.toString().toLowerCase()}
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
                                            {Number(framework.stockInHand).toFixed(framework.noOfDecimalPlaces)} {framework.stockUnitLabel}
                                        </div>
                                    </div>

                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </SheetContent>
        </Sheet>
    )
}
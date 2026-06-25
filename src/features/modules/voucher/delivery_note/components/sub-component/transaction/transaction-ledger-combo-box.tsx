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
import { cn } from "@/lib/utils"
import { capitalizeAllWords } from "@/utils/removeEmptyStrings"
import type { UseFormReturn } from "react-hook-form"


import type { TransactionLedger } from "../../../../data-schema/transactinableStockItem/data/schema"
import type { DeliveryNoteForm } from "../../../data/schema"

interface Props {
    form: UseFormReturn<DeliveryNoteForm>;
    transactionLedgers: TransactionLedger[];
}
export const TransactionLedgerCombobox = ({ form, transactionLedgers }: Props) => {
    const lastKeyRef = React.useRef<string | null>(null);
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(form.getValues('transactionLedger.id')?.toString())

    const handleSelect = (value: string) => {
        form.setValue("transactionLedger.id", transactionLedgers.find((transactionLedger) => transactionLedger.id === Number(value))?.id!)
        setValue(value)
        setOpen(false)
        // focusNext();
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        lastKeyRef.current = e.key;
    }
    const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
        // ✅ Only Tab-triggered blur
        if (lastKeyRef.current !== 'Tab') return;

        // ✅ Value exists → ignore
        if (value !== null && value !== undefined && value !== '') return;

        const next = e.relatedTarget as HTMLElement | null;

        // ✅ Outside click → relatedTarget is null
        if (!next) return;

        // ✅ Focus moved into Sheet → ignore
        if (next.closest('[data-slot="sheet-content"]')) return;
            setOpen(true);
    }
    const frameworks = transactionLedgers?.map((transactionLedger: TransactionLedger) => ({
        label: capitalizeAllWords(transactionLedger.name!),
        value: String(transactionLedger.id),
    }))



    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                >
                    {value
                        ? frameworks.find((framework) => framework.value === value)?.label
                        : "Select stock ledger..."}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </SheetTrigger>
            <SheetContent className="sheet-content-width-same-as-trigger p-0">
                <SheetHeader>
                    <SheetTitle>Search Stock Ledger</SheetTitle>
                    <SheetDescription>
                        Select the stock ledger for this receipt note.
                    </SheetDescription>
                </SheetHeader>
                <Command className="rounded-lg border shadow-md min-w-full">

                    <CommandInput placeholder="Search purchase ledger..." />
                    <CommandList className=" max-h-full">
                        <CommandEmpty>No pary found.</CommandEmpty>
                        <CommandGroup>
                            {frameworks.map((framework) => (
                                <CommandItem
                                    className="min-w-full"
                                    key={framework.value}
                                    value={framework.label.toLowerCase()}
                                    onSelect={() => handleSelect(framework.value)}
                                >
                                    <CheckIcon
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === framework.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {framework.label} [{framework.value}]
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </SheetContent>
        </Sheet>
    )
}
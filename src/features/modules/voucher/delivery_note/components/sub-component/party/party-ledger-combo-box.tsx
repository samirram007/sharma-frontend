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
import { useFormContext } from "react-hook-form"


import type { PartyLedger } from "../../../../data-schema/partyLedger/data/schema"
import type { DeliveryNoteForm } from "../../../data/schema"
import type { PartyForm } from "@/features/modules/voucher/data-schema/voucher-schema"




interface Props {

    partyLedgers: PartyLedger[];
    tabIndex?: number;
}

export const PartyLedgerCombobox = ({ partyLedgers }: Props) => {
    const lastKeyRef = React.useRef<string | null>(null);
    const form = useFormContext<DeliveryNoteForm>()

    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(form.getValues('partyLedger.id')?.toString())


    const handleSelect = (value: string) => {
        // form.setValue("party", partyLedgers.find((party) => party.id === Number(value)))
        form.setValue("partyLedger.id", Number(value))
        const partyLedger = partyLedgers.find((partyLedger) => partyLedger.id === Number(value))
        const ledgerable = partyLedger?.ledgerable as any
        const party: PartyForm = {
            name: ledgerable?.name,
            mailingName: ledgerable?.name,
            line1: ledgerable?.address?.line1,
            line2: ledgerable?.address?.line2,
            line3: ledgerable?.address?.landmark,
            stateId: ledgerable?.address?.stateId ?? 36,
            countryId: ledgerable?.address?.countryId ?? 76,
            gstRegistrationTypeId: ledgerable?.gstRegistrationTypeId ?? 1,
            gstin: ledgerable?.gstin,
            placeOfSupplyStateId: ledgerable?.stateId ?? 36,
        }
        form.setValue("party", party)
        setValue(value)
        setOpen(false);

        //  focusNext();
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
    const frameworks = partyLedgers?.map((partyLedger: PartyLedger) => ({
        label: capitalizeAllWords(partyLedger.name!),
        value: String(partyLedger.id),
    }))


    return (
        <Sheet open={open} onOpenChange={setOpen}   >

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
                        : "Select party..."}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </SheetTrigger>
            <SheetContent showCloseButton={false} className="sheet-content-width-same-as-trigger p-0"  >

                <SheetHeader>
                    <SheetTitle>Search Party</SheetTitle>
                    <SheetDescription>
                        Select the party ledger for this receipt note.
                    </SheetDescription>
                </SheetHeader>
                <Command className="rounded-lg border shadow-md min-w-full">
                    <CommandInput placeholder="Search party..." />
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
                                    {framework.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </SheetContent>
        </Sheet>
    )
}
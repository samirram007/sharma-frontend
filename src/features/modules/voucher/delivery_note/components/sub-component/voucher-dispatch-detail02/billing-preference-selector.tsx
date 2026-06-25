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



import { Label } from "@/components/ui/label"
import { billingPreferenceSchema, type VoucherDispatchDetailForm } from "@/features/modules/voucher/data-schema/voucher-schema"


interface Props {
    form: UseFormReturn<VoucherDispatchDetailForm>;
    name: keyof VoucherDispatchDetailForm;
    gapClass?: string;
    label?: string;
}
export const BillingPreferenceSelector = ({ form, name, gapClass, label }: Props) => {
    const lastKeyRef = React.useRef<string | null>(null);
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(form.getValues(name)?.toString())




    const handleSelect = (value: string) => {
        if (!value) {
            setOpen(true);
            return;
        }


        // Atomic update
        form.setValue(name, value);

        setValue(value);
        setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        lastKeyRef.current = e.key;
    };
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

        // ✅ Only now open
        setOpen(true);
    }
    const frameworks = billingPreferenceSchema.options.map((item: string) => ({ label: item, value: item }))



    return (<div className={gapClass}>
        <Label
            htmlFor=""
            className="  text-sm font-medium text-gray-700 mb-1"
        >{label ?? "Billing Preference"}</Label>
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
                        ? frameworks.find((framework: { value: string }) => framework.value === value)?.label
                        : `Select ${label ?? "billing preference"}...`}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </SheetTrigger>
            <SheetContent className="sheet-content-width-same-as-trigger p-0">
                <SheetHeader>
                    <SheetTitle>Search {capitalizeAllWords(name)}  </SheetTitle>
                    <SheetDescription>
                        Select the {capitalizeAllWords(name)}  for this Freight.
                    </SheetDescription>
                </SheetHeader>
                <Command className="rounded-lg border shadow-md min-w-full">

                    <CommandInput placeholder={`Search ${label ?? "preference"}...`} />
                    <CommandList className=" max-h-full">
                        <CommandEmpty>No preference found.</CommandEmpty>
                        <CommandGroup>
                            {frameworks.map((framework: { label: string; value: string }) => (
                                <CommandItem
                                    className="min-w-full"
                                    key={framework.value}
                                    value={framework.value.toLowerCase()}
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
    </div>

    )
}
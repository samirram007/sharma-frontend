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
import { capitalizeAllWords, toSentenceCase } from "@/utils/removeEmptyStrings"
import type { UseFormReturn } from "react-hook-form"





interface Props {
    form: UseFormReturn<any>;
    frameworks: { label: string; value: string | number | undefined }[];
    name: string;
    gapClass?: string;
    rtl?: boolean;
    handleValueChange: (value: string) => void;
    defaultValue?: string;
    placeHolder?: string;
}
export const InputSheet = ({ form, frameworks, name, handleValueChange, placeHolder }: Props) => {
    const lastKeyRef = React.useRef<string | null>(null);
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(form.watch(name)?.toString())



    const handleSelect = (value: string) => {

        handleValueChange(value);
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
                        ? frameworks.find((framework) => framework.value?.toString() === value)?.label
                        : (placeHolder ?? `Select ${toSentenceCase(name)}...`)}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </SheetTrigger>
            <SheetContent className="sheet-content-width-same-as-trigger p-0">
                <SheetHeader>
                    <SheetTitle>Search {capitalizeAllWords(name)}</SheetTitle>
                    <SheetDescription>
                        Select the {capitalizeAllWords(name)} .
                    </SheetDescription>
                </SheetHeader>
                <Command className="rounded-lg border shadow-md min-w-full">

                    <CommandInput placeholder={`Search ${capitalizeAllWords(name)}...`} />
                    <CommandList className=" max-h-full">
                        <CommandEmpty>No {capitalizeAllWords(name)} found.</CommandEmpty>
                        <CommandGroup>
                            {frameworks.map((framework: { label: string; value: string | number | undefined }) => (
                                <CommandItem
                                    className="min-w-full"
                                    key={framework.value}
                                    value={framework.label ?? framework.label}
                                    onSelect={() => handleSelect(framework.value!.toString())}
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
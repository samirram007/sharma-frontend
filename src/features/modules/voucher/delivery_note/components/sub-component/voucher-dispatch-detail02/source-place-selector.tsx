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



import { useSuspenseQuery } from "@tanstack/react-query"


import { godownQueryOptions } from "@/features/modules/godown/data/queryOptions"
import type { Godown } from "@/features/modules/godown/data/schema"
import type { VoucherDispatchDetailForm } from "@/features/modules/voucher/data-schema/voucher-schema"


interface Props {
    form: UseFormReturn<VoucherDispatchDetailForm>;
    name: keyof VoucherDispatchDetailForm;
}
export const SourcePlaceSelector = ({ form, name }: Props) => {
    // const focusNext = useFocusNext();
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(form.getValues(name)?.toString())

    const { data: godowns } = useSuspenseQuery(godownQueryOptions())

    const handleSelect = (value: string) => {

        form.setValue(name, value)
        setValue(value)
        setOpen(false)
        // focusNext();
    }

    const handleBlur = () => {
        form.setValue(name, value)

        if (!value) setOpen(true);
    }
    const frameworks = godowns?.data?.map((godown: Godown) => ({
        label: capitalizeAllWords(godown.name!),
        value: godown.name!.toString(),
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
                >
                    {value
                        ? frameworks.find((framework: { value: string }) => framework.value === value)?.label
                        : "Select place..."}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </SheetTrigger>
            <SheetContent className="sheet-content-width-same-as-trigger p-0">
                <SheetHeader>
                    <SheetTitle>Search {capitalizeAllWords(name)} Place</SheetTitle>
                    <SheetDescription>
                        Select the {capitalizeAllWords(name)} place for this Freight.
                    </SheetDescription>
                </SheetHeader>
                <Command className="rounded-lg border shadow-md min-w-full">

                    <CommandInput placeholder="Search place..." />
                    <CommandList className=" max-h-full">
                        <CommandEmpty>No place found.</CommandEmpty>
                        <CommandGroup>
                            {frameworks.map((framework: { label: string; value: string }) => (
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
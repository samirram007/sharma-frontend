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

import type { DeliveryVehicleForm } from "../data/schema"
import { transporterQueryOptions } from "../../transporter/data/queryOptions"
import type { Transporter } from "../../transporter/data/schema"




interface Props {
    form: UseFormReturn<DeliveryVehicleForm>;
}
export const TransporterSelector = ({ form }: Props) => {
    // const focusNext = useFocusNext();
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(form.getValues('transporterId')?.toString())

    const { data: transporters } = useSuspenseQuery(transporterQueryOptions())

    const handleSelect = (value: string) => {

        form.setValue('transporterId', Number(value))
        setValue(value)
        setOpen(false)
        // focusNext();
    }

    const handleBlur = () => {
        if (value === null || value === undefined || value === '') {


            setOpen(true);
        }
    }
    const frameworks = transporters.data?.map((transporter: Transporter) => ({
        label: capitalizeAllWords(transporter.name!),
        value: String(transporter.id),
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
                        : "Select transporter..."}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </SheetTrigger>
            <SheetContent className="sheet-content-width-same-as-trigger p-0">
                <SheetHeader>
                    <SheetTitle>Search Transporter</SheetTitle>
                    <SheetDescription>
                        Select the transporter for this delivery vehicle.
                    </SheetDescription>
                </SheetHeader>
                <Command className="rounded-lg border shadow-md min-w-full">

                    <CommandInput placeholder="Search transporter..." />
                    <CommandList className=" max-h-full">
                        <CommandEmpty>No transporter found.</CommandEmpty>
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
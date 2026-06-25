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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { gstRegistrationTypeQueryOptions } from "@/features/modules/gst_registration_type/data/queryOptions"
import type { GstRegistrationType } from "@/features/modules/gst_registration_type/data/schema"
import { cn } from "@/lib/utils"
import { capitalizeAllWords } from "@/utils/removeEmptyStrings"
import { useSuspenseQuery } from "@tanstack/react-query"
import type { UseFormReturn } from "react-hook-form"
import type { PartyForm } from "@/features/modules/voucher/data-schema/voucher-schema"




interface Props {
    form: UseFormReturn<PartyForm>;
}
export const GstRegistrationTypeCombobox = ({ form }: Props) => {

    const { data: gstRegistrationTypes } = useSuspenseQuery(gstRegistrationTypeQueryOptions())
    const [open, setOpen] = React.useState(false)
    const [selectedId] = React.useState(form.getValues('gstRegistrationTypeId')?.toString())
    const handleSelect = (value: string) => {
        form.setValue("gstRegistrationTypeId", value ? Number(value) : undefined)

        setOpen(false)
    }

    // load status='active' gst registration types

    // const frameworks = gstRegistrationTypes?.data.map((gstRegistrationType: GstRegistrationType) => ({
    //     label: capitalizeAllWords(gstRegistrationType.name!),
    //     value: String(gstRegistrationType.id),
    // }))

    const frameworks = gstRegistrationTypes?.data
        ?.filter((t: GstRegistrationType) => t.status === 'active')
        ?.map((t: GstRegistrationType) => ({
            label: capitalizeAllWords(t.name!),
            value: String(t.id),
        }));
    const selected = frameworks.find((o: { label: string, value: string }) => o.value === selectedId)
    // console.log("SELECTED GODOWN: ", selectedId, selected)
    const selectedLabel = selected ? (selected?.label?.toString() ?? 'Select gst_registration_type') : 'Select gst_registration_type'

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selectedLabel}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="popover-content-width-same-as-trigger p-0">
                <Command className="rounded-lg border shadow-md min-w-full">
                    <CommandInput placeholder="Search gst registration type..." />
                    <CommandList className=" max-h-full">
                        <CommandEmpty>No gst registration type found.</CommandEmpty>
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
                                            selectedId === framework.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {framework.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
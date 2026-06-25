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
import { stateQueryOptions } from "@/features/modules/state/data/queryOptions"
import type { State } from "@/features/modules/state/data/schema"
import { cn } from "@/lib/utils"
import { capitalizeAllWords } from "@/utils/removeEmptyStrings"
import { useSuspenseQuery } from "@tanstack/react-query"
import type { UseFormReturn } from "react-hook-form"
import type { PartyForm } from "@/features/modules/voucher/data-schema/voucher-schema"



interface Props {
    form: UseFormReturn<PartyForm>;
}
export const StateCombobox = ({ form }: Props) => {

    const { data: states } = useSuspenseQuery(stateQueryOptions())
    const [open, setOpen] = React.useState(false)
    const [country, setCountry] = React.useState('INDIA')
    const [selectedId] = React.useState(form.getValues('stateId')?.toString())

    const handleSelect = (value: string) => {
        // console.log("SELECTED STATE ID: ", value)
        form.setValue("stateId", value ? Number(value) : undefined)
        const country = states?.data.find((state: State) => state.id === Number(value))?.country
        form.setValue("countryId", country ? country.id : undefined)
        setCountry(country ? country.name : 'INDIA')
        //setValue(value)
        setOpen(false)
    }
    const frameworks = states?.data.map((state: State) => ({
        label: capitalizeAllWords(state.name!),
        value: String(state.id),
    }))
    const selected = frameworks.find((o: { label: string, value: string }) => o.value === selectedId)
    // console.log("SELECTED GODOWN: ", selectedId, selected)
    const selectedLabel = selected ? (selected?.label?.toString() ?? 'Select state') : 'Select state'


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
                    <CommandInput placeholder="Search state.." />
                    <CommandList className=" max-h-full">
                        <CommandEmpty>No state found.</CommandEmpty>
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
            <div className="italic pl-2 text-sm">Country: {country}</div>
        </Popover>
    )
}
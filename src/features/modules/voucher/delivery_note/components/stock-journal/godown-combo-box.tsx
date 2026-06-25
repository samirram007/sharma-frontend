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
import { cn } from "@/lib/utils"
import { capitalizeAllWords } from "@/utils/removeEmptyStrings"
import { useFormContext } from "react-hook-form"

import type { Godown } from "@/features/modules/godown/data/schema"
import type { DeliveryNoteForm } from "../../data/schema"

// const frameworks = [
//     {
//         value: "next.js",
//         label: "Next.js",
//     },
//     {
//         value: "sveltekit",
//         label: "SvelteKit",
//     },
//     {
//         value: "nuxt.js",
//         label: "Nuxt.js",
//     },
//     {
//         value: "remix",
//         label: "Remix",
//     },
//     {
//         value: "astro",
//         label: "Astro",
//     },
// ]
interface Props {
    godowns: Godown[];
}
export const GodownCombobox = ({ godowns }: Props) => {
    const form = useFormContext<DeliveryNoteForm>()
    const [open, setOpen] = React.useState(false)
    // const index = form.getValues('stockJournal.stockJournalEntries').length
    // const [value, setValue] = React.useState('')
    const value = ''
    const handleSelect = (value: string) => {
        // const selected = godowns.find((i) => i.id === Number(value));
        const index = form.getValues('stockJournal.stockJournalEntries')?.length
        // ✅ Safely update nested field value by index
        console.log(form.getValues('stockJournal'), index, "index")
        // form.setValue(`godown`, selected ?? null, { shouldValidate: true, shouldDirty: true } 
        //     // optional but recommended
        // );
        console.log(value)
        // setValue(value);
        setOpen(false);
    };
    const frameworks = godowns?.map((godown: Godown) => ({
        label: capitalizeAllWords(godown.name!),
        value: String(godown.id),
    }))



    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {value
                        ? frameworks.find((framework) => framework.value === value)?.label
                        : "Select godown..."}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="popover-content-width-same-as-trigger p-0">
                <Command className="rounded-lg border shadow-md min-w-full">
                    <CommandInput placeholder="Search item..." />
                    <CommandList className=" max-h-full">
                        <CommandEmpty>No godown found.</CommandEmpty>
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
                                            value === framework.value ? "opacity-100" : "opacity-0"
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
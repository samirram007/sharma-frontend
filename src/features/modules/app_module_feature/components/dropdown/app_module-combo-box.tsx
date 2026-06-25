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
import type { UseFormReturn } from "react-hook-form"


import type { AppModule } from "@/features/modules/app_module/data/schema"
import type { AppModuleFeatureForm } from "../../types/types"

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
    form: UseFormReturn<AppModuleFeatureForm>;
    appModules: AppModule[];
}
export const AppModuleCombobox = ({ form, appModules }: Props) => {

    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(form.getValues('appModuleId')?.toString())

    const handleSelect = (value: string) => {
        // form.setValue("party", partyLedgers.find((party) => party.id === Number(value)))
        const appModule = appModules.find((appModule) => appModule.id === Number(value))
        form.setValue("appModule", appModule)
        form.setValue("appModuleId", appModule?.id!)
        setValue(value)
        setOpen(false)
    }
    const frameworks = appModules
        ?.filter((appModule: AppModule) => appModule.status === 'active') // only active modules
        .map((appModule: AppModule) => ({
            label: capitalizeAllWords(appModule.name ?? ''), // capitalize each word
            value: String(appModule.id),
        }))


    return (
        <Popover open={open} onOpenChange={setOpen} modal={false}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {value
                        ? frameworks.find((framework) => framework.value === value)?.label
                        : "Select module..."}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="popover-content-width-same-as-trigger p-0">
                <Command className="rounded-lg border shadow-md min-w-full">
                    <CommandInput placeholder="Search module..." />
                    <CommandList className="max-h-64 overflow-y-auto">

                        <CommandEmpty>No module found.</CommandEmpty>
                        <CommandGroup className="overflow-y-auto">
                            {frameworks.map((framework) => (
                                <CommandItem
                                    className="min-w-full"
                                    key={framework.value}
                                    value={framework.label}
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
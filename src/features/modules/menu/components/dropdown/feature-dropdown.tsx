import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useQuery } from "@tanstack/react-query"
import { fetchAppModuleFeatureService } from "@/features/modules/app_module_feature/data/api"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import * as React from "react"
import type { UseFormReturn } from "react-hook-form"
import type { MenuForm } from "../../types/types"

type FormProps = {
    form: UseFormReturn<MenuForm>;
}

const FeatureDropdown = (props: FormProps) => {
    const { form } = props
    const { data: featuresData, isLoading } = useQuery({
        queryKey: ["appModuleFeatures"],
        queryFn: () => fetchAppModuleFeatureService(),
    })
    const features = featuresData?.data ?? []

    const [open, setOpen] = React.useState(false)
    const value = form.watch("appModuleFeatureId")?.toString()

    const handleSelect = (selectedValue: string) => {
        form.setValue("appModuleFeatureId", Number(selectedValue))
        setOpen(false)
    }

    if (isLoading) {
        return <div className="text-sm text-muted-foreground">Loading features...</div>
    }

    return (
        <FormField
            control={form.control}
            name={"appModuleFeatureId"}
            render={() => (
                <FormItem className="grid grid-cols-[110px_1fr] gap-1">
                    <FormLabel className="text-right">Feature</FormLabel>
                    <Popover open={open} onOpenChange={setOpen} modal={false}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-full justify-between"
                            >
                                {value
                                    ? features.find((f: any) => String(f.id) === value)?.name ?? "Select feature..."
                                    : "Select feature..."}
                                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="popover-content-width-same-as-trigger p-0">
                            <Command className="rounded-lg border shadow-md min-w-full">
                                <CommandInput placeholder="Search feature..." />
                                <CommandList className="max-h-64 overflow-y-auto">
                                    <CommandEmpty>No feature found.</CommandEmpty>
                                    <CommandGroup>
                                        {features.map((f: any) => (
                                            <CommandItem
                                                key={f.id}
                                                value={f.name}
                                                onSelect={() => handleSelect(String(f.id))}
                                            >
                                                <CheckIcon
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        value === String(f.id) ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                <span className="font-medium">{f.name}</span>
                                                <span className="ml-2 text-xs text-muted-foreground font-mono">{f.code}</span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    <FormMessage className="col-start-3" />
                </FormItem>
            )}
        />
    )
}

export default FeatureDropdown

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





import { DeliveryVehicleTypes, type DeliveryVehicleForm, type DeliveryVehicleType } from "../data/schema"





interface Props {
    form: UseFormReturn<DeliveryVehicleForm>;
}
export const VehicleTypeSelector = ({ form }: Props) => {
    // const focusNext = useFocusNext();
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(form.getValues('vehicleType')?.toString())


    const deliveryVehicleTypeOptions: readonly DeliveryVehicleType[] = DeliveryVehicleTypes;
    const handleSelect = (value: string) => {

        form.setValue('vehicleType', value)
        setValue(value)
        setOpen(false)
        // focusNext();
    }

    const handleBlur = () => {
        if (value === null || value === undefined || value === '') {


            setOpen(true);
        }
    }
    const frameworks = deliveryVehicleTypeOptions.map((type: DeliveryVehicleType) => ({
        label: capitalizeAllWords(type),
        value: type,
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
                        : "Select vehicle type..."}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </SheetTrigger>
            <SheetContent className="sheet-content-width-same-as-trigger p-0">
                <SheetHeader>
                    <SheetTitle>Search Vehicle Type</SheetTitle>
                    <SheetDescription>
                        Select the vehicle type for this delivery vehicle.
                    </SheetDescription>
                </SheetHeader>
                <Command className="rounded-lg border shadow-md min-w-full">

                    <CommandInput placeholder="Search vehicle type..." />
                    <CommandList className=" max-h-full">
                        <CommandEmpty>No vehicle type found.</CommandEmpty>
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
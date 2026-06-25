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



import type { VoucherDispatchDetailForm } from "@/features/modules/voucher/data-schema/voucher-schema"

import { deliveryVehicleQueryOptions } from "@/features/modules/delivery_vehicle/data/queryOptions"
import type { DeliveryVehicle } from "@/features/modules/delivery_vehicle/data/schema"



interface Props {
    form: UseFormReturn<VoucherDispatchDetailForm>;
    name: keyof VoucherDispatchDetailForm;
}
export const DeliveryVehicleSelector = ({ form, name }: Props) => {
    const lastKeyRef = React.useRef<string | null>(null);
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(form.getValues(name)?.toString())

    const carrierName = form.watch('carrierName');


    const { data: deliveryVehicles } = useSuspenseQuery(deliveryVehicleQueryOptions())

    const deliveryVehiclesFiltered = React.useMemo(() => {
        if (!carrierName) return [];
        return deliveryVehicles.data?.filter((deliveryVehicle: DeliveryVehicle) => deliveryVehicle.transporter?.name === carrierName);
    }, [carrierName, deliveryVehicles]);

    const handleSelect = (value: string) => {
        if (!value) {
            setOpen(true);
            return;
        }
        const selectedVehicle = deliveryVehiclesFiltered?.find((deliveryVehicle: DeliveryVehicle) => deliveryVehicle.vehicleNumber === value);
        if (!selectedVehicle) {
            setOpen(true);
            return;
        }
        const rateValue = selectedVehicle.rate;
        const sourceValue = selectedVehicle.sourcePlace?.name;
        const destinationValue = selectedVehicle.destinationPlace?.name;


        // Atomic update
        form.reset(
            {
                ...form.getValues(),
                [name]: value,
                rate: rateValue,
                source: sourceValue,
                destination: destinationValue,
                freightCharges: 0,
                totalFare: 0,
                dispatchedThrough: 'Truck',
            },
            { keepDirty: true }
        );

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

    const frameworks = deliveryVehiclesFiltered?.map((deliveryVehicle: DeliveryVehicle) => ({
        label: deliveryVehicle.vehicleNumber!,
        value: deliveryVehicle.vehicleNumber!,
    }))



    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full    justify-between"
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                >
                    {value
                        ? frameworks.find((framework: { value: string }) => framework.value === value)?.label
                        : "Select vehicle..."}
                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </SheetTrigger>
            <SheetContent className="w-1/4 sm:max-w-none p-0">
                <SheetHeader>
                    <SheetTitle>Search {capitalizeAllWords(name)} Vehicle</SheetTitle>
                    <SheetDescription>
                        Select the {capitalizeAllWords(name)} vehicle for this Freight.
                    </SheetDescription>
                </SheetHeader>
                <Command className="rounded-lg border shadow-md min-w-full">

                    <CommandInput placeholder="Search vehicle..." />
                    <CommandList className=" max-h-full">
                        <CommandEmpty>No vehicle found.</CommandEmpty>
                        <CommandGroup>
                            {frameworks.map((framework: { label: string; value: string }) => (
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
            </SheetContent>
        </Sheet>
    )
}
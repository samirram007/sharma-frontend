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




import { deliveryRouteQueryOptions } from "@/features/modules/delivery_route/data/queryOptions"
import type { DeliveryRoute } from "@/features/modules/delivery_route/data/schema"
import type { VoucherDispatchDetailForm } from "@/features/modules/voucher/data-schema/voucher-schema"


interface Props {
    form: UseFormReturn<VoucherDispatchDetailForm>;
    name: keyof VoucherDispatchDetailForm;
}
export const DestinationPlaceSelector = ({ form, name }: Props) => {
    // const focusNext = useFocusNext();
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(form.getValues(name)?.toString())
    const carrierName = form.watch('carrierName');
    const source = form.watch('source');
    const vehicleNo = form.watch('motorVehicleNo');
    const { data: destinationPlaces } = useSuspenseQuery(deliveryRouteQueryOptions())

    const destinationPlacesFiltered = React.useMemo(() => {
        if (!carrierName) return [];
        if (!source && !vehicleNo) return destinationPlaces.data;
        if (source && !vehicleNo) {
            return destinationPlaces.data?.filter((destinationPlace: DeliveryRoute) => destinationPlace.sourcePlace?.name === source && destinationPlace.transporter?.name === carrierName);
        }
        if (!source && vehicleNo) {
            return destinationPlaces.data?.filter((destinationPlace: DeliveryRoute) => destinationPlace.vehicleNo === vehicleNo && destinationPlace.transporter?.name === carrierName);
        }
        return destinationPlaces.data?.filter((destinationPlace: DeliveryRoute) => destinationPlace.transporter?.name === carrierName);
    }, [carrierName, destinationPlaces]);

    const handleSelect = (value: string) => {
        if (!value) {
            setOpen(true);
            return;
        }

        const rateValue =
            destinationPlacesFiltered?.find((deliveryRoute: DeliveryRoute) => {
                if (deliveryRoute.destinationPlace?.name !== value) return false;

                if (source && vehicleNo) {
                    return (
                        deliveryRoute.sourcePlace?.name === source &&
                        deliveryRoute.vehicleNo === vehicleNo
                    );
                }

                if (source) {
                    return deliveryRoute.sourcePlace?.name === source;
                }

                if (vehicleNo) {
                    return deliveryRoute.vehicleNo === vehicleNo;
                }

                return true;
            })?.rate ?? 0;

        // Atomic update
        form.reset(
            {
                ...form.getValues(),
                [name]: value,
                rate: rateValue,
                freightCharges: 0,
                totalFare: 0,
                dispatchedThrough: carrierName,
            },
            { keepDirty: true }
        );

        setValue(value);
        setOpen(false);
    };

    const handleBlur = () => {
        if (!value) {
            setOpen(true);
        }
    };
    const frameworks = destinationPlacesFiltered?.map((destinationPlace: DeliveryRoute) => ({
        label: destinationPlace.destinationPlace?.name!,
        value: destinationPlace.destinationPlace?.name!.toString(),
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
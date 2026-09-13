'use client'

import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import * as React from 'react'

import { useSuspenseQuery } from '@tanstack/react-query'
import type { UseFormReturn } from 'react-hook-form'
import type { VoucherDispatchDetailForm } from '../../../data-schema/voucher-schema'
import type { DeliveryRoute } from '@/features/modules/delivery_route/data/schema'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { capitalizeAllWords } from '@/utils/removeEmptyStrings'

import { deliveryRouteQueryOptions } from '@/features/modules/delivery_route/data/queryOptions'

interface Props {
  form: UseFormReturn<VoucherDispatchDetailForm>
  name: keyof VoucherDispatchDetailForm
}
export const DestinationPlaceSelector = ({ form, name }: Props) => {
  // const focusNext = useFocusNext();
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(form.getValues(name)?.toString())
  const carrierName = form.watch('carrierName')
  const source = form.watch('source')
  const vehicleNo = form.watch('motorVehicleNo')

  // Keep the button label in sync with the form: the dialog re-uses this
  // component across rows and the saved destination can arrive after mount
  // (or be set by other selectors) — without this it shows "Select place…"
  // even when a destination is stored.
  React.useEffect(() => {
    const formValue = form.getValues(name)?.toString() ?? ''
    setValue(formValue)
  }, [form, name, open])
  const { data: destinationPlaces } = useSuspenseQuery(
    deliveryRouteQueryOptions(),
  )

  const destinationPlacesFiltered = React.useMemo(() => {
    // The carrier filter always applies; source/vehicle narrow it further.
    if (!carrierName) return []
    if (source && vehicleNo) {
      return destinationPlaces.data?.filter(
        (destinationPlace: DeliveryRoute) =>
          destinationPlace.transporter?.name === carrierName &&
          destinationPlace.sourcePlace?.name === source &&
          destinationPlace.vehicleNo === vehicleNo,
      )
    }
    if (source) {
      return destinationPlaces.data?.filter(
        (destinationPlace: DeliveryRoute) =>
          destinationPlace.transporter?.name === carrierName &&
          destinationPlace.sourcePlace?.name === source,
      )
    }
    if (vehicleNo) {
      return destinationPlaces.data?.filter(
        (destinationPlace: DeliveryRoute) =>
          destinationPlace.transporter?.name === carrierName &&
          destinationPlace.vehicleNo === vehicleNo,
      )
    }
    return destinationPlaces.data?.filter(
      (destinationPlace: DeliveryRoute) =>
        destinationPlace.transporter?.name === carrierName,
    )
  }, [carrierName, source, vehicleNo, destinationPlaces])

  const handleSelect = (selectedName: string) => {
    if (!selectedName) {
      setOpen(true)
      return
    }

    const rateValue =
      destinationPlacesFiltered?.find((deliveryRoute: DeliveryRoute) => {
        if (deliveryRoute.destinationPlace?.name !== selectedName) return false

        if (source && vehicleNo) {
          return (
            deliveryRoute.sourcePlace?.name === source &&
            deliveryRoute.vehicleNo === vehicleNo
          )
        }

        if (source) {
          return deliveryRoute.sourcePlace?.name === source
        }

        if (vehicleNo) {
          return deliveryRoute.vehicleNo === vehicleNo
        }

        return true
      })?.rate ?? 0

    // Targeted update — a form.reset() here reset freightCharges/totalFare to
    // 0 (wiping the fare the Freight Calculator had computed) and overwrote
    // "Dispatched Through" with the transporter's name. The rate from the
    // selected route still pre-fills; the calculator recomputes the fare.
    form.setValue(name, selectedName, { shouldDirty: true })
    form.setValue('rate', rateValue, { shouldDirty: true })

    setValue(selectedName)
    setOpen(false)
  }

  const handleBlur = () => {
    if (!value) {
      setOpen(true)
    }
  }
  const frameworks = destinationPlacesFiltered?.map(
    (destinationPlace: DeliveryRoute) => ({
      label: destinationPlace.destinationPlace?.name!,
      value: destinationPlace.destinationPlace?.name!.toString(),
    }),
  )

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
            ? frameworks.find(
                (framework: { value: string }) => framework.value === value,
              )?.label
            : 'Select place...'}
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
                      'mr-2 h-4 w-4',
                      value === framework.value ? 'opacity-100' : 'opacity-0',
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

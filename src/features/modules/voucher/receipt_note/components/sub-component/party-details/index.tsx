import FormInputField from "@/components/form-input-field"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { useFocusArea } from "@/core/hooks/useFocusArea"
import { useRestrictFocusToRef } from "@/core/hooks/useRestrictFocusToRef"
import { cn } from "@/lib/utils"
import { Loader } from "lucide-react"
import { Suspense, useEffect, useRef, useState } from "react"
import { useForm, useFormContext } from "react-hook-form"
import { toast } from "sonner"
import type { ReceiptNoteForm } from "../../../data/schema"
import type { PartyForm } from "@/features/modules/voucher/data-schema/voucher-schema"
import { GstRegistrationTypeCombobox } from "./gst-registration-type"
import { PlaceOfSupplyCombobox } from "./place-of-supply"
import { StateCombobox } from "./state"


const PartyDetails = () => {
    const partyRef = useRef<HTMLDivElement>(null);
    const form = useFormContext<ReceiptNoteForm>();
    useFocusArea(partyRef as React.RefObject<HTMLElement>);
    useRestrictFocusToRef(partyRef as React.RefObject<HTMLElement>);


    const [open, onOpenChange] = useState(false);
    const gapClass = 'grid grid-cols-[200px_1fr] gap-4';
    const partyForm = useForm<PartyForm>({
        defaultValues: form.watch("party") || undefined,
    });

    const handleOnClick = () => {
        form.setValue("party", partyForm.getValues())
        toast.message("Party details updated")
        onOpenChange(false)
    }

    // Sync parent → child form values
    useEffect(() => {
        const partyData = form.watch("party");
        if (partyData) {
            partyForm.reset(partyData);
        }
    }, [form.watch("party")]);

    return (
        <Suspense fallback={<Loader className="animate-spin" />}>

            <Dialog open={open}
                onOpenChange={(state) => {

                    onOpenChange(state)
                }} >
                <DialogTrigger asChild>
                    <Button variant="outline" size={'sm'} className="py-1! focus:bg-black focus:text-white">Party Details</Button>
                </DialogTrigger>
                <DialogContent className='sm:max-w-[64rem]'>
                    <DialogHeader className='text-left border-b-2 pb-2'>
                        <DialogTitle>Party Details</DialogTitle>
                        <DialogDescription>
                            Click Save changes to save your party details.
                        </DialogDescription>
                    </DialogHeader>
                    <div ref={partyRef} className='-mr-4 h-full w-full  overflow-y-auto py-1 pr-4'>
                        <Form {...partyForm}>
                            <div className="flex flex-col justify-between gap-12 ">

                                <div className="space-y-2">


                                    <FormInputField type='text' autoFocus={true} gapClass={gapClass} form={partyForm} name='name' label='Name' />
                                    <FormInputField type='text' gapClass={gapClass} form={partyForm} name='mailingName' label='Mailing Name' />
                                    <FormInputField type='text' gapClass={gapClass} form={partyForm} name='line1' label='Address Line1' />
                                    <FormInputField type='text' gapClass={gapClass} form={partyForm} name='line2' label='Address Line2' />
                                    <FormInputField type='text' gapClass={gapClass} form={partyForm} name='line3' label='Address Line3' />
                                    <div className={gapClass}>
                                        <Label
                                            htmlFor=""
                                            className="  text-sm font-medium text-gray-700 mb-1"
                                        >
                                            State
                                        </Label>
                                        <div className="">

                                            <StateCombobox form={partyForm} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">

                                    <div className={gapClass}>
                                        <Label
                                            htmlFor=""
                                            className="  text-sm font-medium text-gray-700 mb-1"
                                        >
                                            GST Registration Type
                                        </Label>
                                        <div className=" ">

                                            <GstRegistrationTypeCombobox form={partyForm} />
                                        </div>
                                    </div>
                                    <FormInputField type='text' gapClass={gapClass} form={partyForm} name='gstin' label='GSTIN' />
                                    <div className={cn(gapClass)}>
                                        <Label
                                            htmlFor=""
                                            className="  text-sm font-medium text-gray-700 mb-1"
                                        >
                                            Place of Supply
                                        </Label>
                                        <div className="">
                                            <PlaceOfSupplyCombobox form={partyForm} />

                                        </div>
                                    </div>

                                </div>

                            </div>



                        </Form>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleOnClick} className="h-8 focus:bg-black focus:text-white"  >
                            Save changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </Suspense>

    )
}

export default PartyDetails
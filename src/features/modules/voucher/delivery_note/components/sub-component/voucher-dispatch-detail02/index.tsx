import FormInputField from "@/components/form-input-field"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Loader } from "lucide-react"
import { Suspense, useEffect, useRef, useState } from "react"
import { useForm, type Resolver, type UseFormReturn } from "react-hook-form"
import { toast } from "sonner"


import { zodResolver } from "@hookform/resolvers/zod"


import { TransporterSelector } from "./transporter-selector"
import { BillingPreferenceSelector } from "./billing-preference-selector"
import { FreightCalculator } from "@/features/modules/voucher/freight/components/shared/freight-calculator"

import { PrimaryButtons as CreateTransporterButton } from "@/features/modules/transporter/components/primary-buttons"
import { PrimaryButtons as CreateVehicleButton } from "@/features/modules/delivery_vehicle/components/primary-buttons"
import { DeliveryVehicleSelector } from "./delivery-vehicle-selector"
import { voucherDispatchDetailSchema, type VoucherDispatchDetailForm } from "@/features/modules/voucher/data-schema/voucher-schema"
import { useDeliveryNote } from "../../../contexts/delivery_note-context"
import type { DeliveryNoteForm } from "../../../data/schema"


type VoucherDispatchDetailFormProps = {
    form: UseFormReturn<DeliveryNoteForm>
}

const VoucherDispatchDetail02 = (props: VoucherDispatchDetailFormProps) => {
    const { form } = props
    const dispatchRef = useRef<HTMLDivElement>(null);
    const { config } = useDeliveryNote();




    const [open, onOpenChange] = useState(false);
    const gapClass01 = 'grid grid-cols-[100px_220px] gap-4';
    const gapClass02 = 'grid grid-cols-[200px_220px] gap-4';
    // const gapClass03 = 'grid grid-cols-[80px_100px] gap-4';
    const gapClass04 = 'grid grid-cols-[100px_200px] gap-4';
    const gapClass = 'grid grid-cols-[200px_1fr] gap-4';

    const voucherDispatchForm = useForm<VoucherDispatchDetailForm>({
        resolver: zodResolver(voucherDispatchDetailSchema) as Resolver<VoucherDispatchDetailForm>,
        mode: 'onChange',
        defaultValues: form.getValues('voucherDispatchDetail') || undefined,
    })

    // console.log("##", weight, voucherDispatchForm.watch())

    const handleOnClick = () => {
        const isValid = voucherDispatchForm.trigger();
        if (!isValid) {
            toast.message("Please fill all required fields")
            return;
        }
        // const dispatchData = voucherDispatchForm.getValues();
        // if (!dispatchData.totalFare || dispatchData.totalFare <= 0) {
        //     toast.message("Total fare must be greater than zero")
        //     return;
        // }

        form.setValue("voucherDispatchDetail", voucherDispatchForm.getValues())
        toast.message("Dispatch details updated")
        onOpenChange(false)
    }

    return (
        <Suspense fallback={<Loader className="animate-spin" />}>
            <Dialog open={open}
                onOpenChange={(state) => {

                    onOpenChange(state)
                }} >
                <DialogTrigger asChild>
                    <Button type="button" variant="outline" size={'sm'} className="w-[150px] py-1! px-2! focus:bg-black focus:text-white" title='Dispatch Details'  >Dispatch Details</Button>

                </DialogTrigger>
                <DialogContent className='sm:max-w-5xl'>
                    <DialogHeader className='text-left border-b-2 pb-2'>
                        <VisuallyHidden>
                            <DialogTitle>Dispatch Details </DialogTitle>
                        </VisuallyHidden>
                        <DialogDescription>
                            Click Save changes to save your dispatch details.
                        </DialogDescription>
                    </DialogHeader>
                    <div ref={dispatchRef} className='-mr-4 h-full w-full  overflow-y-auto py-1 pr-4'>
                        <Form {...voucherDispatchForm}>
                            <div className="flex flex-col justify-between gap-4 ">
                                {config.map((item) => item.key === 'order_details' && item.value && (


                                    <div key={item.key} className="space-y-2 border-b-2 pb-2">
                                        <div className="text-center underline">Order Details</div>
                                        <div className="grid grid-cols-2 gap-12">
                                            <div>
                                                <FormInputField type='text' gapClass={gapClass01} form={voucherDispatchForm} name='orderNumber' label='Order Number' />

                                            </div>
                                            <div className="space-y-2">
                                                <FormInputField type='text' gapClass={gapClass} form={voucherDispatchForm} name='paymentTerms' label='Mode/terms of Payment' />
                                                <FormInputField type='text' gapClass={gapClass} form={voucherDispatchForm} name='otherReferences' label='Other references' />
                                                <FormInputField type='text' gapClass={gapClass} form={voucherDispatchForm} name='termsOfDelivery' label='Terms of Delivery' />
                                            </div>
                                        </div>

                                    </div>
                                ))}

                                {config.map((item) => item.key === 'receipt_details' && item.value && (

                                    <div key={item.key} className="space-y-2  pt-1">
                                        <div className="text-center underline">Receipt Details</div>
                                        <div className="grid grid-cols-1 gap-12">
                                            <div className="space-y-2">
                                                <FormInputField type='text' gapClass={gapClass02} form={voucherDispatchForm} name='receiptDocNo' label='Receipt Doc No' />
                                                <FormInputField type='text' gapClass={gapClass02} form={voucherDispatchForm} name='dispatchedThrough' label='Dispatched Through' />
                                                <FormInputField type='text' gapClass={gapClass02} form={voucherDispatchForm} name='source' label='Source' />
                                                <div className="grid grid-cols-[1fr_1fr] gap-12">
                                                    <FormInputField type='text' gapClass={gapClass02} form={voucherDispatchForm} name='destination' label='Destination(A)' />
                                                    <FormInputField type='text' gapClass={gapClass02} form={voucherDispatchForm} name='destinationSecondary' label='Destination(B)' />
                                                </div>
                                                <div className="grid grid-cols-[1fr_1fr] gap-12">
                                                    <div className="grid grid-cols-[200px_220px_50px] items-center gap-4">

                                                        <Label>Transporter</Label>

                                                        <TransporterSelector name='carrierName' form={voucherDispatchForm} />
                                                        <CreateTransporterButton type="icon" isModal={true} />
                                                    </div>
                                                    <div>
                                                        <div className="hidden">

                                                            <FormInputField type='text' gapClass={gapClass02} form={voucherDispatchForm} name='carrierName' label='Transporter' />
                                                        </div>
                                                    </div>
                                                </div>



                                                <div className="grid grid-cols-[1fr_1fr] gap-12">
                                                    <div className="grid grid-cols-[200px_220px_50px] items-center gap-4">

                                                        <Label>Vehicle No</Label>
                                                        <DeliveryVehicleSelector name='motorVehicleNo' form={voucherDispatchForm} />

                                                        <CreateVehicleButton type="icon" isModal={true} />
                                                    </div>
                                                    <div>
                                                        <div className="hidden">

                                                            <FormInputField type='text' gapClass={gapClass02} form={voucherDispatchForm} name='motorVehicleNo' label='Motor Vehicle No' />
                                                        </div>
                                                    </div>
                                                </div>


                                                <div className="grid grid-cols-[1fr_1fr] gap-12">

                                                    <FormInputField type='text' gapClass={gapClass02} form={voucherDispatchForm} name='billOfLadingNo' label='Bill of Lading/LR-RR No' />

                                                    <div className={gapClass04}>

                                                        <Label>Date:</Label>
                                                        <DateBox tabIndex={1}
                                                            form={voucherDispatchForm} name="billOfLadingDate" />
                                                    </div>
                                                </div>

                                                <BillingPreferenceSelector name='billingPreference' form={voucherDispatchForm} gapClass={gapClass02}
                                                    label='Billing Preference' />

                                            </div>

                                        </div>

                                    </div>
                                ))}
                                {config.find((item) => item.key === 'freight_details')?.value && (
                                    <div className="space-y-2 border-t-2 pt-2">
                                        <FreightCalculator form={voucherDispatchForm} />
                                    </div>
                                )}
                            </div>



                        </Form>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleOnClick} className="h-8 focus:bg-black focus:text-white"  >
                            Continue
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </Suspense>
    )
}

export default VoucherDispatchDetail02

type DateBoxProps = {
    form: UseFormReturn<VoucherDispatchDetailForm>,

    name: keyof VoucherDispatchDetailForm
    tabIndex?: number
}

const DateBox = (props: DateBoxProps) => {
    const { form, name, } = props;
    const [displayValue, setDisplayValue] = useState<string | null>("");

    const parseAndFormatDate = (input: string): Date | null => {
        if (!input) return null;

        const now = new Date();
        const parts = input.split(/[./-]/).map(p => p.trim());

        let day = Number(parts[0]);
        let month = parts[1] ? Number(parts[1]) - 1 : now.getMonth(); // month index
        let year =
            parts[2] && parts[2].length === 2
                ? 2000 + Number(parts[2])
                : parts[2]
                    ? Number(parts[2])
                    : now.getFullYear();

        if (isNaN(day) || day < 1 || day > 31) return null;
        if (isNaN(month) || month < 0 || month > 11) return null;
        if (isNaN(year) || year < 1000) return null;

        return new Date(year, month, day);
    };
    const parseDate = () => {
        const parsed = parseAndFormatDate(displayValue!);
        if (parsed) {
            form.setValue(name, parsed, { shouldValidate: true, shouldDirty: true });
            const formatted = parsed.toLocaleDateString("en-GB").replace(/\//g, '-'); // DD/MM/YYYY
            setDisplayValue(formatted);
            const DBFormat = `${parsed.getFullYear()}-${(parsed.getMonth() + 1).toString().padStart(2, '0')}-${parsed.getDate().toString().padStart(2, '0')}`
            form.setValue(name, DBFormat, { shouldValidate: true, shouldDirty: true });
        }
    }
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();

            parseDate();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        if (e.target.value === '') {
            setDisplayValue("");
            form.setValue(name, null, { shouldValidate: true, shouldDirty: true });
            return;
        }
        setDisplayValue(e.target.value);

    };
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        e.preventDefault();

        parseDate();
        // if (parsed) {
        //     form.setValue(name, parsed, { shouldValidate: true, shouldDirty: true });
        //     const formatted = parsed.toLocaleDateString("en-GB").replace(/\//g, '-'); // DD/MM/YYYY
        //     setDisplayValue(formatted);
        //     const DBFormat = `${parsed.getFullYear()}-${(parsed.getMonth() + 1).toString().padStart(2, '0')}-${parsed.getDate().toString().padStart(2, '0')}`
        //     form.setValue(name, DBFormat, { shouldValidate: true, shouldDirty: true });
        // }
    };



    useEffect(() => {
        const formValue = form.watch(name);
        if (formValue) {
            let parsed: Date;

            if (typeof formValue === "string" || typeof formValue === "number") {
                parsed = new Date(formValue);
            } else if (formValue instanceof Date) {
                parsed = formValue;
            } else {
                return; // not a valid date type
            }

            if (!isNaN(parsed.getTime())) {
                const formatted = parsed.toLocaleDateString("en-GB").replace(/\//g, "-");
                setDisplayValue(formatted);
            }
        } else {
            setDisplayValue("");
        }
        parseDate();
    }, [form.watch(name)]);


    return (
        <>
            {/* {form.watch(name)} {displayValue} */}
            <Input
                type="text"
                placeholder="__-__-____"
                value={displayValue!}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
            />
            <span className="hidden">

                <FormInputField type='date' form={form}
                    label=''
                    noLabel
                    gapClass="grid-cols-[1fr] gap-0  "
                    name={name} />
            </span>
        </>
    )
}



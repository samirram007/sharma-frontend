import { Calculator, FileText, LayoutGrid, List, Loader, MapPin, Truck, Info, Settings } from "lucide-react"
import { Suspense, useEffect, useRef, useState } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useVoucherDispatchDetailMutation } from "../../data/queryOptions"
import { voucherDispatchDetailSchema } from "../../../data-schema/voucher-schema"
import { useFreight } from "../../contexts/freight-context"
import { TransporterSelector } from "./transporter-selector"
import { BillingPreferenceSelector } from "./billing-preference-selector"
import { DeliveryVehicleSelector } from "./delivery-vehicle-selector"
import type { Resolver, UseFormReturn } from "react-hook-form"
import type { VoucherDispatchDetailForm } from "../../../data-schema/voucher-schema"
import type { FreightForm } from "../../data/schema"
import FormInputField from "@/components/form-input-field"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Label } from "@/components/ui/label"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"

import { SectionCard, FreightCalculator, DateBox } from "../shared/freight-calculator"


import { PrimaryButtons as CreateTransporterButton } from "@/features/modules/transporter/components/primary-buttons"
import { PrimaryButtons as CreateVehicleButton } from "@/features/modules/delivery_vehicle/components/primary-buttons"

type VoucherDispatchDetailFormProps = {
    form: UseFormReturn<FreightForm>
    voucherDispatchDefaultValues: VoucherDispatchDetailForm
}

const VoucherDispatchDetail02 = (props: VoucherDispatchDetailFormProps) => {
    const { form, voucherDispatchDefaultValues } = props
    const { mutate: saveVoucherDispatchDetail, isPending } = useVoucherDispatchDetailMutation();
    const dispatchRef = useRef<HTMLDivElement>(null);
    const { config, updateConfig } = useFreight();

    const [open, onOpenChange] = useState(false);
    const [viewMode, setViewMode] = useLocalStorage<'tabbed' | 'single'>('dispatchViewMode', 'tabbed');
    const gapClass01 = 'sm:grid-cols-[140px_minmax(0,1fr)]';
    const leftFieldClass = 'sm:grid-cols-[180px_minmax(0,1fr)]';
    const gapClass02 = leftFieldClass;
    const gapClass = 'sm:grid-cols-[220px_minmax(0,1fr)]';
    const pairRowClass = 'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6';
    const actionRowClass = 'grid w-full grid-cols-[180px_minmax(0,1fr)_42px] items-center gap-4';

    const [
        deliveryNoteId,
        freightBasis,
        weight,
        weightUnitId,
        rate,
        rateUnitId,
        source,
        dispatchSourceId
    ] = useWatch({
        control: form.control,
        name: [
            'deliveryNoteId',
            'freightBasis',
            'weight',
            'weightUnitId',
            'rate',
            'rateUnitId',
            'source',
            'dispatchSourceId'
        ],
    });

    const defaultValues = {
        ...voucherDispatchDefaultValues,
        voucherId: deliveryNoteId as number,
        freightBasis: freightBasis,
        weight: weight,
        weightUnitId: weightUnitId,
        rate: rate,
        rateUnitId: rateUnitId,
        source: source,
        dispatchSourceId: dispatchSourceId,
        billingPreference: 'advance' as const,
        transporter: '',
    }
    const voucherDispatchForm = useForm<VoucherDispatchDetailForm>({
        resolver: zodResolver(voucherDispatchDetailSchema) as Resolver<VoucherDispatchDetailForm>,
        defaultValues: defaultValues,
        mode: 'onBlur',
    });

    const handleOnClick = () => {
        const isValid = voucherDispatchForm.trigger();
        if (!isValid) {
            toast.message("Please fill all required fields")
            return;
        }
        const dispatchData = voucherDispatchForm.getValues();
        if (!dispatchData.totalFare || dispatchData.totalFare <= 0) {
            toast.message("Total fare must be greater than zero")
            return;
        }

        const sanitizedData = {
            ...dispatchData,
            id: dispatchData.id === null ? undefined : dispatchData.id,
            voucherId: dispatchData.voucherId === null ? undefined : dispatchData.voucherId?.toString(),
        };

        saveVoucherDispatchDetail(sanitizedData, {
            onSuccess: () => {
                toast.message("Dispatch details saved successfully");
                onOpenChange(false)
            },
            onError: (error) => {
                console.error("Failed to save dispatch details:", error);
                toast.message("Failed to save dispatch details");
            },
        });
    }
    useEffect(() => {
        // Never clobber in-dialog edits — e.g. a vehicle selection sets a
        // rate/source that intentionally differ from the parent form. Sync
        // only while the dialog is closed so reopening shows fresh data.
        if (open) return;

        const current = voucherDispatchForm.getValues();

        if (
            current.voucherId === deliveryNoteId &&
            current.weight === weight &&
            current.rate === rate &&
            current.weightUnitId === weightUnitId &&
            current.rateUnitId === rateUnitId &&
            current.freightBasis === freightBasis &&
            current.source === source
        ) {
            return;
        }

        voucherDispatchForm.reset({
            ...voucherDispatchDefaultValues,
            voucherId: deliveryNoteId as number,
            freightBasis,
            weight,
            weightUnitId,
            rate,
            rateUnitId,
            source,
        });
    }, [deliveryNoteId, freightBasis, weight, weightUnitId, rate, rateUnitId, source, open]);

    return (
        <Suspense fallback={<Loader className="animate-spin" />}>
            <Dialog open={open}
                onOpenChange={(state) => {
                    onOpenChange(state)
                }} >
                <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 min-w-0 rounded-lg border-slate-300 p-0 text-xs font-bold text-slate-600 shadow-xs transition-all hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100 dark:border-slate-600 dark:text-slate-400 dark:hover:border-blue-500 dark:hover:bg-blue-950/30 dark:hover:text-blue-400"
                      title="Dispatch Details"
                    >
                      D
                    </Button>
                </DialogTrigger>
                <DialogContent className='sm:max-w-4xl max-h-[85vh] overflow-hidden flex flex-col'>
                    <DialogHeader className="border-b border-slate-200 pb-3 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Truck className="h-5 w-5 text-blue-600" />
                                <DialogTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                                  Dispatch Details
                                </DialogTitle>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setViewMode('tabbed')}
                                    className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${viewMode === 'tabbed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                    title="Tabbed view"
                                >
                                    <LayoutGrid className="h-3.5 w-3.5" />
                                    Tabs
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setViewMode('single')}
                                    className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${viewMode === 'single' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                    title="Single page view"
                                >
                                    <List className="h-3.5 w-3.5" />
                                    All
                                </button>
                                <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <button
                                            type="button"
                                            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                                            title="Section visibility settings"
                                        >
                                            <Settings className="h-3.5 w-3.5" />
                                        </button>
                                    </PopoverTrigger>
                                    <PopoverContent align="end" className="w-56 p-3">
                                        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                            Section Visibility
                                        </h4>
                                        <div className="flex flex-col gap-2.5">
                                            <label className="flex items-center justify-between">
                                                <span className="text-sm text-slate-700 dark:text-slate-300">Order Details</span>
                                                <Switch
                                                    checked={!!config.find((c) => c.key === 'order_details')?.value}
                                                    onCheckedChange={(checked) => updateConfig('order_details', checked)}
                                                />
                                            </label>
                                            <label className="flex items-center justify-between">
                                                <span className="text-sm text-slate-700 dark:text-slate-300">Transport Details</span>
                                                <Switch
                                                    checked={!!config.find((c) => c.key === 'transport_details')?.value}
                                                    onCheckedChange={(checked) => updateConfig('transport_details', checked)}
                                                />
                                            </label>
                                            <label className="flex items-center justify-between">
                                                <span className="text-sm text-slate-700 dark:text-slate-300">Receipt Details</span>
                                                <Switch
                                                    checked={!!config.find((c) => c.key === 'receipt_details')?.value}
                                                    onCheckedChange={(checked) => updateConfig('receipt_details', checked)}
                                                />
                                            </label>
                                            <label className="flex items-center justify-between">
                                                <span className="text-sm text-slate-700 dark:text-slate-300">Freight Details</span>
                                                <Switch
                                                    checked={!!config.find((c) => c.key === 'freight_details')?.value}
                                                    onCheckedChange={(checked) => updateConfig('freight_details', checked)}
                                                />
                                            </label>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Fill in the dispatch and freight details below, then click Save to apply.
                        </p>
                    </DialogHeader>
                    <div ref={dispatchRef} className='flex-1 overflow-y-auto -mx-6 px-6 py-4'>
                        <Form {...voucherDispatchForm}>
                            {viewMode === 'tabbed' ? (
                                <Tabs defaultValue="dispatch-info" className="w-full">
                                    <TabsList className="mb-4 w-full justify-start gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800/60">
                                        <TabsTrigger value="dispatch-info" className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800">
                                            <Info className="h-3.5 w-3.5" />
                                            Dispatch Info
                                        </TabsTrigger>
                                        {config.find((c) => c.key === 'transport_details')?.value && (
                                            <TabsTrigger value="transport" className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800">
                                                <Truck className="h-3.5 w-3.5" />
                                                Transport
                                            </TabsTrigger>
                                        )}
                                        {config.find((c) => c.key === 'freight_details')?.value && (
                                            <TabsTrigger value="freight" className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-800">
                                                <Calculator className="h-3.5 w-3.5" />
                                                Freight
                                            </TabsTrigger>
                                        )}
                                    </TabsList>

                                    <TabsContent value="dispatch-info" className="mt-0 space-y-5">
                                        {config.find((c) => c.key === 'order_details')?.value && (
                                            <SectionCard icon={FileText} title="Order Details">
                                                <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                                                    <FormInputField type='text' gapClass={gapClass01} form={voucherDispatchForm} name='orderNumber' label='Order Number' />
                                                    <div className="space-y-3">
                                                        <FormInputField type='text' gapClass={gapClass} form={voucherDispatchForm} name='paymentTerms' label='Mode / Terms of Payment' />
                                                        <FormInputField type='text' gapClass={gapClass} form={voucherDispatchForm} name='otherReferences' label='Other References' />
                                                        <FormInputField type='text' gapClass={gapClass} form={voucherDispatchForm} name='termsOfDelivery' label='Terms of Delivery' />
                                                    </div>
                                                </div>
                                            </SectionCard>
                                        )}

                                        {config.find((c) => c.key === 'receipt_details')?.value && (
                                            <SectionCard icon={MapPin} title="Route & Documentation">
                                                <div className="space-y-4">
                                                    <div className={pairRowClass}>
                                                        <FormInputField type='text' gapClass={gapClass02} form={voucherDispatchForm} name='receiptDocNo' label='Receipt Doc No' />
                                                        <FormInputField type='text' gapClass={gapClass02} form={voucherDispatchForm} name='dispatchedThrough' label='Dispatched Through' />
                                                    </div>
                                                    <div className={pairRowClass}>
                                                        <FormInputField type='text' gapClass={gapClass02} form={voucherDispatchForm} name='source' label='Source' />
                                                        <FormInputField type='text' gapClass={gapClass02} form={voucherDispatchForm} name='destination' label='Destination' />
                                                    </div>
                                                    <div className={pairRowClass}>
                                                        <FormInputField type='text' gapClass={gapClass02} form={voucherDispatchForm} name='destinationSecondary' label='Destination (B)' />
                                                    </div>
                                                    <div className={pairRowClass}>
                                                        <FormInputField type='text' gapClass={gapClass02} form={voucherDispatchForm} name='billOfLadingNo' label='Bill of Lading / LR-RR No' />
                                                        <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                                                            <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Date:</Label>
                                                            <DateBox form={voucherDispatchForm} name="billOfLadingDate" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </SectionCard>
                                        )}
                                    </TabsContent>

                                    {config.find((c) => c.key === 'transport_details')?.value && (
                                        <TabsContent value="transport" className="mt-0 space-y-5">
                                            <SectionCard icon={Truck} title="Transport & Billing">
                                                <div className="space-y-4">
                                                    <div className={pairRowClass}>
                                                        <div className={actionRowClass}>
                                                            <Label className="whitespace-nowrap text-sm font-medium text-slate-600 dark:text-slate-400">Transporter</Label>
                                                            <TransporterSelector name='carrierName' form={voucherDispatchForm} />
                                                            <CreateTransporterButton type="icon" isModal={true} />
                                                        </div>
                                                        <div className={actionRowClass}>
                                                            <Label className="whitespace-nowrap text-sm font-medium text-slate-600 dark:text-slate-400">Vehicle No</Label>
                                                            <DeliveryVehicleSelector name='motorVehicleNo' form={voucherDispatchForm} />
                                                            <CreateVehicleButton type="icon" isModal={true} />
                                                        </div>
                                                    </div>
                                                    <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
                                                        <BillingPreferenceSelector name='billingPreference' form={voucherDispatchForm}
                                                            gapClass='grid grid-cols-[170px_275px] gap-4 sm:gap-6'
                                                            label='Billing Preference' />
                                                    </div>
                                                </div>
                                            </SectionCard>
                                        </TabsContent>
                                    )}

                                    {config.find((c) => c.key === 'freight_details')?.value && (
                                        <TabsContent value="freight" className="mt-0 space-y-5">
                                            <FreightCalculator form={voucherDispatchForm} />
                                        </TabsContent>
                                    )}
                                </Tabs>
                            ) : (
                                <div className="flex flex-col gap-5">
                                    {config.find((c) => c.key === 'order_details')?.value && (
                                        <SectionCard icon={FileText} title="Order Details">
                                            <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                                                <FormInputField type='text' gapClass={gapClass01} form={voucherDispatchForm} name='orderNumber' label='Order Number' />
                                                <div className="space-y-3">
                                                    <FormInputField type='text' gapClass={gapClass} form={voucherDispatchForm} name='paymentTerms' label='Mode / Terms of Payment' />
                                                    <FormInputField type='text' gapClass={gapClass} form={voucherDispatchForm} name='otherReferences' label='Other References' />
                                                    <FormInputField type='text' gapClass={gapClass} form={voucherDispatchForm} name='termsOfDelivery' label='Terms of Delivery' />
                                                </div>
                                            </div>
                                        </SectionCard>
                                    )}

                                    {config.find((c) => c.key === 'receipt_details')?.value && (
                                        <SectionCard icon={MapPin} title="Route & Documentation">
                                            <div className="space-y-4">
                                                <div className={pairRowClass}>
                                                    <FormInputField type='text' gapClass={gapClass02} form={voucherDispatchForm} name='receiptDocNo' label='Receipt Doc No' />
                                                    <FormInputField type='text' gapClass={gapClass02} form={voucherDispatchForm} name='dispatchedThrough' label='Dispatched Through' />
                                                </div>
                                                <div className={pairRowClass}>
                                                    <FormInputField type='text' gapClass={gapClass02} form={voucherDispatchForm} name='source' label='Source' />
                                                    <FormInputField type='text' gapClass={gapClass02} form={voucherDispatchForm} name='destination' label='Destination' />
                                                </div>
                                                <div className={pairRowClass}>
                                                    <FormInputField type='text' gapClass={gapClass02} form={voucherDispatchForm} name='destinationSecondary' label='Destination (B)' />
                                                </div>
                                                <div className={pairRowClass}>
                                                    <FormInputField type='text' gapClass={gapClass02} form={voucherDispatchForm} name='billOfLadingNo' label='Bill of Lading / LR-RR No' />
                                                    <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                                                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Date:</Label>
                                                        <DateBox form={voucherDispatchForm} name="billOfLadingDate" />
                                                    </div>
                                                </div>
                                            </div>
                                        </SectionCard>
                                    )}

                                    {config.find((c) => c.key === 'transport_details')?.value && (
                                        <SectionCard icon={Truck} title="Transport & Billing">
                                            <div className="space-y-4">
                                                <div className={pairRowClass}>
                                                    <div className={actionRowClass}>
                                                        <Label className="whitespace-nowrap text-sm font-medium text-slate-600 dark:text-slate-400">Transporter</Label>
                                                        <TransporterSelector name='carrierName' form={voucherDispatchForm} />
                                                        <CreateTransporterButton type="icon" isModal={true} />
                                                    </div>
                                                    <div className={actionRowClass}>
                                                        <Label className="whitespace-nowrap text-sm font-medium text-slate-600 dark:text-slate-400">Vehicle No</Label>
                                                        <DeliveryVehicleSelector name='motorVehicleNo' form={voucherDispatchForm} />
                                                        <CreateVehicleButton type="icon" isModal={true} />
                                                    </div>
                                                </div>
                                                <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
                                                    <BillingPreferenceSelector name='billingPreference' form={voucherDispatchForm}
                                                        gapClass='grid grid-cols-[170px_275px] gap-4 sm:gap-6'
                                                        label='Billing Preference' />
                                                </div>
                                            </div>
                                        </SectionCard>
                                    )}

                                    {config.find((c) => c.key === 'freight_details')?.value && (
                                        <FreightCalculator form={voucherDispatchForm} />
                                    )}
                                </div>
                            )}
                        </Form>
                    </div>
                    <DialogFooter className="border-t border-slate-200 px-6 py-3 dark:border-slate-700">
                        <Button
                          onClick={handleOnClick}
                          disabled={isPending || !voucherDispatchForm.watch('totalFare') || voucherDispatchForm.watch('totalFare')! <= 0}
                          className="h-9 rounded-lg bg-blue-600 px-5 text-xs font-medium text-white shadow-xs transition-all hover:bg-blue-700 hover:shadow-sm active:bg-blue-800 disabled:opacity-50"
                        >
                            {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </Suspense>
    )
}

export default VoucherDispatchDetail02
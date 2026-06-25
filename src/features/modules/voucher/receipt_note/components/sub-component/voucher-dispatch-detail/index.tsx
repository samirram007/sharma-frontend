import { Calculator, FileText, Info, LayoutGrid, List, Loader, MapPin, Settings, Truck } from "lucide-react"
import { Suspense, useEffect, useRef, useState } from "react"
import { useForm, useFormContext } from "react-hook-form"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { voucherDispatchDetailSchema, type VoucherDispatchDetailForm } from "@/features/modules/voucher/data-schema/voucher-schema"
import type { ReceiptNoteForm } from "../../../data/schema"
import FormInputField from "@/components/form-input-field"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"

import { SectionCard, FreightCalculator, DateBox } from "@/features/modules/voucher/freight/components/shared/freight-calculator"


const VoucherDispatchDetail = () => {
    const dispatchRef = useRef<HTMLDivElement>(null);
    const form = useFormContext<ReceiptNoteForm>();

    const [open, onOpenChange] = useState(false);
    const [viewMode, setViewMode] = useState<'tabbed' | 'single'>(
        () => (localStorage.getItem('dispatchViewMode') as 'tabbed' | 'single') || 'tabbed'
    );
    const CONFIG_STORAGE_KEY = 'dispatchSectionConfigReceipt';

    const defaultConfig: Array<{ key: string, value: boolean }> = [
        { key: 'order_details', value: false },
        { key: 'transport_details', value: true },
        { key: 'receipt_details', value: true },
        { key: 'freight_details', value: true },
    ];

    const [config, setConfig] = useState<Array<{ key: string, value: boolean }>>(() => {
        try {
            const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as Array<{ key: string, value: boolean }>;
                // Merge with defaults — keep any new keys that don't exist in stored
                const merged = defaultConfig.map(
                    (def) => parsed.find((p) => p.key === def.key) ?? def
                );
                return merged;
            }
        } catch {
            // localStorage unavailable or corrupt — fall through to defaults
        }
        return defaultConfig;
    });

    const updateConfig = (key: string, value: boolean) => {
        setConfig(prev => prev.map(item =>
            item.key === key ? { ...item, value } : item
        ))
    }

    // Persist config to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
        } catch {
            // silently ignore storage errors
        }
    }, [config]);

    const gapClass01 = 'sm:grid-cols-[140px_minmax(0,1fr)]';
    const gapClass02 = 'sm:grid-cols-[180px_minmax(0,1fr)]';
    const gapClass = 'sm:grid-cols-[220px_minmax(0,1fr)]';

    const voucherDisplayDispatchForm = useForm<VoucherDispatchDetailForm>({
        resolver: zodResolver(voucherDispatchDetailSchema) as any,
        defaultValues: form.watch("voucherDispatchDetail") || undefined,
    });

    const handleOnClick = () => {
        form.setValue("voucherDispatchDetail", voucherDisplayDispatchForm.getValues())
        toast.message("Dispatch details updated")
        onOpenChange(false)
    }

    useEffect(() => {
        localStorage.setItem('dispatchViewMode', viewMode);
    }, [viewMode]);

    // Sync parent → child form values
    useEffect(() => {
        const dispatchData = form.watch("voucherDispatchDetail");
        if (dispatchData) {
            voucherDisplayDispatchForm.reset(dispatchData);
        }
    }, [form.watch("voucherDispatchDetail")]);

    return (
        <Suspense fallback={<Loader className="animate-spin" />}>
            <Dialog open={open}
                onOpenChange={(state) => {
                    onOpenChange(state)
                }} >
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="py-1! px-2! focus:bg-black focus:text-white">
                        Receipt Details
                    </Button>
                </DialogTrigger>
                <DialogContent className='sm:max-w-4xl max-h-[85vh] overflow-hidden flex flex-col'>
                    <DialogHeader className="border-b border-slate-200 pb-3 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Truck className="h-5 w-5 text-blue-600" />
                                <DialogTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                                    Receipt Details
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
                            Fill in the receipt and dispatch details below, then click Save to apply.
                        </p>
                    </DialogHeader>
                    <div ref={dispatchRef} className='flex-1 overflow-y-auto -mx-6 px-6 py-4'>
                        <Form {...voucherDisplayDispatchForm}>
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
                                                    <FormInputField type='text' gapClass={gapClass01} form={voucherDisplayDispatchForm} name='orderNumber' label='Order Number' />
                                                    <div className="space-y-3">
                                                        <FormInputField type='text' gapClass={gapClass} form={voucherDisplayDispatchForm} name='paymentTerms' label='Mode / Terms of Payment' />
                                                        <FormInputField type='text' gapClass={gapClass} form={voucherDisplayDispatchForm} name='otherReferences' label='Other References' />
                                                        <FormInputField type='text' gapClass={gapClass} form={voucherDisplayDispatchForm} name='termsOfDelivery' label='Terms of Delivery' />
                                                    </div>
                                                </div>
                                            </SectionCard>
                                        )}

                                        {config.find((c) => c.key === 'receipt_details')?.value && (
                                            <SectionCard icon={MapPin} title="Route & Documentation">
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                                                        <FormInputField type='text' gapClass={gapClass02} form={voucherDisplayDispatchForm} name='receiptDocNo' label='Receipt Doc No' />
                                                        <FormInputField type='text' gapClass={gapClass02} form={voucherDisplayDispatchForm} name='dispatchedThrough' label='Dispatched Through' />
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                                                        <FormInputField type='text' gapClass={gapClass02} form={voucherDisplayDispatchForm} name='source' label='Source' />
                                                        <FormInputField type='text' gapClass={gapClass02} form={voucherDisplayDispatchForm} name='destination' label='Destination' />
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                                                        <FormInputField type='text' gapClass={gapClass02} form={voucherDisplayDispatchForm} name='billOfLadingNo' label='Bill of Lading / LR-RR No' />
                                                        <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                                                            <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Date:</Label>
                                                            <DateBox form={voucherDisplayDispatchForm} name="billOfLadingDate" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </SectionCard>
                                        )}
                                    </TabsContent>

                                    {config.find((c) => c.key === 'transport_details')?.value && (
                                        <TabsContent value="transport" className="mt-0 space-y-5">
                                            <SectionCard icon={Truck} title="Transport Details">
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                                                        <FormInputField type='text' gapClass={gapClass02} form={voucherDisplayDispatchForm} name='carrierName' label='Carrier / Transporter Name' />
                                                        <FormInputField type='text' gapClass={gapClass02} form={voucherDisplayDispatchForm} name='motorVehicleNo' label='Motor / Vehicle No' />
                                                    </div>
                                                </div>
                                            </SectionCard>
                                        </TabsContent>
                                    )}

                                    {config.find((c) => c.key === 'freight_details')?.value && (
                                        <TabsContent value="freight" className="mt-0 space-y-5">
                                            <FreightCalculator form={voucherDisplayDispatchForm} />
                                        </TabsContent>
                                    )}
                                </Tabs>
                            ) : (
                                <div className="flex flex-col gap-5">
                                    {config.find((c) => c.key === 'order_details')?.value && (
                                        <SectionCard icon={FileText} title="Order Details">
                                            <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                                                <FormInputField type='text' gapClass={gapClass01} form={voucherDisplayDispatchForm} name='orderNumber' label='Order Number' />
                                                <div className="space-y-3">
                                                    <FormInputField type='text' gapClass={gapClass} form={voucherDisplayDispatchForm} name='paymentTerms' label='Mode / Terms of Payment' />
                                                    <FormInputField type='text' gapClass={gapClass} form={voucherDisplayDispatchForm} name='otherReferences' label='Other References' />
                                                    <FormInputField type='text' gapClass={gapClass} form={voucherDisplayDispatchForm} name='termsOfDelivery' label='Terms of Delivery' />
                                                </div>
                                            </div>
                                        </SectionCard>
                                    )}

                                    {config.find((c) => c.key === 'receipt_details')?.value && (
                                        <SectionCard icon={MapPin} title="Route & Documentation">
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                                                    <FormInputField type='text' gapClass={gapClass02} form={voucherDisplayDispatchForm} name='receiptDocNo' label='Receipt Doc No' />
                                                    <FormInputField type='text' gapClass={gapClass02} form={voucherDisplayDispatchForm} name='dispatchedThrough' label='Dispatched Through' />
                                                </div>
                                                <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                                                    <FormInputField type='text' gapClass={gapClass02} form={voucherDisplayDispatchForm} name='source' label='Source' />
                                                    <FormInputField type='text' gapClass={gapClass02} form={voucherDisplayDispatchForm} name='destination' label='Destination' />
                                                </div>
                                                <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                                                    <FormInputField type='text' gapClass={gapClass02} form={voucherDisplayDispatchForm} name='billOfLadingNo' label='Bill of Lading / LR-RR No' />
                                                    <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                                                        <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Date:</Label>
                                                        <DateBox form={voucherDisplayDispatchForm} name="billOfLadingDate" />
                                                    </div>
                                                </div>
                                            </div>
                                        </SectionCard>
                                    )}

                                    {config.find((c) => c.key === 'transport_details')?.value && (
                                        <SectionCard icon={Truck} title="Transport Details">
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                                                    <FormInputField type='text' gapClass={gapClass02} form={voucherDisplayDispatchForm} name='carrierName' label='Carrier / Transporter Name' />
                                                    <FormInputField type='text' gapClass={gapClass02} form={voucherDisplayDispatchForm} name='motorVehicleNo' label='Motor / Vehicle No' />
                                                </div>
                                            </div>
                                        </SectionCard>
                                    )}

                                    {config.find((c) => c.key === 'freight_details')?.value && (
                                        <FreightCalculator form={voucherDisplayDispatchForm} />
                                    )}
                                </div>
                            )}
                        </Form>
                    </div>
                    <DialogFooter className="border-t border-slate-200 px-6 py-3 dark:border-slate-700">
                        <Button
                            onClick={handleOnClick}
                            className="h-9 rounded-lg bg-blue-600 px-5 text-xs font-medium text-white shadow-xs transition-all hover:bg-blue-700 hover:shadow-sm active:bg-blue-800"
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </Suspense>
    )
}

export default VoucherDispatchDetail
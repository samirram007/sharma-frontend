'use client'

import { Button } from '@/components/ui/button'
import {
    Form
} from '@/components/ui/form'


import FormInputField from '@/components/form-input-field'
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Route as StockItemRoute } from '@/routes/_protected/masters/inventory/_layout/stock_item/_layout'
import { lowerCase } from '@/utils/removeEmptyStrings'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { useForm, type Resolver, type UseFormReturn } from 'react-hook-form'
import { useStockItem } from '../contexts/stock_item-context'
import { useStockItemMutation } from '../data/queryOptions'
import { formSchema, type StockItem, type StockItemForm } from '../data/schema'
import AlternateStockUnitDropdown from './dropdown/alternate_stock_unit-dropdown'
import CostingMethodSelect from './dropdown/costing_method-select'
import MarketValuationMethodSelect from './dropdown/market_valuation_method-select'
import StockCategoryDropdown from './dropdown/stock_category-dropdown'
import StockGroupDropdown from './dropdown/stock_group-dropdown'
import StockUnitDropdown from './dropdown/stock_unit-dropdown'
import TypeOfSupplySelect from './dropdown/type_of_supply-select'
import UqcDropdown from './dropdown/uqc-dropdown'

interface Props {
    currentRow?: StockItem
}
interface FormProps {
    form: UseFormReturn<StockItemForm>
}

export function FormAction({ currentRow }: Props) {
    const isEdit = !!currentRow
    const navigate = useNavigate();

    const { mutate: saveStockItem, isPending } = useStockItemMutation()

    const form = useForm<StockItemForm>({
        resolver: zodResolver(formSchema) as Resolver<StockItemForm>,
        defaultValues: isEdit
            ? { ...currentRow, isEdit }
            : {
                name: '',
                code: '',
                printName: '',
                sku: '',
                articleNo: '',
                partNo: '',
                status: 'active',
                description: '',
                stockGroupId: 1,
                stockCategoryId: undefined,
                stockUnitId: undefined,
                alternateStockUnitId: undefined,
                baseUnitValue: undefined,
                alternateUnitValue: undefined,
                uniqueQuantityCodeId: undefined,
                typeOfSupply: undefined,
                isNegativeSalesAllow: false,
                isMaintainBatch: false,
                isMaintainSerial: false,
                useExpiryDate: false,
                trackManufacturingDate: false,
                isFinishGoods: true,
                isRawMaterial: false,
                isUnfinishedGoods: false,
                costingMethod: 'avg_cost',
                marketValuationMethod: 'avg_price',
                reorderLevel: 0,
                minimumStock: 0,
                maximumStock: 0,
                hasBom: false,
                isSalesAsNewManufacture: false,
                isPurchaseAsConsumed: false,
                isRejectionAsScrap: false,
                isGstApplicable: false,
                rateOfDuty: 0.00,
                hsnSacCode: '',
                isGstInclusive: false,
                gstType: undefined,
                brandId: undefined,
                mrp: 0,
                standardCost: 0,
                standardSellingPrice: 0,
                icon: '',

                isEdit,
            },
    })

    const gapClass = 'grid grid-cols-[200px_1fr]! gap-x-0   justify-start ' 

    const moduleName = "StockItem"
    const onSubmit = (values: StockItemForm) => {

        form.reset()
        saveStockItem(
            currentRow ? { ...values, id: currentRow.id! } : values,
            {
                onSuccess: () => {
                    navigate({ to: StockItemRoute.to, })
                },
            }
        )

    }


    return (


        <Dialog>
            <DialogHeader className='text-left'>
                <DialogTitle>{isEdit ? 'Edit ' : 'Add New '} {moduleName}</DialogTitle>
                <DialogDescription>
                    {isEdit ? `Update the ${lowerCase(moduleName)} here. `
                        : `Create new ${lowerCase(moduleName)} here. `}
                    Click save when you&apos;re done.
                </DialogDescription>
            </DialogHeader>

            <div className=' h-full w-full overflow-y-auto py-1 pr-4 '>
                <Form {...form}>
                    <form
                        id='user-form'
                        onSubmit={form.handleSubmit(onSubmit)}
                        className='space-y-4 p-0.5'
                    >
                        <div className="grid grid-cols-[1fr_20rem] gap-8 space-y-8 ">
                            <div className=" space-y-4 pr-20">


                                <FormInputField type='text' form={form} name='name' label='Name' />
                                <FormInputField type='text' form={form} name='code' label='Code' />
                                <FormInputField type='text' form={form} name='printName' label='Print Name' />
                            </div>
                            <div className=" space-y-4">
                                <FormInputField type='text' form={form} name='articleNo' label='Article No' />
                                <FormInputField type='text' form={form} name='partNo' label='Part No' />
                                <FormInputField type='text' form={form} name='sku' label='SKU' />
                            </div>
                        </div>
                        <div className=" grid grid-cols-[1fr_20rem] gap-8  space-y-2  ">
                            <FormInputField type='textarea' form={form} name='description' label='Description' />
                            <div className="col-span-1  md:col-span-1 space-y-4">

                            </div>
                        </div>
                        <div className=" grid grid-cols-[1fr_25rem_25rem] gap-8 border-y-2 border-solid border-gray-700  ">

                            <div className='space-y-2 pb-4'>
                                <div>General</div>
                                <StockGroupDropdown form={form} gapClass={gapClass} />
                                <StockCategoryDropdown form={form} gapClass={gapClass} />
                                <FormInputField type='hidden' form={form} name='brandId' label='Brand ID' />
                                <UnitManagement form={form} />
                                <div className='underline text-md font-bold'>Additional Details</div>
                                <RateManagement form={form} />

                                <BatchManagement form={form} />


                                <CostingMethodSelect form={form} gapClass={gapClass} />
                                <MarketValuationMethodSelect form={form} gapClass={gapClass} />
                            </div>
                            <div className='space-y-2 border-x-2 border-solid border-gray-700 px-4'>
                                <div>Tax Information</div>
                                <GstManagement form={form} />
                                <FormInputField type='text' gapClass='hidden' form={form} name='icon' label='Icon' />
                                <FormInputField type='checkbox' form={form} name='status' label='Status' options={[
                                    { label: 'Active', value: 'active' },
                                    { label: 'Inactive', value: 'inactive' },
                                ]} />
                            </div>
                            <div className='space-y-2'>
                                <div>Behaviour</div>
                                <UqcDropdown form={form} gapClass={gapClass} />
                                <TypeOfSupplySelect form={form} gapClass={gapClass} />


                                <FormInputField type='checkbox' form={form} name='isFinishGoods' label='Is Finish Goods' />
                                <FormInputField type='checkbox' form={form} name='isRawMaterial' label='Is Raw Material' />
                                <FormInputField type='checkbox' form={form} name='isUnfinishedGoods' label='Is Unfinished Goods' />

                                <FormInputField type='number' form={form} gapClass={gapClass} name='reorderLevel' label='Reorder Level' />
                                <FormInputField type='number' form={form} gapClass={gapClass} name='minimumStock' label='Minimum Stock' />
                                <FormInputField type='number' form={form} gapClass={gapClass} name='maximumStock' label='Maximum Stock' />
                                <FormInputField type='checkbox' form={form} name='isNegativeSalesAllow' label='Ignore negetive balances' />
                                <FormInputField type='checkbox' form={form} name='isSalesAsNewManufacture' label='Treat all sales as new manufacture' />
                                <FormInputField type='checkbox' form={form} name='isPurchaseAsConsumed' label='Treat all purchases as consumed' />
                                <FormInputField type='checkbox' form={form} name='isRejectionAsScrap' label='Treat all rejections inward as scrap' />
                            </div>


                        </div>
                        <OpeningBalanceManagement form={form} />
                    </form>
                </Form>
            </div>
            <div className='flex justify-center items-start pt-6 '>

                <DialogFooter>
                    <Button size={'lg'} type='submit' form='user-form' disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isPending ? "Saving..." : "Save changes"}
                    </Button>
                </DialogFooter>
                <div className='min-h-36'></div>
            </div>
        </Dialog>
    )
}


const OpeningBalanceManagement = ({ form }: FormProps) => {
    const { config } = useStockItem();
    return (
        <>
            {config.map((item) => item.key === 'opening_balance' && item.value && (
                <div className='opening-balance 
                border-b-2 border-amber-800
                grid grid-cols-5 px-[300px] gap-4 justify-center items-center pb-6'>
                            <div>Opening Balance</div>
                            <div>
                                <FormInputField type='number' form={form} gapClass={'grid grid-rows-2 grid-cols-1'} name='quantity' label='Quantity' />
                            </div>
                            <div>
                                <FormInputField type='number' form={form} gapClass={'grid grid-rows-2 grid-cols-1'} name='rate' label='Rate' />
                            </div>
                            <div>
                                <FormInputField type='number' form={form} gapClass={'grid grid-rows-2 grid-cols-1'} name='unit' label='per' />
                            </div>
                            <div>
                                <FormInputField type='number' form={form} gapClass={'grid grid-rows-2 grid-cols-1'} name='value' label='value' />
                            </div>

                        </div>
            ))}
        </>
    )
}

const BatchManagement = ({ form }: FormProps) => {
    const { config } = useStockItem();
    const isMaintainBatch = form.watch('isMaintainBatch')
    return (
        <>
            {config.map((item) => item.key === 'batch_serial' && item.value && (
                <div className='space-y-2'>
                    <FormInputField type='checkbox' form={form} name='isMaintainBatch' label='Maintain in batches' />
                    {isMaintainBatch &&
                        <div className='space-y-1 pl-4 pb-2'>
                            <FormInputField type='checkbox' form={form} name='useExpiryDate' label='Use expiry dates' />
                            <FormInputField type='checkbox' form={form} name='trackManufacturingDate' label='Track Manufacturing date' />
                        </div>
                    }
                    <FormInputField type='checkbox' form={form} name='isMaintainSerial' label='Is Maintain Serial' />
                    <FormInputField type='checkbox' form={form} name='hasBom' label='Alter components(BOM)' />
                </div>
            ))}
        </>
    )
}



const UnitManagement = ({ form }: FormProps) => {
    const { config } = useStockItem();
    const gapClass = 'grid grid-cols-[200px_1fr]! gap-x-0   justify-start '
    const gapReverseClass = 'grid grid-cols-[100px_1fr]!   gap-x-2   justify-start '

    const alternateStockUnitId = form.watch('alternateStockUnitId')
    const stockUnitId = form.watch('stockUnitId')
    const StockUnit = form.getValues('stockUnit')
    const AlternateStockUnit = form.getValues('alternateStockUnit')
    const StockUnitCode =
        StockUnit?.unitType === "compound"
            ? StockUnit?.secondaryStockUnit?.code ?? ""
            : StockUnit?.code ?? "";

    const AlternateStockUnitCode =
        AlternateStockUnit?.unitType === "compound"
            ? AlternateStockUnit?.secondaryStockUnit?.code ?? ""
            : AlternateStockUnit?.code ?? "";
    useEffect(() => {

        const basePrimaryUnitId = StockUnit?.unitType === "compound"
            ? StockUnit?.primaryStockUnitId
            : StockUnit?.id;
        // console.log("C", StockUnit)

        const baseSecondaryUnitId =
            StockUnit?.unitType === "compound" ? StockUnit?.secondaryStockUnit?.id ?? null : null;

        const alternatePrimaryUnitId = AlternateStockUnit?.unitType === "compound"
            ? AlternateStockUnit?.primaryStockUnitId
            : AlternateStockUnit?.id;

        const alternateSecondaryId =
            AlternateStockUnit?.unitType === "compound" ? AlternateStockUnit?.secondaryStockUnit?.id ?? null : null;

        // Collect only truthy IDs
        const ids = [basePrimaryUnitId, baseSecondaryUnitId, alternatePrimaryUnitId, alternateSecondaryId].filter(Boolean);

        // Check for duplicates
        const hasDuplicates = new Set(ids).size !== ids.length;


        if (hasDuplicates) {
            form.setError("root", {
                type: "manual",
                message: "Unit selections cannot share the same stock unit.",
            });
        } else {
            form.clearErrors("root");
        }
    }, [alternateStockUnitId, stockUnitId, form]);
    return (
        <div className='space-y-2 py-6 min-h-[200px]  '>
            <StockUnitDropdown form={form} config={config} gapClass={gapClass} />
            {/* Show message if 'alternate_units' config is set to false
             Configured to hide Alternate Units field */}
            {stockUnitId && config.map((item) => item.key === 'alternate_units' && item.value && (
                <div key={item.key} className="">
                    <div className='text-md   text-orange-950 py-2 text-center'> * To add Alternate Units, please select the Alternate Units field.</div>
                    <AlternateStockUnitDropdown form={form} config={config} gapClass={gapClass} />
                </div>
            ))}
            {
                stockUnitId && alternateStockUnitId &&

                <div className='grid grid-cols-[150px_1fr] items-center'>
                    <div className='text-right text-md pr-4'>Where</div>
                    <div className='grid grid-cols-[1fr_20px_1fr] gap-x-2'>

                        <div>
                            <FormInputField type='text' form={form} rtl={true} gapClass={gapReverseClass} name='alternateUnitValue' label={AlternateStockUnitCode} />
                        </div>
                        <div className='text-2xl text-center'>=</div>
                        <div>
                            <FormInputField type='text' form={form} rtl={true} gapClass={gapReverseClass} name='baseUnitValue' label={StockUnitCode} />
                        </div>

                    </div>
                </div>
            }
            {form.formState.errors.root && (
                <div className="mb-4 p-3 bg-red-50 border border-red-400 text-red-700 rounded-md text-sm flex items-center">
                    <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-4.75a.75.75 0 11-1.5 0v-4a.75.75 0 011.5 0v4zm0-6a.75.75 0 11-1.5 0V7a.75.75 0 011.5 0v.25z"
                            clipRule="evenodd"
                        />
                    </svg>
                    {form.formState.errors.root.message}
                </div>
            )}
        </div>
    )
}



const RateManagement = ({ form }: FormProps) => {
    const gapClass = 'grid grid-cols-[250px_1fr]! gap-x-0   justify-start '
    return (
        <div className='py-2 space-y-2'>
            <FormInputField type='number' gapClass={gapClass} form={form} name='mrp' label='Mrp' />
            <FormInputField type='number' gapClass={gapClass} form={form} name='standardCost' label='Standard Cost' />
            <FormInputField type='number' gapClass={gapClass} form={form} name='standardSellingPrice' label='Standard selling price' />
        </div>
    )

}
const GstManagement = ({ form }: FormProps) => {
    const gapClass = 'grid grid-cols-[200px_1fr]! gap-x-0   justify-start '
    const isGstApplicable = form.watch('isGstApplicable')
    return (
        <>
            <FormInputField type='checkbox' gapClass={gapClass} disabled={false} form={form} name='isGstApplicable' label='Is Gst Applicable' options={[
                { label: 'Yes', value: true },
                { label: 'No', value: false },
            ]} />
            {
                isGstApplicable &&
                <div className={`space-y-2`}>

                    <FormInputField type='text' form={form} gapClass={gapClass} name='gstType' label='Gst Type' />
                    <FormInputField type='text' form={form} gapClass={gapClass} name='rateOfDuty' label='Rate Of Duty' />
                    <FormInputField type='checkbox' form={form} gapClass={gapClass} name='isGstInclusive' label='Gst Inclusive' />
                </div>
            }
            <FormInputField type='text' form={form} gapClass={gapClass} name='hsnSacCode' label='Hsn/Sac code' />
        </>
    )
}
'use client'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'

import FormInputField from '@/components/form-input-field'
import {
    Dialog,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Route as StorageUnitRoute } from '@/routes/_protected/masters/inventory/_layout/storage_unit/_layout'

import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { useForm, type Resolver } from 'react-hook-form'
import { useStorageUnitMutation } from '../data/queryOptions'
import { formSchema, type StorageUnit, type StorageUnitForm } from '../data/schema'


import StorageUnitTypeSheet from './dropdown/storage_unit_type-sheet'
import StorageUnitCategorySheet from './dropdown/storage_unit_category-sheet'
import ParentStorageUnitSheet from './dropdown/parent_storage_unit-sheet'
import { lowerCase } from 'lodash'
import AddressEntryForm from '../sub-components/address-entry-form'



interface Props {
    currentRow?: StorageUnit
}
export function FormAction({ currentRow }: Props) {
    const isEdit = !!currentRow
    const navigate = useNavigate()
    const gapClass = "grid grid-cols-[200px_1fr] items-center space-y-0 gap-x-4 "
    const { mutate: saveStorageUnit, isPending } = useStorageUnitMutation()

    const form = useForm<StorageUnitForm>({
        resolver: zodResolver(formSchema) as Resolver<StorageUnitForm>,
        defaultValues: isEdit
            ? { ...currentRow, isEdit }
            : {
                name: '',
                code: '',
                storageUnitType: 'GODOWN',
                storageUnitCategory: 'PHYSICAL',
                parentId: undefined,
                isVirtual: false,
                isMobile: false,
                capacityValue: undefined,
                capacityUnitId: 16,
                temperatureMin: undefined,
                temperatureMax: undefined,
                ourStockWithThirdParty: false,
                thirdPartyStockWithUs: false,
                description: '',
                status: 'active',
                address: {
                    line1: '',
                    line2: '',
                    landmark: '',
                    postOffice: '',
                    district: '',
                    city: '',
                    postalCode: '',
                    stateId: 36,
                    countryId: 76,
                    isPrimary: false,
                },
                isEdit,
            },
    })
    //  const storageunitStatusOptions: ActiveInactiveStatus[] = ['active', 'inactive'];

    const moduleName = 'StorageUnit'
    const onSubmit = (values: StorageUnitForm) => {


        saveStorageUnit(currentRow ? { ...values, id: currentRow.id! } : values, {
            onSuccess: () => {
                form.reset()
                navigate({ to: StorageUnitRoute.to })
            },
        })
    }

    return (
        <Dialog>
            <DialogHeader className="text-left">
                <DialogTitle>
                    {isEdit ? 'Edit ' : 'Add New '} {moduleName}
                </DialogTitle>
                <DialogDescription>
                    {isEdit
                        ? `Update the ${lowerCase(moduleName)} here. `
                        : `Create new ${lowerCase(moduleName)} here. `}
                    Click save when you&apos;re done.
                </DialogDescription>
            </DialogHeader>

            <div className="-mr-4 h-full w-full overflow-y-auto py-1 pr-4">
                <Form {...form}>
                    <form
                        id="user-form"
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4 p-0.5"
                    >
                        <div className="grid grid-cols-2 items-start gap-6">
                            <div className="space-y-4">
                                <FormInputField
                                    type="text"
                                    form={form}
                                    name="name"
                                    label="Name"
                                    gapClass={gapClass}
                                />
                                <FormInputField
                                    type="text"
                                    form={form}
                                    name="code"
                                    label="Code"
                                    gapClass={gapClass}
                                />
                                <ParentStorageUnitSheet form={form} gapClass={gapClass} />
                                <StorageUnitTypeSheet form={form} gapClass={gapClass} />
                                <StorageUnitCategorySheet form={form} gapClass={gapClass} />


                                <FormInputField
                                    type="checkbox"
                                    form={form}
                                    name="isMobile"
                                    label="Is Mobile"
                                />
                                <FormInputField
                                    type="checkbox"
                                    form={form}
                                    name="isVirtual"
                                    label="Is Virtual"
                                />

                                <FormInputField
                                    type="checkbox"
                                    form={form}
                                    name="ourStockWithThirdParty"
                                    label="Our Stock With Third Party"
                                />
                                <FormInputField
                                    type="checkbox"
                                    form={form}
                                    name="thirdPartyStockWithUs"
                                    label="Third Party Stock With Us"
                                />





                                <FormInputField
                                    type="checkbox"
                                    form={form}
                                    name="status"
                                    label="Status"
                                    options={[
                                        { label: 'Active', value: 'active' },
                                        { label: 'Inactive', value: 'inactive' },
                                    ]}
                                />
                            </div>
                            <div className="space-y-4">

                                {
                                    ['warehouse', 'storage', 'location', 'godown']
                                        .includes(lowerCase(form.watch('storageUnitType') as string))
                                    && <AddressEntryForm form={form} />
                                }
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
            <DialogFooter>
                <Button type="submit" form="user-form" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isPending ? 'Saving...' : 'Save changes'}
                </Button>
            </DialogFooter>
        </Dialog>
    )
}
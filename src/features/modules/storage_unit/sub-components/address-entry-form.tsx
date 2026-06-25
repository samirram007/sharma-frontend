import { Form, useForm, type Resolver, type UseFormReturn } from 'react-hook-form'

import FormInputField from '@/components/form-input-field'

import type { StorageUnitForm } from '../data/schema'

import StateSheet from '../components/dropdown/state-sheet'
import CountrySheet from '../components/dropdown/country-sheet'

import { zodResolver } from '@hookform/resolvers/zod'

import { formSchema, type AddressForm } from '../../address/data/schema'
import { Activity, useEffect } from 'react'



type FormProps = {
    form: UseFormReturn<StorageUnitForm>
}
const AddressEntryForm = (props: FormProps) => {
    const { form } = props as FormProps
    const gapClass = 'gap-4'
    const addressForm = useForm<AddressForm>(
        {
            resolver: zodResolver(formSchema) as Resolver<AddressForm>,
            defaultValues: form.getValues('address') || {} as AddressForm,
            mode: 'onChange',
        },

    )

    useEffect(() => {
        form.setValue('address', addressForm.getValues())
    }, [addressForm.getValues()])
    return (
        <Form {...addressForm}>


            <div className="grid grid-cols-1 grid-rows-[auto_auto_auto] gap-4 border rounded-lg p-2">
                <h3 className=" font-semibold text-md  ">Address </h3>

                <div className="grid grid-rows-3 gap-4">
                    <FormInputField
                        type="text"
                        gapClass={gapClass}
                        form={addressForm}
                        name="line1"
                        label="Address Line 1"
                    />
                    <FormInputField
                        type="text"
                        gapClass={gapClass}
                        form={addressForm}
                        name="line2"
                        label="Address Line 2"
                    />
                    <FormInputField
                        type="text"
                        gapClass={gapClass}
                        form={addressForm}
                        name="landmark"
                        label="Landmark"
                    />

                    <FormInputField
                        type="text"
                        gapClass={gapClass}
                        form={addressForm}
                        name="postOffice"
                        label="PO"
                    />
                    <FormInputField
                        type="text"
                        gapClass={gapClass}
                        form={addressForm}
                        name="district"
                        label="District"
                    />

                    <FormInputField
                        type="text"
                        gapClass={gapClass}
                        form={addressForm}
                        name="city"
                        label="City"
                    />
                    <FormInputField
                        type="text"
                        gapClass={gapClass}
                        form={addressForm}
                        name="postalCode"
                        label="Postal Code"
                    />

                    <StateSheet form={addressForm} gapClass={gapClass} />
                    <CountrySheet form={addressForm} gapClass={gapClass} />

                    <Activity mode='hidden' >

                        <FormInputField
                            type="checkbox"
                            form={addressForm}
                            name="isPrimary"
                            label="Is Primary Address?"
                        />
                    </Activity>

                </div>
            </div>
        </Form>
    )
}

export default AddressEntryForm

import type { UseFormReturn } from "react-hook-form";

import FormInputField from "@/components/form-input-field";
import type { EmployeeForm } from "../../data/schema";
import CountryDropdown from "../dropdown/country-dropdown";
import StateDropdown from "../dropdown/state-dropdown";




type FormProps = {
    form: UseFormReturn<EmployeeForm>;
};
const AddressForm = (props: FormProps) => {
    const { form } = props as FormProps;
    const gapClass = "grid grid-cols-1 gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-4"
    // const gapClass2 = "grid grid-cols-[80px_1fr] gap-2"
    return (
        <div className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200/70 bg-white p-3 shadow-sm dark:border-white/8 dark:bg-card">
            <h3 className=" font-semibold text-md  ">Address</h3>

            <div className="grid grid-cols-1 gap-4">
                <FormInputField type="text" gapClass={gapClass} form={form} name="address.line1" label="Address Line 1" />
                <FormInputField type="text" gapClass={gapClass} form={form} name="address.line2" label="Address Line 2" />
                <FormInputField type="text" gapClass={gapClass} form={form} name="address.landmark" label="Landmark" />

                <FormInputField type="text" gapClass={gapClass} form={form} name="address.postOffice" label="PO" />
                <FormInputField type="text" gapClass={gapClass} form={form} name="address.district" label="District" />


                <FormInputField type="text" gapClass={gapClass} form={form} name="address.city" label="City" />
                <FormInputField type="text" gapClass={gapClass} form={form} name="address.postalCode" label="Postal Code" />

                <StateDropdown form={form} gapClass={gapClass} />
                <CountryDropdown form={form} gapClass={gapClass} />


                <FormInputField type="checkbox" form={form} name="address.isPrimary" label="Is Primary Address?" />
            </div>

        </div>

    )
}

export default AddressForm
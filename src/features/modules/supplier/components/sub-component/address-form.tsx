
import type { UseFormReturn } from "react-hook-form";

import FormInputField from "@/components/form-input-field";
import type { SupplierForm } from "../../data/schema";
import CountryDropdown from "../dropdown/country-dropdown";
import StateDropdown from "../dropdown/state-dropdown";




type FormProps = {
    form: UseFormReturn<SupplierForm>;
    labelLayoutClass?: string;
};
const AddressForm = (props: FormProps) => {
    const { form } = props as FormProps;
    const { labelLayoutClass } = props as FormProps;
    const gapClass = labelLayoutClass ?? "sm:grid-cols-[150px_1fr]"

    return (
        <section className="space-y-4 rounded-md border border-slate-200/70 bg-white p-3 sm:p-4 dark:border-white/[0.07] dark:bg-white/[0.06]">
            <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Address</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Registered address and jurisdiction details used for supplier records.</p>
            </div>

            <div className="space-y-4">
                <FormInputField type="text" gapClass={gapClass} form={form} name="address.line1" label="Address Line 1" />
                <FormInputField type="text" gapClass={gapClass} form={form} name="address.line2" label="Address Line 2" />
                <FormInputField type="text" gapClass={gapClass} form={form} name="address.landmark" label="Landmark" />

                <FormInputField type="text" gapClass={gapClass} form={form} name="address.city" label="City" />
                <StateDropdown form={form} gapClass={gapClass} />
                <CountryDropdown form={form} gapClass={gapClass} />

                <FormInputField type="text" gapClass={gapClass} form={form} name="address.postalCode" label="Postal Code" />
                <FormInputField type="checkbox" gapClass={gapClass} form={form} name="address.isPrimary" label="Is Primary Address" />
            </div>

        </section>

    )
}

export default AddressForm
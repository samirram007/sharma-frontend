// import type { UseFormReturn } from 'react-hook-form'

// import FormInputField from '@/components/form-input-field'

// import type { CompanyForm } from '../data/schema'
// import StateDropdown from '../components/dropdown/state-dropdown'
// import CountryDropdown from '../components/dropdown/country-dropdown'

// type FormProps = {
//     form: UseFormReturn<CompanyForm>
// }
// const AddressForm = (props: FormProps) => {
//     const { form } = props as FormProps
//     const gapClass = 'gap-4'
//     // const gapClass2 = "grid grid-cols-[80px_1fr] gap-2"
//     return (
//         <div className="grid grid-cols-1 grid-rows-[auto_auto_auto] gap-4 border rounded-lg p-2">
//             <h3 className=" font-semibold text-md  ">Address</h3>

//             <div className="grid grid-rows-3 gap-4">
//                 <FormInputField
//                     type="text"
//                     gapClass={gapClass}
//                     form={form}
//                     name="address.line1"
//                     label="Address Line 1"
//                 />
//                 <FormInputField
//                     type="text"
//                     gapClass={gapClass}
//                     form={form}
//                     name="address.line2"
//                     label="Address Line 2"
//                 />
//                 <FormInputField
//                     type="text"
//                     gapClass={gapClass}
//                     form={form}
//                     name="address.landmark"
//                     label="Landmark"
//                 />

//                 <FormInputField
//                     type="text"
//                     gapClass={gapClass}
//                     form={form}
//                     name="address.postOffice"
//                     label="PO"
//                 />
//                 <FormInputField
//                     type="text"
//                     gapClass={gapClass}
//                     form={form}
//                     name="address.district"
//                     label="District"
//                 />

//                 <FormInputField
//                     type="text"
//                     gapClass={gapClass}
//                     form={form}
//                     name="address.city"
//                     label="City"
//                 />
//                 <FormInputField
//                     type="text"
//                     gapClass={gapClass}
//                     form={form}
//                     name="address.postalCode"
//                     label="Postal Code"
//                 />

//                 <StateDropdown form={form} gapClass={gapClass} />
//                 <CountryDropdown form={form} gapClass={gapClass} />

//                 <FormInputField
//                     type="checkbox"
//                     form={form}
//                     name="address.isPrimary"
//                     label="Is Primary Address?"
//                 />
//             </div>
//         </div>
//     )
// }

// export default AddressForm

import type { UseFormReturn } from 'react-hook-form'

import FormInputField from '@/components/form-input-field'

import type { CompanyForm } from '../data/schema'
import StateDropdown from '../components/dropdown/state-dropdown'
import CountryDropdown from '../components/dropdown/country-dropdown'

type FormProps = {
  form: UseFormReturn<CompanyForm>
  labelLayoutClass?: string
  plain?: boolean
}
const AddressForm = (props: FormProps) => {
  const { form, labelLayoutClass, plain = false } = props as FormProps
  const gapClass = `${labelLayoutClass ?? ''} gap-4`
  // const gapClass2 = "grid grid-cols-[80px_1fr] gap-2"
  return (
    <div
      className={
        plain
          ? 'grid grid-cols-1 gap-4'
          : 'grid grid-cols-1 grid-rows-[auto_auto_auto] gap-4 border rounded-lg p-2'
      }
    >
      {!plain && <h3 className=" font-semibold text-md  ">Address</h3>}

      <div className="grid grid-rows-3 gap-4">
        <FormInputField
          type="text"
          gapClass={gapClass}
          form={form}
          name="address.line1"
          label="Address Line 1"
        />
        <FormInputField
          type="text"
          gapClass={gapClass}
          form={form}
          name="address.line2"
          label="Address Line 2"
        />
        <FormInputField
          type="text"
          gapClass={gapClass}
          form={form}
          name="address.landmark"
          label="Landmark"
        />

        <FormInputField
          type="text"
          gapClass={gapClass}
          form={form}
          name="address.postOffice"
          label="PO"
        />
        <FormInputField
          type="text"
          gapClass={gapClass}
          form={form}
          name="address.district"
          label="District"
        />

        <FormInputField
          type="text"
          gapClass={gapClass}
          form={form}
          name="address.city"
          label="City"
        />
        <FormInputField
          type="text"
          gapClass={gapClass}
          form={form}
          name="address.postalCode"
          label="Postal Code"
        />

        <StateDropdown form={form} gapClass={gapClass} />
        <CountryDropdown form={form} gapClass={gapClass} />

        <FormInputField
          type="checkbox"
          form={form}
          name="address.isPrimary"
          label="Is Primary Address?"
        />
      </div>
    </div>
  )
}

export default AddressForm

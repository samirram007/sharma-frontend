import type { UseFormReturn } from 'react-hook-form'

import FormInputField from '@/components/form-input-field'
import type { EmployeeForm } from '../../data/schema'
import CountryDropdown from '../dropdown/country-dropdown'
import StateDropdown from '../dropdown/state-dropdown'

type FormProps = {
  form: UseFormReturn<EmployeeForm>
}

const sectionClass =
  'space-y-4 rounded-md border border-slate-200/70 bg-white p-3 sm:p-4 shadow-sm dark:border-white/8 dark:bg-card'
const headingClass = 'text-sm font-semibold text-slate-800 dark:text-slate-200'
const subHeadingClass = 'text-xs text-slate-500 dark:text-slate-400'
const fieldGridClass = 'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-6'

const AddressForm = (props: FormProps) => {
  const { form } = props as FormProps
  const gapClass =
    'grid grid-cols-1 gap-2 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-4'
  return (
    <section className={sectionClass}>
      <div className="space-y-1">
        <h3 className={headingClass}>Address</h3>
        <p className={subHeadingClass}>
          Residential address used for correspondence and statutory records.
        </p>
      </div>

      <div className={fieldGridClass}>
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
          label="Post Office"
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
          gapClass={gapClass}
          form={form}
          name="address.isPrimary"
          label="Is Primary Address?"
        />
      </div>
    </section>
  )
}

export default AddressForm
